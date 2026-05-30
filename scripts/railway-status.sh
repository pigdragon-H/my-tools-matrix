#!/usr/bin/env bash
# ============================================================
# Railway deploy status checker
# Usage:  ./scripts/railway-status.sh
# Reads RAILWAY_API_TOKEN from /workspace/.env.local
# ============================================================
set -e

if [ -f /workspace/.env.local ]; then
  source /workspace/.env.local
fi

if [ -z "$RAILWAY_API_TOKEN" ]; then
  echo "❌ RAILWAY_API_TOKEN not set in /workspace/.env.local"
  exit 1
fi

PROJECT_ID="a6b12cb3-6fbd-43a0-b26c-66c627a26efd"  # ravishing-prosperity
SERVICE_ID="8bc98b7c-610d-41bc-9f10-4d0260d326fc"  # my-tools-matrix

echo "→ Latest 3 deployments:"
curl -s -X POST https://backboard.railway.app/graphql/v2 \
  -H "Authorization: Bearer $RAILWAY_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query { deployments(first: 3, input: { projectId: \\\"$PROJECT_ID\\\", serviceId: \\\"$SERVICE_ID\\\" }) { edges { node { id status createdAt meta } } } }\"}" \
  | python3 -c "
import sys, json
d = json.load(sys.stdin)
for e in d['data']['deployments']['edges']:
    n = e['node']
    h = n['meta'].get('commitHash','')[:7]
    msg = n['meta'].get('commitMessage','').split('\n')[0][:60]
    print(f\"  {n['status']:10s}  {h}  {n['createdAt'][:19]}  {msg}\")
"

echo ""
echo "→ Live bundle:"
curl -s https://my-tools-matrix-production.up.railway.app/index.html | grep -oE 'index-[A-Za-z0-9]+\.js' | head -1
echo ""
echo "→ /healthz:"
curl -s https://my-tools-matrix-production.up.railway.app/healthz
echo ""
