// Dev-only bootstrap: installs the WebSocket global (Node 20 lacks it natively)
// BEFORE importing the real server entry, so @supabase/realtime-js can detect it.
// This does NOT modify any server or tool logic; it only fixes the local Node-20
// runtime so Gate 2 (qc_blackhole on :5173) can run. Not used in production build.
import WebSocket from "ws";
// @ts-ignore
if (typeof globalThis.WebSocket === "undefined") globalThis.WebSocket = WebSocket;
await import("../server/_core/index.ts");
