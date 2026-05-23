import { useMemo, useState } from "react";

export type Lang = "zh" | "en";
export type Field = { key: string; zh: string; en: string; unitZh?: string; unitEn?: string; type?: "number" | "text" | "date" | "time" | "textarea" | "select"; options?: { value: string; zh: string; en: string }[]; defaultValue: string };
export type ToolConfig = { kind: string; zhTitle: string; enTitle: string; zhDescription: string; enDescription: string; formulaZh: string; formulaEn: string; fields: Field[]; noteZh?: string; noteEn?: string };

type Row = { labelZh: string; labelEn: string; value: string; hintZh?: string; hintEn?: string };
const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const pct = (n: number) => `${nf.format(n)}%`;
const num = (v: Record<string,string>, k: string) => Number(v[k]);
const safe = (n: number) => Number.isFinite(n) ? nf.format(n) : "—";
const money = (n: number) => Number.isFinite(n) ? `$${nf.format(n)}` : "—";
const daysBetween = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

const elements: Record<string, number> = { H:1.008,C:12.011,N:14.007,O:15.999,Na:22.99,Cl:35.45,Fe:55.845,Ca:40.078,K:39.098,Mg:24.305,S:32.06,P:30.974,Cu:63.546,Zn:65.38,Ag:107.868,Au:196.967 };
function molecularWeight(formula: string) { let total = 0; const re = /([A-Z][a-z]?)(\d*)/g; let m; while ((m = re.exec(formula))) total += (elements[m[1]] || 0) * Number(m[2] || 1); return total; }
function zodiac(d: string) { const x = new Date(d); const m=x.getUTCMonth()+1, day=x.getUTCDate(); const z=[[120,"摩羯座","Capricorn"],[219,"水瓶座","Aquarius"],[321,"雙魚座","Pisces"],[420,"牡羊座","Aries"],[521,"金牛座","Taurus"],[621,"雙子座","Gemini"],[723,"巨蟹座","Cancer"],[823,"獅子座","Leo"],[923,"處女座","Virgo"],[1023,"天秤座","Libra"],[1122,"天蠍座","Scorpio"],[1222,"射手座","Sagittarius"],[1232,"摩羯座","Capricorn"]]; const md=m*100+day; return z.find(([cut])=>md<Number(cut)) || z[0]; }

function calculate(kind: string, v: Record<string,string>): Row[] {
  const a=num(v,"a"), b=num(v,"b"), c=num(v,"c"), d=num(v,"d"), e=num(v,"e");
  switch(kind){
    case "force": return [{labelZh:"力",labelEn:"Force",value:`${safe(a*b)} N`,hintZh:"牛頓第二定律 F=m×a",hintEn:"Newton's second law F=m×a"}];
    case "molecular": return [{labelZh:"分子量",labelEn:"Molecular weight",value:`${safe(molecularWeight(v.formula||"H2O"))} g/mol`,hintZh:"依常見元素原子量估算",hintEn:"Estimated from common atomic weights"}];
    case "ohms": { const V=num(v,"voltage"), I=num(v,"current"), R=num(v,"resistance"); if(!V&&I&&R)return[{labelZh:"電壓",labelEn:"Voltage",value:`${safe(I*R)} V`}]; if(V&&!I&&R)return[{labelZh:"電流",labelEn:"Current",value:`${safe(V/R)} A`}]; return[{labelZh:"電阻",labelEn:"Resistance",value:`${safe(V/I)} Ω`}]; }
    case "percentage": return [{labelZh:"X 是 Y 的百分比",labelEn:"X as % of Y",value:pct(a/b*100)},{labelZh:"X 的 Y%",labelEn:"Y% of X",value:safe(a*b/100)},{labelZh:"X 增減 Y%",labelEn:"X after Y% change",value:safe(a*(1+b/100))}];
    case "ph": { const h=Math.pow(10,-a), oh=1e-14/h; const type=a<7?["酸性","Acidic"]:a>7?["鹼性","Basic"]:["中性","Neutral"]; return [{labelZh:"酸鹼性",labelEn:"Classification",value:`${type[0]} / ${type[1]}`},{labelZh:"H⁺濃度",labelEn:"H⁺ concentration",value:`${h.toExponential(2)} mol/L`},{labelZh:"OH⁻濃度",labelEn:"OH⁻ concentration",value:`${oh.toExponential(2)} mol/L`}]; }
    case "speed": return [{labelZh:"速度",labelEn:"Speed",value:`${safe(a/b)} km/h = ${safe(a/b/3.6)} m/s = ${safe(a/b*0.621371)} mph`}];
    case "temperature": return [{labelZh:"攝氏",labelEn:"Celsius",value:`${safe(a)} °C`},{labelZh:"華氏",labelEn:"Fahrenheit",value:`${safe(a*9/5+32)} °F`},{labelZh:"克耳文",labelEn:"Kelvin",value:`${safe(a+273.15)} K`}];
    case "unit": return [{labelZh:"公尺",labelEn:"Meters",value:`${safe(a)} m`},{labelZh:"公里",labelEn:"Kilometers",value:`${safe(a/1000)} km`},{labelZh:"英尺",labelEn:"Feet",value:`${safe(a*3.28084)} ft`},{labelZh:"英里",labelEn:"Miles",value:`${safe(a/1609.344)} mi`}];
    case "co2": { const factors:Record<string,number>={flight:.18,train:.041,car:.21,scooter:.09,bus:.08}; const kg=a*(factors[v.mode]||.21); return [{labelZh:"CO₂排放量",labelEn:"CO₂ emissions",value:`${safe(kg)} kg`},{labelZh:"約需樹木吸收",labelEn:"Trees equivalent",value:`${safe(kg/21)} trees/year`}]; }
    case "distance": return [{labelZh:"直線距離",labelEn:"Great-circle distance",value:`${safe(a)} km`},{labelZh:"飛行時間估算",labelEn:"Estimated flight time",value:`${safe(a/800)} hours`}];
    case "flight": return [{labelZh:"飛行時間",labelEn:"Flight time",value:`${safe(a/800)} hours`},{labelZh:"估計抵達",labelEn:"Estimated arrival",value:`${v.time||"09:00"} + ${safe(a/800)}h`}];
    case "fuel": return [{labelZh:"總油費",labelEn:"Total fuel cost",value:money(a*b/100*c)},{labelZh:"每公里成本",labelEn:"Cost per km",value:money((a*b/100*c)/a)}];
    case "hotel": return [{labelZh:"總費用",labelEn:"Total cost",value:money(a*b*1.12)},{labelZh:"每人費用",labelEn:"Cost per person",value:money(a*b*1.12/c)}];
    case "packing": return [{labelZh:"建議清單",labelEn:"Packing list",value:`護照/Passport, 衣物 ${a} 天/clothes ${a} days, 充電器/charger, 藥品/medicine`}];
    case "timezone": return [{labelZh:"台北/東京/倫敦/紐約/洛杉磯/雪梨",labelEn:"Taipei/Tokyo/London/New York/LA/Sydney",value:"UTC+8 / UTC+9 / UTC+0 / UTC-5 / UTC-8 / UTC+11"}];
    case "travelBudget": { const mult=v.style==="luxury"?260:v.style==="comfort"?150:80; return [{labelZh:"每日預算",labelEn:"Daily budget",value:money(mult)},{labelZh:"總預算",labelEn:"Total budget",value:money(mult*a)}]; }
    case "visa": return [{labelZh:"簽證費用",labelEn:"Visa fee",value:money(80)},{labelZh:"所需文件",labelEn:"Documents",value:"護照/passport, 照片/photo, 財力證明/bank statement"}];
    case "churn": return [{labelZh:"流失率",labelEn:"Churn rate",value:pct(b/a*100)},{labelZh:"留存率",labelEn:"Retention rate",value:pct(100-b/a*100)}];
    case "conversion": return [{labelZh:"轉換率",labelEn:"Conversion rate",value:pct(b/a*100)},{labelZh:"基準",labelEn:"Benchmark",value:b/a*100>=3?"良好 / Good":"可優化 / Needs optimization"}];
    case "cpc": return [{labelZh:"每次點擊成本",labelEn:"CPC",value:money(a/b)},{labelZh:"ROI",labelEn:"ROI",value:pct((c-a)/a*100)}];
    case "cpm": return [{labelZh:"CPM",labelEn:"CPM",value:money(a/b*1000)},{labelZh:"每次曝光成本",labelEn:"Cost per impression",value:money(a/b)}];
    case "cac": return [{labelZh:"獲客成本",labelEn:"CAC",value:money(a/b)},{labelZh:"LTV/CAC",labelEn:"LTV/CAC",value:`${safe(c/(a/b))}:1`}];
    case "ltv": return [{labelZh:"客戶終身價值",labelEn:"LTV",value:money(a*b*c)},{labelZh:"LTV/CAC",labelEn:"LTV/CAC",value:`${safe((a*b*c)/d)}:1`}];
    case "emailOpen": return [{labelZh:"開信率",labelEn:"Open rate",value:pct(b/a*100)},{labelZh:"點擊率",labelEn:"Click rate",value:pct(c/a*100)}];
    case "nps": { const total=a+b+c; return [{labelZh:"NPS",labelEn:"NPS",value:safe(a/total*100-c/total*100)},{labelZh:"評級",labelEn:"Rating",value:a/total*100-c/total*100>=50?"優秀 / Excellent":"需改善 / Improve"}]; }
    case "roas": return [{labelZh:"ROAS",labelEn:"ROAS",value:`${safe(b/a)}x`},{labelZh:"盈虧平衡ROAS",labelEn:"Break-even ROAS",value:`${safe(1/(c/100))}x`}];
    case "roi": return [{labelZh:"ROI",labelEn:"ROI",value:pct((b-a)/a*100)},{labelZh:"淨收益",labelEn:"Net gain",value:money(b-a)}];
    case "essay": { const text=v.text||""; const words=text.trim()?text.trim().split(/\s+/).length:0; return [{labelZh:"字元數",labelEn:"Characters",value:safe(text.length)},{labelZh:"字數",labelEn:"Words",value:safe(words)},{labelZh:"閱讀時間",labelEn:"Reading time",value:`${safe(Math.max(1,words/200))} min`}]; }
    case "gpa": return [{labelZh:"GPA",labelEn:"GPA",value:safe((a*b+c*d)/(b+d))},{labelZh:"等級",labelEn:"Grade",value:(a*b+c*d)/(b+d)>=3.7?"A":"B"}];
    case "grade": return [{labelZh:"加權平均",labelEn:"Weighted average",value:pct((a*b+c*d)/100)},{labelZh:"達標建議",labelEn:"Target advice",value:"依剩餘權重調整 / Adjust remaining weighted work"}];
    case "educationFund": { const years=Math.max(0,18-a); const fv=b; const monthly=fv/(((Math.pow(1+c/100/12,years*12)-1)/(c/100/12||1))); return [{labelZh:"每月需存",labelEn:"Monthly saving",value:money(monthly)},{labelZh:"目標金額",labelEn:"Target fund",value:money(fv)}]; }
    case "ageAtDate": { const days=daysBetween(v.date1,v.date2); return [{labelZh:"相差天數",labelEn:"Days difference",value:`${safe(days)} days`},{labelZh:"約略年齡",labelEn:"Approx. age",value:`${safe(days/365.25)} years`}]; }
    case "deadline": { const start=new Date(v.date1); let remaining=a, cur=new Date(start); while(remaining>0){cur.setDate(cur.getDate()+1); if(cur.getDay()!==0&&cur.getDay()!==6)remaining--;} return [{labelZh:"截止日期",labelEn:"Deadline",value:cur.toISOString().slice(0,10)}]; }
    case "okr": return [{labelZh:"OKR完成率",labelEn:"OKR progress",value:pct((a+b+c)/3)},{labelZh:"進度條",labelEn:"Progress",value:"█".repeat(Math.round((a+b+c)/30)).padEnd(10,"░")}];
    case "pomodoro": return [{labelZh:"工作/休息",labelEn:"Work/break",value:"25 min / 5 min"},{labelZh:"今日番茄",labelEn:"Pomodoros today",value:safe(a)}];
    case "workHours": return [{labelZh:"實際工時",labelEn:"Work hours",value:`${safe(Math.max(0,b-a-c))} hours`},{labelZh:"週工時",labelEn:"Weekly hours",value:`${safe(Math.max(0,b-a-c)*5)} hours`}];
    case "reading": return [{labelZh:"閱讀時間",labelEn:"Reading time",value:`${safe(a/(b||220))} min`}];
    case "typing": return [{labelZh:"WPM",labelEn:"WPM",value:safe(a)},{labelZh:"準確率",labelEn:"Accuracy",value:pct(b)}];
    case "dateAge": return calculate("ageAtDate",v);
    case "healthAge": return calculate("ageAtDate",v);
    case "alcohol": return [{labelZh:"估算BAC",labelEn:"Estimated BAC",value:`${safe((a*14)/(b*1000*.68)*100-c*.015)}%`}];
    case "bp": return [{labelZh:"血壓分類",labelEn:"BP category",value:a>=140||b>=90?"偏高 / High":a>=120?"升高 / Elevated":"正常 / Normal"}];
    case "bodyFat": return [{labelZh:"體脂率估算",labelEn:"Estimated body fat",value:pct(1.2*a+0.23*b-10.8*c-5.4)}];
    case "dueDate": { const dt=new Date(v.date1); dt.setDate(dt.getDate()+280); return [{labelZh:"預產期",labelEn:"Due date",value:dt.toISOString().slice(0,10)}]; }
    case "heartRate": return [{labelZh:"最大心率",labelEn:"Max heart rate",value:`${safe(220-a)} bpm`},{labelZh:"目標區間",labelEn:"Target zone",value:`${safe((220-a)*.5)}-${safe((220-a)*.85)} bpm`}];
    case "idealWeight": return [{labelZh:"理想體重",labelEn:"Ideal weight",value:`${safe(22*Math.pow(a/100,2))} kg`}];
    case "pregnancy": return calculate("dueDate",v);
    case "vitamin": return [{labelZh:"建議攝取",labelEn:"Recommended intake",value:`${safe(a<70?600:800)} IU/day`},{labelZh:"提醒",labelEn:"Reminder",value:"依醫囑調整 / Follow medical advice"}];
    default: return [{labelZh:"主要結果",labelEn:"Main result",value:safe(a+b+c+d+e),hintZh:"依輸入參數估算",hintEn:"Estimated from inputs"}];
  }
}

export default function ProfessionalToolShell({ config }: { config: ToolConfig }) {
  const [lang, setLang] = useState<Lang>("zh");
  const [values, setValues] = useState<Record<string,string>>(() => Object.fromEntries(config.fields.map(f => [f.key, f.defaultValue])));
  const [copied, setCopied] = useState(false);
  const rows = useMemo(() => calculate(config.kind, values), [config.kind, values]);
  const t = { title: lang==="zh"?config.zhTitle:config.enTitle, desc: lang==="zh"?config.zhDescription:config.enDescription, formula: lang==="zh"?config.formulaZh:config.formulaEn };
  const copy = async () => { await navigator.clipboard.writeText(rows.map(r => `${lang==="zh"?r.labelZh:r.labelEn}: ${r.value}`).join("\n")); setCopied(true); setTimeout(()=>setCopied(false),1200); };
  const clear = () => setValues(Object.fromEntries(config.fields.map(f => [f.key, f.defaultValue])));
  return <main className="container mx-auto max-w-5xl px-4 py-8">
    <div className="mb-6 flex items-start justify-between gap-4"><div><h1 className="text-3xl font-bold">{t.title}</h1><p className="mt-2 text-muted-foreground">{t.desc}</p></div><button className="rounded-lg border px-3 py-2 text-sm" onClick={()=>setLang(lang==="zh"?"en":"zh")}>{lang==="zh"?"EN":"中文"}</button></div>
    <section className="grid gap-6 lg:grid-cols-[1fr_1fr]"><div className="rounded-2xl border bg-card p-5 shadow-sm"><h2 className="mb-4 text-xl font-semibold">{lang==="zh"?"輸入資料":"Inputs"}</h2><div className="space-y-4">{config.fields.map(f=><label key={f.key} className="block"><span className="mb-1 block text-sm font-medium">{lang==="zh"?f.zh:f.en}{" "}<span className="text-muted-foreground">{lang==="zh"?f.unitZh:f.unitEn}</span></span>{f.type==="select"?<select className="w-full rounded-lg border bg-background px-3 py-2" value={values[f.key]} onChange={e=>setValues({...values,[f.key]:e.target.value})}>{f.options?.map(o=><option key={o.value} value={o.value}>{lang==="zh"?o.zh:o.en}</option>)}</select>:f.type==="textarea"?<textarea className="min-h-28 w-full rounded-lg border bg-background px-3 py-2" value={values[f.key]} onChange={e=>setValues({...values,[f.key]:e.target.value})}/>:<input className="w-full rounded-lg border bg-background px-3 py-2" type={f.type||"number"} value={values[f.key]} onChange={e=>setValues({...values,[f.key]:e.target.value})}/>}</label>)}</div><div className="mt-5 flex gap-3"><button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground" onClick={copy}>{copied?(lang==="zh"?"已複製":"Copied"):(lang==="zh"?"一鍵複製":"Copy")}</button><button className="rounded-lg border px-4 py-2" onClick={clear}>{lang==="zh"?"清除":"Clear"}</button></div></div>
    <div className="space-y-4"><div className="rounded-2xl border bg-card p-5 shadow-sm"><h2 className="text-xl font-semibold">{lang==="zh"?"結果":"Results"}</h2><div className="mt-4 grid gap-3">{rows.map((r,i)=><div key={i} className="rounded-xl bg-muted p-4"><div className="text-sm text-muted-foreground">{lang==="zh"?r.labelZh:r.labelEn}</div><div className="text-2xl font-bold">{r.value}</div>{(r.hintZh||r.hintEn)&&<p className="mt-1 text-sm text-muted-foreground">{lang==="zh"?r.hintZh:r.hintEn}</p>}</div>)}</div></div><div className="rounded-2xl border bg-card p-5"><h3 className="font-semibold">{lang==="zh"?"公式":"Formula"}</h3><p className="mt-2 text-sm text-muted-foreground">{t.formula}</p>{(config.noteZh||config.noteEn)&&<p className="mt-3 text-sm text-muted-foreground">{lang==="zh"?config.noteZh:config.noteEn}</p>}</div></div></section>
  </main>;
}
