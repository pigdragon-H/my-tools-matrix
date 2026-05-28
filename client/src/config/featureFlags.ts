export function isEnabled(flag: string): boolean {
  const flags: Record<string, boolean> = {
    ENABLE_ADS: true,
  };
  return flags[flag] ?? false;
}
