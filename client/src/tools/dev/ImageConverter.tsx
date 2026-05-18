import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, ImageIcon } from "lucide-react";
import { toast } from "sonner";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

interface ConvertedImage {
  url: string;
  size: number;
  format: string;
  width: number;
  height: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function ImageConverter() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalDims, setOriginalDims] = useState({ width: 0, height: 0 });
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/webp");
  const [quality, setQuality] = useState(85);
  const [converted, setConverted] = useState<ConvertedImage | null>(null);
  const [converting, setConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("請選擇圖片檔案"); return; }
    setOriginalFile(file);
    setConverted(null);
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    const img = new Image();
    img.onload = () => setOriginalDims({ width: img.width, height: img.height });
    img.src = url;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  async function convertImage() {
    if (!originalFile || !originalUrl) return;
    setConverting(true);
    try {
      const img = new Image();
      await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = originalUrl; });
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        if (!blob) { toast.error("轉換失敗"); setConverting(false); return; }
        const url = URL.createObjectURL(blob);
        setConverted({ url, size: blob.size, format: outputFormat, width: img.width, height: img.height });
        setConverting(false);
        toast.success("轉換完成！");
      }, outputFormat, quality / 100);
    } catch {
      toast.error("轉換失敗");
      setConverting(false);
    }
  }

  function downloadConverted() {
    if (!converted) return;
    const ext = outputFormat.split("/")[1];
    const a = document.createElement("a");
    a.href = converted.url;
    a.download = `converted.${ext}`;
    a.click();
  }

  const formatLabels: Record<OutputFormat, string> = {
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WebP",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">圖片格式轉換壓縮工具</h1>
        <p className="text-muted-foreground mt-1">JPG / PNG / WebP 互轉，自訂壓縮品質，完全在瀏覽器本地處理</p>
      </div>

      {/* Upload */}
      <Card>
        <CardContent className="pt-4">
          <div
            className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium">拖曳圖片至此，或點擊選擇檔案</p>
            <p className="text-xs text-muted-foreground mt-1">支援 JPG、PNG、WebP、GIF、BMP</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
        </CardContent>
      </Card>

      {originalFile && (
        <>
          {/* Settings */}
          <Card>
            <CardHeader><CardTitle>轉換設定</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>輸出格式</Label>
                  <Select value={outputFormat} onValueChange={v => setOutputFormat(v as OutputFormat)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image/webp">WebP（推薦，最小體積）</SelectItem>
                      <SelectItem value="image/jpeg">JPEG（相容性最佳）</SelectItem>
                      <SelectItem value="image/png">PNG（無損）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {outputFormat !== "image/png" && (
                  <div className="space-y-2">
                    <Label>壓縮品質：{quality}%</Label>
                    <Slider min={10} max={100} step={5} value={[quality]} onValueChange={([v]) => setQuality(v)} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>最小體積</span><span>最高品質</span>
                    </div>
                  </div>
                )}
              </div>
              <Button className="w-full" onClick={convertImage} disabled={converting}>
                {converting ? "轉換中..." : `轉換為 ${formatLabels[outputFormat]}`}
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">原始圖片</CardTitle>
                  <Badge variant="outline">{formatBytes(originalFile.size)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <img src={originalUrl!} alt="original" className="w-full rounded-lg object-contain max-h-64" />
                <p className="text-xs text-muted-foreground mt-2">{originalDims.width} × {originalDims.height}px · {originalFile.type.split("/")[1].toUpperCase()}</p>
              </CardContent>
            </Card>

            {converted ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">轉換結果</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{formatBytes(converted.size)}</Badge>
                      <Badge variant={converted.size < originalFile.size ? "default" : "secondary"}>
                        {converted.size < originalFile.size
                          ? `節省 ${Math.round((1 - converted.size / originalFile.size) * 100)}%`
                          : `增加 ${Math.round((converted.size / originalFile.size - 1) * 100)}%`}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <img src={converted.url} alt="converted" className="w-full rounded-lg object-contain max-h-64" />
                  <p className="text-xs text-muted-foreground mt-2">{converted.width} × {converted.height}px · {formatLabels[outputFormat]}</p>
                  <Button className="w-full mt-3" onClick={downloadConverted}>
                    <Download className="h-4 w-4 mr-2" /> 下載轉換後圖片
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed">
                <CardContent className="h-full flex items-center justify-center min-h-48">
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 mx-auto mb-2" />
                    <p className="text-sm">點擊「轉換」查看結果</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
