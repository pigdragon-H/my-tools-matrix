// ============================================================
// InvoiceGenerator.tsx - 線上發票 PDF 自動生成器
// ============================================================
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileText, Plus, Trash2, Printer, Download } from "lucide-react";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function InvoiceGenerator() {
  const [invoiceNumber, setInvoiceNumber] = useState(() => `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`);
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });

  // 發票人
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [fromTaxId, setFromTaxId] = useState("");

  // 收件人
  const [toName, setToName] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [toTaxId, setToTaxId] = useState("");

  // 項目
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", description: "設計服務", quantity: 1, unitPrice: 10000 },
  ]);

  const [taxRate, setTaxRate] = useState(5);
  const [notes, setNotes] = useState("付款方式：銀行轉帳\n帳戶資訊：請洽詢");
  const [currency, setCurrency] = useState("NTD");

  const printRef = useRef<HTMLDivElement>(null);

  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const addItem = () => {
    setItems((prev) => [...prev, { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const originalBody = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalBody;
    window.location.reload();
  };

  const formatCurrency = (amount: number) => {
    return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            線上發票 PDF 生成器
          </h1>
          <p className="text-muted-foreground mt-1">填寫發票資訊，直接列印或下載 PDF</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            列印 / 存 PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側：輸入表單 */}
        <div className="space-y-4">
          {/* 發票資訊 */}
          <Card>
            <CardHeader><CardTitle className="text-base">發票資訊</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>發票號碼</Label>
                <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>幣別</Label>
                <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="NTD / USD" />
              </div>
              <div className="space-y-1">
                <Label>開立日期</Label>
                <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>付款截止日</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* 發票人 */}
          <Card>
            <CardHeader><CardTitle className="text-base">發票人（From）</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>姓名 / 公司名稱</Label>
                <Input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="你的名字或公司" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input type="email" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>統一編號（選填）</Label>
                  <Input value={fromTaxId} onChange={(e) => setFromTaxId(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>地址</Label>
                <Input value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* 收件人 */}
          <Card>
            <CardHeader><CardTitle className="text-base">收件人（To）</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>姓名 / 公司名稱</Label>
                <Input value={toName} onChange={(e) => setToName(e.target.value)} placeholder="客戶名稱" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input type="email" value={toEmail} onChange={(e) => setToEmail(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>統一編號（選填）</Label>
                  <Input value={toTaxId} onChange={(e) => setToTaxId(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>地址</Label>
                <Input value={toAddress} onChange={(e) => setToAddress(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* 備註 */}
          <Card>
            <CardHeader><CardTitle className="text-base">備註</CardTitle></CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </CardContent>
          </Card>
        </div>

        {/* 右側：預覽 */}
        <div>
          <div ref={printRef} className="bg-white dark:bg-card text-foreground border rounded-lg p-8 space-y-6 print:border-none print:shadow-none">
            {/* 標題 */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-primary">發票</h2>
                <p className="text-muted-foreground text-sm mt-1">INVOICE</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-medium">{invoiceNumber}</p>
                <p className="text-muted-foreground">開立日期：{issueDate}</p>
                <p className="text-muted-foreground">付款截止：{dueDate}</p>
              </div>
            </div>

            <Separator />

            {/* 發票人 & 收件人 */}
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="font-semibold text-muted-foreground mb-1">FROM</p>
                <p className="font-bold">{fromName || "（發票人名稱）"}</p>
                {fromTaxId && <p>統編：{fromTaxId}</p>}
                {fromEmail && <p>{fromEmail}</p>}
                {fromAddress && <p className="text-muted-foreground">{fromAddress}</p>}
              </div>
              <div>
                <p className="font-semibold text-muted-foreground mb-1">TO</p>
                <p className="font-bold">{toName || "（收件人名稱）"}</p>
                {toTaxId && <p>統編：{toTaxId}</p>}
                {toEmail && <p>{toEmail}</p>}
                {toAddress && <p className="text-muted-foreground">{toAddress}</p>}
              </div>
            </div>

            <Separator />

            {/* 項目表格 */}
            <div>
              <div className="grid grid-cols-12 text-xs font-semibold text-muted-foreground mb-2 px-2">
                <span className="col-span-6">項目說明</span>
                <span className="col-span-2 text-right">數量</span>
                <span className="col-span-2 text-right">單價</span>
                <span className="col-span-2 text-right">小計</span>
              </div>
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 text-sm py-2 px-2 border-b border-border/50">
                  <span className="col-span-6">{item.description || "（項目說明）"}</span>
                  <span className="col-span-2 text-right">{item.quantity}</span>
                  <span className="col-span-2 text-right">{item.unitPrice.toLocaleString()}</span>
                  <span className="col-span-2 text-right font-medium">{(item.quantity * item.unitPrice).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* 金額合計 */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">小計</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">稅金（{taxRate}%）</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>總計</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            {notes && (
              <>
                <Separator />
                <div className="text-xs text-muted-foreground whitespace-pre-line">{notes}</div>
              </>
            )}
          </div>

          {/* 項目編輯（在預覽下方） */}
          <Card className="mt-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">服務項目</CardTitle>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />新增項目
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                  <Input
                    className="col-span-5"
                    placeholder="項目說明"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                  />
                  <Input
                    className="col-span-2"
                    type="number"
                    placeholder="數量"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    className="col-span-3"
                    type="number"
                    placeholder="單價"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="col-span-2"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-2">
                <Label className="text-sm whitespace-nowrap">稅率（%）</Label>
                <Input
                  type="number"
                  className="w-24"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
