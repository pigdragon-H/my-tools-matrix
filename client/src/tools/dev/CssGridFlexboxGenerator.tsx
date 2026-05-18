import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy } from "lucide-react";
import { toast } from "sonner";

// --- GRID ---
export default function CssGridFlexboxGenerator() {
  const [mode, setMode] = useState<"grid" | "flex">("grid");

  // Grid state
  const [gridCols, setGridCols] = useState("3");
  const [gridRows, setGridRows] = useState("2");
  const [gridGap, setGridGap] = useState("16");
  const [gridColTemplate, setGridColTemplate] = useState("repeat(3, 1fr)");
  const [gridRowTemplate, setGridRowTemplate] = useState("auto");
  const [gridItems, setGridItems] = useState(6);

  // Flex state
  const [flexDir, setFlexDir] = useState("row");
  const [flexWrap, setFlexWrap] = useState("wrap");
  const [justifyContent, setJustifyContent] = useState("flex-start");
  const [alignItems, setAlignItems] = useState("stretch");
  const [flexGap, setFlexGap] = useState("16");
  const [flexItems, setFlexItems] = useState(6);

  const gridCss = useMemo(() => `display: grid;
grid-template-columns: ${gridColTemplate};
grid-template-rows: ${gridRowTemplate};
gap: ${gridGap}px;`, [gridColTemplate, gridRowTemplate, gridGap]);

  const flexCss = useMemo(() => `display: flex;
flex-direction: ${flexDir};
flex-wrap: ${flexWrap};
justify-content: ${justifyContent};
align-items: ${alignItems};
gap: ${flexGap}px;`, [flexDir, flexWrap, justifyContent, alignItems, flexGap]);

  const gridHtml = useMemo(() => `<div class="container" style="${gridCss.replace(/\n/g, " ")}">
${Array.from({ length: gridItems }, (_, i) => `  <div class="item">Item ${i + 1}</div>`).join("\n")}
</div>`, [gridCss, gridItems]);

  const flexHtml = useMemo(() => `<div class="container" style="${flexCss.replace(/\n/g, " ")}">
${Array.from({ length: flexItems }, (_, i) => `  <div class="item">Item ${i + 1}</div>`).join("\n")}
</div>`, [flexCss, flexItems]);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("已複製到剪貼簿");
  }

  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#84cc16"];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CSS Grid / Flexbox 視覺化生成器</h1>
        <p className="text-muted-foreground mt-1">點選調整佈局參數，即時預覽並複製 CSS 程式碼</p>
      </div>

      <Tabs value={mode} onValueChange={v => setMode(v as "grid" | "flex")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grid">CSS Grid</TabsTrigger>
          <TabsTrigger value="flex">Flexbox</TabsTrigger>
        </TabsList>

        {/* GRID */}
        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Grid 設定</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label>grid-template-columns</Label>
                  <Input value={gridColTemplate} onChange={e => setGridColTemplate(e.target.value)} className="font-mono text-sm" />
                  <div className="flex gap-2 flex-wrap">
                    {["repeat(3, 1fr)", "repeat(4, 1fr)", "1fr 2fr 1fr", "200px 1fr", "repeat(auto-fill, minmax(150px, 1fr))"].map(v => (
                      <button key={v} className="text-xs px-2 py-1 rounded border hover:bg-muted" onClick={() => setGridColTemplate(v)}>{v}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>grid-template-rows</Label>
                  <Input value={gridRowTemplate} onChange={e => setGridRowTemplate(e.target.value)} className="font-mono text-sm" />
                </div>
                <div className="space-y-1">
                  <Label>gap（px）</Label>
                  <Input type="number" value={gridGap} onChange={e => setGridGap(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>子元素數量</Label>
                  <Input type="number" min="1" max="20" value={gridItems} onChange={e => setGridItems(Number(e.target.value))} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>即時預覽</CardTitle></CardHeader>
              <CardContent>
                <div
                  className="min-h-48 border rounded-lg p-2"
                  style={{ display: "grid", gridTemplateColumns: gridColTemplate, gridTemplateRows: gridRowTemplate, gap: `${gridGap}px` }}
                >
                  {Array.from({ length: gridItems }, (_, i) => (
                    <div key={i} className="rounded flex items-center justify-center text-white text-xs font-bold p-3 min-h-12"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                      {i + 1}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>生成的 CSS</CardTitle>
                <Button size="sm" variant="outline" onClick={() => copy(gridCss)}><Copy className="h-3 w-3 mr-1" /> 複製 CSS</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <pre className="font-mono text-sm bg-muted rounded-md p-3">{gridCss}</pre>
              <Button size="sm" variant="outline" onClick={() => copy(gridHtml)}><Copy className="h-3 w-3 mr-1" /> 複製完整 HTML</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FLEX */}
        <TabsContent value="flex" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Flexbox 設定</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "flex-direction", value: flexDir, set: setFlexDir, options: ["row", "row-reverse", "column", "column-reverse"] },
                  { label: "flex-wrap", value: flexWrap, set: setFlexWrap, options: ["nowrap", "wrap", "wrap-reverse"] },
                  { label: "justify-content", value: justifyContent, set: setJustifyContent, options: ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"] },
                  { label: "align-items", value: alignItems, set: setAlignItems, options: ["stretch", "flex-start", "flex-end", "center", "baseline"] },
                ].map(({ label, value, set, options }) => (
                  <div key={label} className="space-y-1">
                    <Label className="font-mono text-xs">{label}</Label>
                    <Select value={value} onValueChange={set}>
                      <SelectTrigger className="font-mono text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{options.map(o => <SelectItem key={o} value={o} className="font-mono text-sm">{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                ))}
                <div className="space-y-1">
                  <Label>gap（px）</Label>
                  <Input type="number" value={flexGap} onChange={e => setFlexGap(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>子元素數量</Label>
                  <Input type="number" min="1" max="20" value={flexItems} onChange={e => setFlexItems(Number(e.target.value))} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>即時預覽</CardTitle></CardHeader>
              <CardContent>
                <div
                  className="min-h-48 border rounded-lg p-2"
                  style={{ display: "flex", flexDirection: flexDir as React.CSSProperties["flexDirection"], flexWrap: flexWrap as React.CSSProperties["flexWrap"], justifyContent, alignItems, gap: `${flexGap}px` }}
                >
                  {Array.from({ length: flexItems }, (_, i) => (
                    <div key={i} className="rounded flex items-center justify-center text-white text-xs font-bold p-3 min-w-12 min-h-12"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                      {i + 1}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>生成的 CSS</CardTitle>
                <Button size="sm" variant="outline" onClick={() => copy(flexCss)}><Copy className="h-3 w-3 mr-1" /> 複製 CSS</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <pre className="font-mono text-sm bg-muted rounded-md p-3">{flexCss}</pre>
              <Button size="sm" variant="outline" onClick={() => copy(flexHtml)}><Copy className="h-3 w-3 mr-1" /> 複製完整 HTML</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
