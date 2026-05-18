import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, X } from "lucide-react";
import { toast } from "sonner";

function encodeBase64(str: string): string {
  try { return btoa(unescape(encodeURIComponent(str))); } catch { return "編碼失敗"; }
}
function decodeBase64(str: string): string {
  try { return decodeURIComponent(escape(atob(str.trim()))); } catch { return "解碼失敗：非有效的 Base64 字串"; }
}
function formatJson(str: string): { result: string; valid: boolean } {
  try { return { result: JSON.stringify(JSON.parse(str), null, 2), valid: true }; }
  catch (e: unknown) { return { result: `JSON 格式錯誤：${e instanceof Error ? e.message : String(e)}`, valid: false }; }
}
function minifyJson(str: string): { result: string; valid: boolean } {
  try { return { result: JSON.stringify(JSON.parse(str)), valid: true }; }
  catch (e: unknown) { return { result: `JSON 格式錯誤：${e instanceof Error ? e.message : String(e)}`, valid: false }; }
}

export default function Base64JsonFormatter() {
  const [b64Input, setB64Input] = useState("");
  const [b64Output, setB64Output] = useState("");
  const [b64Mode, setB64Mode] = useState<"encode" | "decode">("encode");

  const [jsonInput, setJsonInput] = useState('{\n  "name": "工具矩陣",\n  "version": "1.0",\n  "tools": ["ROI", "TDEE", "BMI"]\n}');
  const [jsonOutput, setJsonOutput] = useState("");
  const [jsonValid, setJsonValid] = useState<boolean | null>(null);

  function handleBase64() {
    if (b64Mode === "encode") setB64Output(encodeBase64(b64Input));
    else setB64Output(decodeBase64(b64Input));
  }

  function handleJsonFormat() {
    const { result, valid } = formatJson(jsonInput);
    setJsonOutput(result);
    setJsonValid(valid);
  }

  function handleJsonMinify() {
    const { result, valid } = minifyJson(jsonInput);
    setJsonOutput(result);
    setJsonValid(valid);
  }

  function validateJson() {
    try { JSON.parse(jsonInput); setJsonValid(true); toast.success("JSON 格式正確！"); }
    catch (e: unknown) { setJsonValid(false); toast.error(`JSON 格式錯誤：${e instanceof Error ? e.message : String(e)}`); }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("已複製到剪貼簿");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Base64 / JSON 格式化工具</h1>
        <p className="text-muted-foreground mt-1">Base64 編碼解碼、JSON 美化壓縮與格式驗證</p>
      </div>

      <Tabs defaultValue="base64">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="base64">Base64 編碼 / 解碼</TabsTrigger>
          <TabsTrigger value="json">JSON 格式化</TabsTrigger>
        </TabsList>

        <TabsContent value="base64" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Base64 工具</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant={b64Mode === "encode" ? "default" : "outline"} onClick={() => setB64Mode("encode")}>編碼</Button>
                  <Button size="sm" variant={b64Mode === "decode" ? "default" : "outline"} onClick={() => setB64Mode("decode")}>解碼</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{b64Mode === "encode" ? "輸入文字" : "輸入 Base64"}</label>
                <textarea
                  className="w-full h-32 font-mono text-sm bg-muted rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  value={b64Input}
                  onChange={e => setB64Input(e.target.value)}
                  placeholder={b64Mode === "encode" ? "輸入要編碼的文字..." : "輸入 Base64 字串..."}
                />
              </div>
              <Button className="w-full" onClick={handleBase64}>
                {b64Mode === "encode" ? "編碼為 Base64" : "解碼 Base64"}
              </Button>
              {b64Output && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">輸出結果</label>
                    <Button size="sm" variant="outline" onClick={() => copy(b64Output)}>
                      <Copy className="h-3 w-3 mr-1" /> 複製
                    </Button>
                  </div>
                  <div className="font-mono text-sm bg-muted rounded-md p-3 break-all">{b64Output}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>JSON 輸入</CardTitle>
                  {jsonValid !== null && (
                    <Badge variant={jsonValid ? "default" : "destructive"}>
                      {jsonValid ? <><Check className="h-3 w-3 mr-1" />有效</> : <><X className="h-3 w-3 mr-1" />無效</>}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <textarea
                  className="w-full h-64 font-mono text-sm bg-muted rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  value={jsonInput}
                  onChange={e => { setJsonInput(e.target.value); setJsonValid(null); }}
                  spellCheck={false}
                />
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleJsonFormat}>美化</Button>
                  <Button className="flex-1" variant="outline" onClick={handleJsonMinify}>壓縮</Button>
                  <Button variant="outline" onClick={validateJson}>驗證</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>輸出結果</CardTitle>
                  {jsonOutput && (
                    <Button size="sm" variant="outline" onClick={() => copy(jsonOutput)}>
                      <Copy className="h-3 w-3 mr-1" /> 複製
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <pre className={`h-64 overflow-auto font-mono text-sm rounded-md p-3 ${jsonValid === false ? "bg-destructive/10 text-destructive" : "bg-muted"}`}>
                  {jsonOutput || "點選「美化」或「壓縮」查看結果"}
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
