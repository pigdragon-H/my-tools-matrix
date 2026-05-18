import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isExpired: boolean | null;
  expiresAt: Date | null;
  issuedAt: Date | null;
}

function decodeJwt(token: string): JwtParts | null {
  try {
    const parts = token.trim().split(".");
    if (parts.length !== 3) return null;
    const decode = (str: string) => JSON.parse(decodeURIComponent(escape(atob(str.replace(/-/g, "+").replace(/_/g, "/")))));
    const header = decode(parts[0]);
    const payload = decode(parts[1]);
    const now = Date.now() / 1000;
    const exp = typeof payload.exp === "number" ? payload.exp : null;
    const iat = typeof payload.iat === "number" ? payload.iat : null;
    return {
      header,
      payload,
      signature: parts[2],
      isExpired: exp !== null ? now > exp : null,
      expiresAt: exp ? new Date(exp * 1000) : null,
      issuedAt: iat ? new Date(iat * 1000) : null,
    };
  } catch {
    return null;
  }
}

const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjo5OTk5OTk5OTk5fQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDecoder() {
  const [token, setToken] = useState(SAMPLE_JWT);

  const decoded = useMemo(() => decodeJwt(token), [token]);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("已複製");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">JWT 解碼與檢查器</h1>
        <p className="text-muted-foreground mt-1">解碼 JWT Token 的 Header、Payload，並檢查到期時間</p>
      </div>

      <Card>
        <CardHeader><CardTitle>輸入 JWT Token</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <textarea
            className="w-full h-28 font-mono text-sm bg-muted rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary break-all"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="貼入 JWT Token..."
            spellCheck={false}
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setToken(SAMPLE_JWT)}>載入範例</Button>
            <Button variant="outline" size="sm" onClick={() => setToken("")}>清除</Button>
          </div>
        </CardContent>
      </Card>

      {token && !decoded && (
        <Card className="border-destructive/50">
          <CardContent className="pt-4 flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">無效的 JWT 格式，請確認 Token 是否完整</span>
          </CardContent>
        </Card>
      )}

      {decoded && (
        <div className="space-y-4">
          {/* Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 flex items-center gap-3">
                {decoded.isExpired === null ? (
                  <><Clock className="h-5 w-5 text-muted-foreground" /><div><div className="text-sm font-medium">無到期時間</div><div className="text-xs text-muted-foreground">Token 永不過期</div></div></>
                ) : decoded.isExpired ? (
                  <><AlertTriangle className="h-5 w-5 text-destructive" /><div><div className="text-sm font-medium text-destructive">已過期</div><div className="text-xs text-muted-foreground">{decoded.expiresAt?.toLocaleString("zh-TW")}</div></div></>
                ) : (
                  <><CheckCircle className="h-5 w-5 text-green-500" /><div><div className="text-sm font-medium text-green-600 dark:text-green-400">有效中</div><div className="text-xs text-muted-foreground">{decoded.expiresAt?.toLocaleString("zh-TW")}</div></div></>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-xs text-muted-foreground">簽發時間</div>
                <div className="text-sm font-medium">{decoded.issuedAt ? decoded.issuedAt.toLocaleString("zh-TW") : "未設定"}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-xs text-muted-foreground">演算法</div>
                <div className="text-sm font-mono font-bold">{String(decoded.header.alg || "未知")}</div>
              </CardContent>
            </Card>
          </div>

          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Header</CardTitle>
                <Badge variant="secondary">紅色部分</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-2">
                <Button size="sm" variant="outline" onClick={() => copy(JSON.stringify(decoded.header, null, 2))}>
                  <Copy className="h-3 w-3 mr-1" /> 複製
                </Button>
              </div>
              <pre className="font-mono text-sm bg-muted rounded-md p-3 overflow-auto">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Payload */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Payload</CardTitle>
                <Badge variant="secondary">紫色部分</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-2">
                <Button size="sm" variant="outline" onClick={() => copy(JSON.stringify(decoded.payload, null, 2))}>
                  <Copy className="h-3 w-3 mr-1" /> 複製
                </Button>
              </div>
              <pre className="font-mono text-sm bg-muted rounded-md p-3 overflow-auto">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Signature */}
          <Card>
            <CardHeader><CardTitle className="text-base">Signature（無法驗證，需要 Secret）</CardTitle></CardHeader>
            <CardContent>
              <div className="font-mono text-sm bg-muted rounded-md p-3 break-all text-muted-foreground">
                {decoded.signature}
              </div>
              <p className="text-xs text-muted-foreground mt-2">⚠️ 本工具僅解碼 Token 內容，不驗證簽名。請勿在此輸入包含敏感資訊的 Token。</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
