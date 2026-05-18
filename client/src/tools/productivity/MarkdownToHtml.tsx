import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

// Lightweight Markdown to HTML converter (no external deps)
function mdToHtml(md: string): string {
  let html = md
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headings
    .replace(/^###### (.+)$/gm, "<h6>$1</h6>")
    .replace(/^##### (.+)$/gm, "<h5>$1</h5>")
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold & Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    // Strikethrough
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // Horizontal rule
    .replace(/^---$/gm, "<hr />")
    // Blockquote
    .replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>")
    // Unordered list
    .replace(/^[\*\-] (.+)$/gm, "<li>$1</li>")
    // Ordered list
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Code blocks
    .replace(/```[\w]*\n([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    // Paragraphs (double newline)
    .replace(/\n\n/g, "</p><p>")
    // Line breaks
    .replace(/\n/g, "<br />");

  return `<p>${html}</p>`;
}

const SYNTAX_HINTS = [
  { syntax: "# 標題", desc: "H1 標題" },
  { syntax: "## 標題", desc: "H2 標題" },
  { syntax: "**粗體**", desc: "粗體文字" },
  { syntax: "*斜體*", desc: "斜體文字" },
  { syntax: "`程式碼`", desc: "行內程式碼" },
  { syntax: "```\n程式碼區塊\n```", desc: "程式碼區塊" },
  { syntax: "- 項目", desc: "無序清單" },
  { syntax: "1. 項目", desc: "有序清單" },
  { syntax: "[文字](網址)", desc: "超連結" },
  { syntax: "![說明](圖片網址)", desc: "圖片" },
  { syntax: "> 引用文字", desc: "引用區塊" },
  { syntax: "---", desc: "水平分隔線" },
];

const DEFAULT_MD = `# 歡迎使用 Markdown 轉 HTML 工具

## 功能介紹

這是一個**即時預覽**的 Markdown 編輯器，支援以下語法：

- 標題（H1 ~ H6）
- **粗體**、*斜體*、~~刪除線~~
- 有序與無序清單
- \`行內程式碼\` 與程式碼區塊
- [超連結](https://example.com)
- 引用區塊

## 使用方式

1. 在左側輸入 Markdown 語法
2. 右側即時預覽 HTML 效果
3. 點選「複製 HTML」取得原始碼

> 提示：所有計算均在瀏覽器本地完成，資料不會上傳。

---

開始編輯吧！
`;

export default function MarkdownToHtml() {
  const [markdown, setMarkdown] = useState(DEFAULT_MD);
  const [tab, setTab] = useState("preview");

  const html = mdToHtml(markdown);

  const copyHtml = useCallback(() => {
    navigator.clipboard.writeText(html);
    toast.success("HTML 已複製到剪貼簿");
  }, [html]);

  const downloadHtml = useCallback(() => {
    const full = `<!DOCTYPE html>\n<html lang="zh-TW">\n<head><meta charset="UTF-8"><title>Document</title></head>\n<body>\n${html}\n</body>\n</html>`;
    const blob = new Blob([full], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "output.html";
    a.click();
    toast.success("HTML 檔案已下載");
  }, [html]);

  const wordCount = markdown.replace(/\s/g, "").length;
  const lineCount = markdown.split("\n").length;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Markdown 轉 HTML 排版工具</h1>
        <p className="text-muted-foreground mt-1">即時預覽、複製 HTML 輸出、常用語法提示</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant="secondary">{wordCount} 字元</Badge>
        <Badge variant="secondary">{lineCount} 行</Badge>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={copyHtml}>
            <Copy className="h-3 w-3 mr-1" /> 複製 HTML
          </Button>
          <Button size="sm" variant="outline" onClick={downloadHtml}>
            <Download className="h-3 w-3 mr-1" /> 下載 HTML
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2"><CardTitle className="text-base">Markdown 輸入</CardTitle></CardHeader>
          <CardContent className="flex-1">
            <textarea
              className="w-full h-96 font-mono text-sm bg-muted rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              value={markdown}
              onChange={e => setMarkdown(e.target.value)}
              spellCheck={false}
            />
          </CardContent>
        </Card>

        {/* Preview / HTML */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="preview">預覽</TabsTrigger>
                <TabsTrigger value="html">HTML 原始碼</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="flex-1">
            {tab === "preview" ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none h-96 overflow-y-auto p-3 bg-muted rounded-md"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <pre className="text-xs font-mono bg-muted rounded-md p-3 h-96 overflow-auto whitespace-pre-wrap break-all">
                {html}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Syntax hints */}
      <Card>
        <CardHeader><CardTitle className="text-base">常用語法速查</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {SYNTAX_HINTS.map(hint => (
              <button
                key={hint.syntax}
                className="text-left p-2 rounded-md border hover:bg-muted transition-colors"
                onClick={() => {
                  setMarkdown(prev => prev + "\n" + hint.syntax);
                  toast.success(`已插入：${hint.desc}`);
                }}
              >
                <div className="text-xs font-mono text-primary">{hint.syntax.split("\n")[0]}</div>
                <div className="text-xs text-muted-foreground">{hint.desc}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
