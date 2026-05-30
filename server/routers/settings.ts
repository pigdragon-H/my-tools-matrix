// ============================================================
// Settings Router — read/write site_settings table.
// Falls back to defaults if table doesn't exist yet.
// ============================================================
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { supabaseService } from "../lib/supabaseAdmin";

export type SiteSettings = {
  flags: {
    ENABLE_ADS: boolean;
    ENABLE_REAL_ADSENSE: boolean;
    ENABLE_AFFILIATE: boolean;
    ENABLE_PREMIUM: boolean;
    ENABLE_NEWSLETTER: boolean;
    ENABLE_TRUST_LINKS: boolean;
  };
  adsense: {
    publisherId: string;
  };
  premium: {
    proZh: string;
    proEn: string;
    teamZh: string;
    teamEn: string;
    agencyZh: string;
    agencyEn: string;
  };
  affiliate: {
    smartScale: string;
    fitnessTracker: string;
    decisionBooks: string;
    toolSubscription: string;
  };
};

export const DEFAULT_SETTINGS: SiteSettings = {
  flags: {
    ENABLE_ADS: true,
    ENABLE_REAL_ADSENSE: false,
    ENABLE_AFFILIATE: false,
    ENABLE_PREMIUM: false,
    ENABLE_NEWSLETTER: false,
    ENABLE_TRUST_LINKS: true,
  },
  adsense: {
    publisherId: "ca-pub-XXXXXXXXXXXXXXXX",
  },
  premium: {
    proZh: "NT$ 96 / 月",
    proEn: "$3 / month",
    teamZh: "NT$ 330 / 月",
    teamEn: "$9 / month",
    agencyZh: "NT$ 996 / 月",
    agencyEn: "$33 / month",
  },
  affiliate: {
    smartScale: "",
    fitnessTracker: "",
    decisionBooks: "",
    toolSubscription: "",
  },
};

const SettingsSchema = z.object({
  flags: z.object({
    ENABLE_ADS: z.boolean(),
    ENABLE_REAL_ADSENSE: z.boolean(),
    ENABLE_AFFILIATE: z.boolean(),
    ENABLE_PREMIUM: z.boolean(),
    ENABLE_NEWSLETTER: z.boolean(),
    ENABLE_TRUST_LINKS: z.boolean(),
  }),
  adsense: z.object({
    publisherId: z.string(),
  }),
  premium: z.object({
    proZh: z.string(),
    proEn: z.string(),
    teamZh: z.string(),
    teamEn: z.string(),
    agencyZh: z.string(),
    agencyEn: z.string(),
  }),
  affiliate: z.object({
    smartScale: z.string(),
    fitnessTracker: z.string(),
    decisionBooks: z.string(),
    toolSubscription: z.string(),
  }),
});

async function readSettings(): Promise<SiteSettings> {
  if (!supabaseService) return DEFAULT_SETTINGS;
  try {
    const { data, error } = await supabaseService
      .from("site_settings")
      .select("value")
      .eq("key", "global")
      .single();
    if (error || !data) return DEFAULT_SETTINGS;
    const parsed = SettingsSchema.safeParse(data.value);
    return parsed.success ? parsed.data : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function writeSettings(value: SiteSettings): Promise<boolean> {
  if (!supabaseService) return false;
  try {
    const { error } = await supabaseService
      .from("site_settings")
      .upsert(
        {
          key: "global",
          value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );
    return !error;
  } catch {
    return false;
  }
}

export const settingsRouter = router({
  /** Public — front-end uses this to drive feature flags. */
  get: publicProcedure.query(async () => readSettings()),

  /** Admin only — overwrites the whole settings blob. */
  update: adminProcedure
    .input(SettingsSchema)
    .mutation(async ({ input }) => {
      const ok = await writeSettings(input);
      return { success: ok };
    }),
});
