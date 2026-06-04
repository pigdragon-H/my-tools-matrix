// Node 20 lacks a global WebSocket constructor that @supabase/realtime-js expects.
// This module installs the `ws` package as globalThis.WebSocket. It MUST be the
// first import in the server entry so the polyfill runs before @supabase/supabase-js
// (createClient) initializes its RealtimeClient, which otherwise throws
// "Node.js 20 detected without native WebSocket support." and crashes the process.
import WebSocket from "ws";

if (typeof (globalThis as unknown as { WebSocket?: unknown }).WebSocket === "undefined") {
  (globalThis as unknown as { WebSocket: unknown }).WebSocket = WebSocket;
}

export {};
