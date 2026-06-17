import { readFile, writeFile } from "node:fs/promises";
import { convertPdfFreezeToWord } from "../server/lib/pdfFreezeToWord";

const pdf = await readFile(process.argv[2]);
const autoCenter = process.argv[3] === "center";
console.log(`輸入 ${process.argv[2]}  autoCenter=${autoCenter}`);
const r = await convertPdfFreezeToWord(pdf, { dpi: 200, autoCenterHeader: autoCenter });
await writeFile(process.argv[4] || "freeze_out.docx", r.docx);
console.log(`✔ 輸出 ${process.argv[4]}  pages=${r.pages}  recentered=${r.recentered}  ${r.ms}ms  size=${(r.docx.length/1024).toFixed(1)}KB`);
