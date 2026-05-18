import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Monitor, Tablet, Smartphone, RefreshCw } from "lucide-react";

interface Device {
  name: string;
  width: number;
  height: number;
  icon: React.ReactNode;
  breakpoint: string;
}

const DEVICES: Device[] = [
  { name: "iPhone SE", width: 375, height: 667, icon: <Smartphone className="h-4 w-4" />, breakpoint: "sm" },
  { name: "iPhone 14 Pro", width: 393, height: 852, icon: <Smartphone className="h-4 w-4" />, breakpoint: "sm" },
  { name: "iPad Mini", width: 768, height: 1024, icon: <Tablet className="h-4 w-4" />, breakpoint: "md" },
  { name: "iPad Pro 11\"", width: 1024, height: 1366, icon: <Tablet className="h-4 w-4" />, breakpoint: "lg" },
  { name: "MacBook Air 13\"", width: 1280, height: 800, icon: <Monitor className="h-4 w-4" />, breakpoint: "xl" },
  { name: "Full HD", width: 1920, height: 1080, icon: <Monitor className="h-4 w-4" />, breakpoint: "2xl" },
];

const TAILWIND_BREAKPOINTS = [
  { name: "xs", min: 0, max: 639, color: "bg-red-500" },
  { name: "sm", min: 640, max: 767, color: "bg-orange-500" },
  { name: "md", min: 768, max: 1023, color: "bg-yellow-500" },
  { name: "lg", min: 1024, max: 1279, color: "bg-green-500" },
  { name: "xl", min: 1280, max: 1535, color: "bg-blue-500" },
  { name: "2xl", min: 1536, max: 99999, color: "bg-purple-500" },
];

export default function ResponsiveBreakpointTester() {
  const [url, setUrl] = useState("https://example.com");
  const [inputUrl, setInputUrl] = useState("https://example.com");
  const [selectedDevice, setSelectedDevice] = useState(DEVICES[0]);
  const [customWidth, setCustomWidth] = useState("375");
  const [customHeight, setCustomHeight] = useState("667");
  const [useCustom, setUseCustom] = useState(false);
  const [key, setKey] = useState(0);

  const activeWidth = useCustom ? Number(customWidth) : selectedDevice.width;
  const activeHeight = useCustom ? Number(customHeight) : selectedDevice.height;

  const activeBp = TAILWIND_BREAKPOINTS.find(bp => activeWidth >= bp.min && activeWidth <= bp.max);

  function loadUrl() {
    let u = inputUrl.trim();
    if (!u.startsWith("http")) u = "https://" + u;
    setUrl(u);
    setKey(k => k + 1);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">響應式斷點測試器</h1>
        <p className="text-muted-foreground mt-1">輸入網址，在多種裝置尺寸下預覽網站響應式效果</p>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="flex gap-2">
            <Input
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
              placeholder="https://example.com"
              onKeyDown={e => e.key === "Enter" && loadUrl()}
            />
            <Button onClick={loadUrl}><RefreshCw className="h-4 w-4 mr-1" /> 載入</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {DEVICES.map(device => (
              <button
                key={device.name}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  !useCustom && selectedDevice.name === device.name ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
                onClick={() => { setSelectedDevice(device); setUseCustom(false); }}
              >
                {device.icon}
                <span>{device.name}</span>
                <Badge variant="outline" className="text-xs">{device.width}×{device.height}</Badge>
              </button>
            ))}
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${useCustom ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              onClick={() => setUseCustom(true)}
            >
              自訂尺寸
            </button>
          </div>

          {useCustom && (
            <div className="flex gap-4 items-end">
              <div className="space-y-1">
                <Label className="text-xs">寬度（px）</Label>
                <Input type="number" value={customWidth} onChange={e => setCustomWidth(e.target.value)} className="w-28" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">高度（px）</Label>
                <Input type="number" value={customHeight} onChange={e => setCustomHeight(e.target.value)} className="w-28" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">目前尺寸：{activeWidth} × {activeHeight}px</span>
            {activeBp && (
              <Badge className={`${activeBp.color} text-white`}>Tailwind {activeBp.name}（≥{activeBp.min}px）</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tailwind breakpoint ruler */}
      <Card>
        <CardHeader><CardTitle className="text-base">Tailwind CSS 斷點對照</CardTitle></CardHeader>
        <CardContent>
          <div className="flex rounded-lg overflow-hidden h-6">
            {TAILWIND_BREAKPOINTS.map(bp => (
              <div
                key={bp.name}
                className={`${bp.color} flex items-center justify-center text-white text-xs font-bold`}
                style={{ flex: bp.max === 99999 ? 2 : bp.max - bp.min }}
              >
                {bp.name}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span><span>640</span><span>768</span><span>1024</span><span>1280</span><span>1536+</span>
          </div>
        </CardContent>
      </Card>

      {/* iframe preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            預覽：{useCustom ? "自訂" : selectedDevice.name} ({activeWidth}×{activeHeight})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto border rounded-lg bg-muted flex justify-center p-4" style={{ minHeight: 400 }}>
            <div style={{ width: activeWidth, height: activeHeight, flexShrink: 0 }} className="border shadow-lg bg-white rounded">
              <iframe
                key={key}
                src={url}
                width={activeWidth}
                height={activeHeight}
                className="rounded"
                title="preview"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ⚠️ 部分網站因 X-Frame-Options 或 CSP 設定而無法在 iframe 中顯示。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
