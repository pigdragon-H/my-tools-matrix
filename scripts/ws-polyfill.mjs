// Node 20 lacks a global WebSocket constructor that @supabase/realtime-js expects.
// This preload (loaded via --import) installs `ws` as globalThis.WebSocket so the
// dev server can boot locally for Gate 2 (qc_blackhole). No app logic is changed.
import WebSocket from "ws";
if (typeof globalThis.WebSocket === "undefined") {
  // @ts-ignore
  globalThis.WebSocket = WebSocket;
}
