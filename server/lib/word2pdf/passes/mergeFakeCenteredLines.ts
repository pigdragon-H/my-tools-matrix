import { escapeXml, unescapeXml } from "../xml/text";
import { normalizeSelfClosingParagraphTags } from "../xml/safety";

/**
 * UNIVERSAL: merge a fake-centred mixed-script single line into one run while
 * preserving a trailing hyperlink verbatim.
 */
export function mergeFakeCentredTextLines(xml: string): string {
  const normalizedXml = normalizeSelfClosingParagraphTags(xml);
  return normalizedXml.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g, (para) => {
    if (!para.includes("<w:hyperlink")) return para;
    if (para.includes("<w:drawing")) return para;
    const pprEnd = para.indexOf("</w:pPr>");
    const head =
      pprEnd === -1
        ? para.slice(0, para.indexOf(">") + 1)
        : para.slice(0, pprEnd + "</w:pPr>".length);
    const body = para.slice(head.length, para.length - "</w:p>".length);

    const hlMatch = body.match(/<w:hyperlink\b[\s\S]*?<\/w:hyperlink>/);
    if (!hlMatch) return para;
    let hyperlink = hlMatch[0];
    const preHyperlink = body.slice(0, body.indexOf(hyperlink));

    const faMatch = preHyperlink.match(/w:eastAsia="([^"]+)"/);
    const eastAsia = faMatch ? faMatch[1] : "新細明體";
    const szMatch = preHyperlink.match(/<w:sz w:val="(\d+)"/);
    const sz = szMatch ? szMatch[1] : "20";
    const boldRun = /<w:b\/>/.test(preHyperlink);

    const urlText = [...hyperlink.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)]
      .map((m) => unescapeXml(m[1] ?? ""))
      .join("")
      .trim();

    let merged = "";
    for (const m of preHyperlink.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)) {
      merged += unescapeXml(m[1] ?? "");
    }
    if (urlText) {
      const esc = urlText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      merged = merged.replace(new RegExp(esc, "g"), "");
      merged = merged.replace(/https?:\/\/\S+/g, (u) =>
        urlText.includes(u.replace(/^https?:\/\//, "")) ? "" : u,
      );
    }
    const mergedText = merged.replace(/^\s+/, "").replace(/\s+$/, "") + "  ";

    const font =
      preHyperlink.match(/<w:rFonts\b[^>]*\/>/)?.[0] ??
      `<w:rFonts w:eastAsia="${eastAsia}" w:cs="${eastAsia}" w:hint="eastAsia"/>`;
    const mergedRun =
      "<w:r><w:rPr>" +
      font +
      (boldRun ? "<w:b/><w:bCs/>" : "") +
      `<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr>` +
      '<w:t xml:space="preserve">' +
      escapeXml(mergedText) +
      "</w:t></w:r>";

    if (!/<w:rPr>[\s\S]*?<w:rFonts/.test(hyperlink)) {
      if (/<w:rPr>/.test(hyperlink)) {
        hyperlink = hyperlink.replace(/<w:rPr>/, `<w:rPr>${font}`);
      } else {
        hyperlink = hyperlink.replace(
          /<w:r\b([^>]*)>/,
          `<w:r$1><w:rPr>${font}<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr>`,
        );
      }
      hyperlink = hyperlink
        .replace(/<w:sz w:val="\d+"\/>/, `<w:sz w:val="${sz}"/>`)
        .replace(/<w:szCs w:val="\d+"\/>/, `<w:szCs w:val="${sz}"/>`);
    }

    return head + mergedRun + hyperlink + "</w:p>";
  });
}
