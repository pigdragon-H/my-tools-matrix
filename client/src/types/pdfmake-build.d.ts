// Type shims for pdfmake's prebuilt browser bundles, which ship without
// TypeScript definitions. We only need a permissive surface: createPdf,
// vfs, fonts, and addVirtualFileSystem.
declare module "pdfmake/build/pdfmake" {
  interface PdfMakeStatic {
    createPdf: (docDefinition: any) => {
      getBlob: (cb: (blob: Blob) => void) => void;
      download: (filename?: string) => void;
      getBase64: (cb: (data: string) => void) => void;
    };
    vfs?: Record<string, string>;
    fonts?: Record<string, Record<string, string>>;
    addVirtualFileSystem?: (vfs: Record<string, string>) => void;
    [key: string]: any;
  }
  const pdfMake: PdfMakeStatic;
  export default pdfMake;
}

declare module "pdfmake/build/vfs_fonts" {
  const vfs: Record<string, string> & {
    vfs?: Record<string, string>;
    pdfMake?: { vfs: Record<string, string> };
    default?: any;
  };
  export = vfs;
}
