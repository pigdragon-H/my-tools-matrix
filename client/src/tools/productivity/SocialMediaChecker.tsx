// ============================================================
// SocialMediaChecker.tsx - 社群媒體字數與 Emoji 檢查器
// ============================================================
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, Copy, Check, AlertCircle, CheckCircle2 } from "lucide-react";

interface Platform {
  name: string;
  limit: number;
  icon: string;
  color: string;
  notes: string;
}

const PLATFORMS: Platform[] = [
  { name: "X (Twitter)", limit: 280, icon: "𝕏", color: "bg-black text-white", notes: "中文字算 2 個字元" },
  { name: "Threads", limit: 500, icon: "🧵", color: "bg-black text-white", notes: "每則最多 500 字元" },
  { name: "Instagram", limit: 2200, icon: "📸", color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white", notes: "限制 2200 字元，Hashtag 最多 30 個" },
  { name: "Facebook", limit: 63206, icon: "👍", color: "bg-blue-600 text-white", notes: "幾乎無限制，但建議 80 字以內" },
  { name: "LinkedIn", limit: 3000, icon: "💼", color: "bg-blue-700 text-white", notes: "貼文 3000 字元，文章 125000 字元" },
  { name: "YouTube", limit: 5000, icon: "▶️", color: "bg-red-600 text-white", notes: "影片說明欄最多 5000 字元" },
];

function countEmoji(text: string): number {
  // Count emoji using surrogate pair detection (ES5 compatible, no u flag)
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Surrogate pairs (most emoji): 0xD800-0xDBFF followed by 0xDC00-0xDFFF
    if (code >= 0xD800 && code <= 0xDBFF) {
      count++;
      i++; // skip low surrogate
    } else if (code >= 0x2600 && code <= 0x27BF) {
      count++; // Misc symbols
    }
  }
  return count;
}

function countHashtags(text: string): number {
  return (text.match(/#[\w\u4e00-\u9fff]+/g) || []).length;
}

function countMentions(text: string): number {
  return (text.match(/@[\w]+/g) || []).length;
}

// X 計算方式：中文/日文/韓文算 2 個字元
function countXChars(text: string): number {
  let count = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (code >= 0x4e00 && code <= 0x9fff) count += 2;
    else if (code >= 0x3000 && code <= 0x303f) count += 2;
    else if (code >= 0xff00 && code <= 0xffef) count += 2;
    else count += 1;
  }
  return count;
}

export default function SocialMediaChecker() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const chars = text.length;
    const xChars = countXChars(text);
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split("\n").length;
    const emojis = countEmoji(text);
    const hashtags = countHashtags(text);
    const mentions = countMentions(text);
    const urls = (text.match(/https?:\/\/\S+/g) || []).length;
    return { chars, xChars, words, lines, emojis, hashtags, mentions, urls };
  }, [text]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlatformCount = (platform: Platform) => {
    if (platform.name === "X (Twitter)") return stats.xChars;
    return stats.chars;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          社群媒體字數與 Emoji 檢查器
        </h1>
        <p className="text-muted-foreground mt-1">即時檢查各平台字數限制，確保貼文符合規範</p>
      </div>

      {/* 文字輸入區 */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">輸入貼文內容</span>
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={!text}>
              {copied ? <><Check className="h-3 w-3 mr-1" />已複製</> : <><Copy className="h-3 w-3 mr-1" />複製</>}
            </Button>
          </div>
          <Textarea
            placeholder="在此輸入你的貼文內容..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[160px] text-base"
          />
        </CardContent>
      </Card>

      {/* 統計數字 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "字元數", value: stats.chars },
          { label: "X 字元數", value: stats.xChars },
          { label: "Emoji 數", value: stats.emojis },
          { label: "Hashtag 數", value: stats.hashtags },
          { label: "Mention 數", value: stats.mentions },
          { label: "URL 數", value: stats.urls },
          { label: "行數", value: stats.lines },
          { label: "詞數", value: stats.words },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-3 pb-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 各平台限制 */}
      <div className="space-y-3">
        <h2 className="font-semibold text-base">各平台字數狀態</h2>
        {PLATFORMS.map((platform) => {
          const count = getPlatformCount(platform);
          const pct = Math.min((count / platform.limit) * 100, 100);
          const isOver = count > platform.limit;
          const isWarning = pct > 80 && !isOver;

          return (
            <Card key={platform.name} className={isOver ? "border-destructive/50" : ""}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{platform.icon}</span>
                    <span className="font-medium text-sm">{platform.name}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">{platform.notes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-mono ${isOver ? "text-destructive font-bold" : ""}`}>
                      {count} / {platform.limit.toLocaleString()}
                    </span>
                    {isOver
                      ? <AlertCircle className="h-4 w-4 text-destructive" />
                      : <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    }
                  </div>
                </div>
                <Progress
                  value={pct}
                  className={`h-2 ${isOver ? "[&>div]:bg-destructive" : isWarning ? "[&>div]:bg-amber-500" : ""}`}
                />
                {isOver && (
                  <p className="text-xs text-destructive mt-1">超出 {count - platform.limit} 個字元，需要刪減</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Instagram Hashtag 提醒 */}
      {stats.hashtags > 30 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>Instagram 貼文最多只能使用 30 個 Hashtag，目前使用了 {stats.hashtags} 個，請刪減 {stats.hashtags - 30} 個。</p>
        </div>
      )}
    </div>
  );
}
