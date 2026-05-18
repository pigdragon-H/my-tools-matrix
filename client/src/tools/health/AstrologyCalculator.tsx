// ============================================================
// AstrologyCalculator.tsx - 人類圖 / 星盤基礎查詢
// ============================================================
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, Info } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

// 星座判斷
function getZodiacSign(month: number, day: number): { sign: string; symbol: string; element: string; quality: string; desc: string } {
  const signs = [
    { sign: "摩羯座", symbol: "♑", start: [12, 22], end: [1, 19], element: "土", quality: "基本", desc: "務實、有責任感、有耐心，善於長期規劃" },
    { sign: "水瓶座", symbol: "♒", start: [1, 20], end: [2, 18], element: "風", quality: "固定", desc: "獨立、創新、人道主義，思維超前" },
    { sign: "雙魚座", symbol: "♓", start: [2, 19], end: [3, 20], element: "水", quality: "變動", desc: "敏感、直覺強、富有同情心，充滿想像力" },
    { sign: "牡羊座", symbol: "♈", start: [3, 21], end: [4, 19], element: "火", quality: "基本", desc: "勇敢、有活力、積極進取，天生領導者" },
    { sign: "金牛座", symbol: "♉", start: [4, 20], end: [5, 20], element: "土", quality: "固定", desc: "穩定、可靠、享受生活，重視物質安全感" },
    { sign: "雙子座", symbol: "♊", start: [5, 21], end: [6, 20], element: "風", quality: "變動", desc: "靈活、好奇、溝通能力強，適應力佳" },
    { sign: "巨蟹座", symbol: "♋", start: [6, 21], end: [7, 22], element: "水", quality: "基本", desc: "情感豐富、保護欲強、重視家庭，直覺敏銳" },
    { sign: "獅子座", symbol: "♌", start: [7, 23], end: [8, 22], element: "火", quality: "固定", desc: "自信、慷慨、有創造力，天生的表演者" },
    { sign: "處女座", symbol: "♍", start: [8, 23], end: [9, 22], element: "土", quality: "變動", desc: "細心、分析力強、追求完美，實際可靠" },
    { sign: "天秤座", symbol: "♎", start: [9, 23], end: [10, 22], element: "風", quality: "基本", desc: "公平、優雅、重視和諧，天生外交家" },
    { sign: "天蠍座", symbol: "♏", start: [10, 23], end: [11, 21], element: "水", quality: "固定", desc: "深刻、神秘、意志力強，洞察力超群" },
    { sign: "射手座", symbol: "♐", start: [11, 22], end: [12, 21], element: "火", quality: "變動", desc: "樂觀、自由、哲學思維，熱愛探索冒險" },
  ];

  for (const s of signs) {
    const [sm, sd] = s.start;
    const [em, ed] = s.end;
    if ((month === sm && day >= sd) || (month === em && day <= ed)) {
      return s;
    }
  }
  return signs[0]; // 摩羯座（跨年）
}

// 人類圖類型（簡化版，基於出生年份）
function getHumanDesignType(year: number, month: number, day: number): { type: string; strategy: string; authority: string; desc: string } {
  // 簡化計算：基於出生日期的數字學
  const sum = (year + month + day) % 5;
  const types = [
    { type: "生產者", strategy: "等待回應", authority: "薦骨權威", desc: "你是世界的建造者，當生活中出現值得回應的事物時，你的薦骨會給出清晰的是或否。學會等待回應，而非主動發起。" },
    { type: "顯示者", strategy: "告知", authority: "情緒權威", desc: "你是世界的先行者，有能力獨立發起行動。在採取重要行動前，告知相關的人，可以減少阻力並獲得支持。" },
    { type: "顯示生產者", strategy: "等待回應後告知", authority: "薦骨權威", desc: "你結合了顯示者的速度與生產者的持久力。等待正確的回應，然後快速行動，但記得告知他人你的計畫。" },
    { type: "投射者", strategy: "等待邀請", authority: "脾臟權威", desc: "你是天生的嚮導，能看見他人的潛力。等待正確的邀請，你的智慧才能被真正接受和欣賞。" },
    { type: "反映者", strategy: "等待月亮週期", authority: "月亮週期", desc: "你是社群的鏡子，反映出周圍環境的健康狀況。在做重大決定前，等待完整的月亮週期（約 29 天）。" },
  ];
  return types[sum];
}

// 生命靈數
function getLifePathNumber(year: number, month: number, day: number): { number: number; meaning: string } {
  let sum = Array.from(`${year}${month}${day}`).reduce((acc, d) => acc + parseInt(d), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = Array.from(`${sum}`).reduce((acc, d) => acc + parseInt(d), 0);
  }
  const meanings: Record<number, string> = {
    1: "領導者 — 獨立、自信、有開創精神",
    2: "合作者 — 敏感、外交、重視和諧",
    3: "創造者 — 表達力強、樂觀、充滿創意",
    4: "建造者 — 務實、有組織、可靠穩定",
    5: "自由者 — 適應力強、好奇、熱愛變化",
    6: "照顧者 — 負責任、有愛心、重視家庭",
    7: "探索者 — 分析力強、直覺、追求真理",
    8: "成就者 — 有野心、領導力強、物質成功",
    9: "人道主義者 — 慷慨、有同情心、智慧",
    11: "直覺大師 — 靈性覺醒、高度直覺、啟發他人",
    22: "建造大師 — 宏大願景、實踐能力、留下遺產",
    33: "療癒大師 — 無私奉獻、療癒他人、精神導師",
  };
  return { number: sum, meaning: meanings[sum] ?? "獨特的靈魂旅程" };
}

export default function AstrologyCalculator() {
  const [birthDate, setBirthDate] = useState("1990-01-15");
  const [birthTime, setBirthTime] = useState("08:00");
  const [birthPlace, setBirthPlace] = useState("台北");
  const { isAuthenticated } = useAuth();
  const saveMutation = trpc.tools.saveResult.useMutation();

  const result = useMemo(() => {
    if (!birthDate) return null;
    const [year, month, day] = birthDate.split("-").map(Number);
    const zodiac = getZodiacSign(month, day);
    const hdType = getHumanDesignType(year, month, day);
    const lifePath = getLifePathNumber(year, month, day);
    return { zodiac, hdType, lifePath, year, month, day };
  }, [birthDate]);

  const handleSave = () => {
    if (!isAuthenticated || !result) return;
    saveMutation.mutate({
      toolId: "astrology-calculator",
      category: "health",
      inputParams: { birthDate, birthTime, birthPlace },
      result: {
        zodiac: result.zodiac.sign,
        hdType: result.hdType.type,
        lifePathNumber: result.lifePath.number,
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          人類圖 ／ 星盤基礎查詢
        </h1>
        <p className="text-muted-foreground mt-1">輸入出生資訊，獲取星座、人類圖類型與生命靈數的基礎解析</p>
      </div>

      <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-xs text-purple-700 dark:text-purple-400 flex items-start gap-2">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>本工具提供基礎解析，人類圖完整分析需要精確的出生時間與地點。星盤解析僅供娛樂與自我探索，不構成任何建議。</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">出生資訊</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label>出生日期</Label>
            <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>出生時間（選填）</Label>
            <Input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>出生地點（選填）</Label>
            <Input type="text" placeholder="例：台北市" value={birthPlace} onChange={(e) => setBirthPlace(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          {/* 星座 */}
          <Card className="border-amber-300 dark:border-amber-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{result.zodiac.symbol}</span>
                <div>
                  <CardTitle className="text-lg">{result.zodiac.sign}</CardTitle>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{result.zodiac.element}象星座</Badge>
                    <Badge variant="outline">{result.zodiac.quality}宮</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{result.zodiac.desc}</p>
            </CardContent>
          </Card>

          {/* 人類圖 */}
          <Card className="border-purple-300 dark:border-purple-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  人類圖類型
                </CardTitle>
                <Badge className="bg-purple-500">{result.hdType.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted rounded p-3">
                  <p className="text-xs text-muted-foreground">人生策略</p>
                  <p className="font-medium text-sm">{result.hdType.strategy}</p>
                </div>
                <div className="bg-muted rounded p-3">
                  <p className="text-xs text-muted-foreground">內在權威</p>
                  <p className="font-medium text-sm">{result.hdType.authority}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{result.hdType.desc}</p>
            </CardContent>
          </Card>

          {/* 生命靈數 */}
          <Card className="border-blue-300 dark:border-blue-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4 text-blue-500" />
                  生命靈數
                </CardTitle>
                <span className="text-3xl font-bold text-blue-500">{result.lifePath.number}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{result.lifePath.meaning}</p>
              <p className="text-xs text-muted-foreground mt-2">
                計算方式：{result.year} + {result.month} + {result.day} 的各位數字相加，化簡至個位數
              </p>
            </CardContent>
          </Card>
        </>
      )}

      <Button onClick={handleSave} disabled={!isAuthenticated || !result} className="w-full sm:w-auto">
        {isAuthenticated ? "儲存查詢結果" : "登入後可儲存結果"}
      </Button>

      <Card className="bg-muted/30">
        <CardHeader><CardTitle className="text-sm">延伸閱讀</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <a href="/blog/health/tdee-fat-loss-guide" className="block text-sm text-primary hover:underline">
            → 了解自己的身體：從 TDEE 開始的健康管理
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
