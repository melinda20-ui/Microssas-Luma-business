#!/bin/bash
# Watchdog para agents-api — restart automático se cair

SERVER_DIR="/root/Microssas-Luma-business/agents-api"
LOG_FILE="/tmp/agents-api.log"
PID_FILE="/tmp/agents-api.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        exit 0
    fi
    echo "[Watchdog] PID $PID morto. Reiniciando..."
fi

cd "$SERVER_DIR" || exit 1
nohup node server.js > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
echo "[Watchdog] Servidor reiniciado. PID: $(cat $PID_FILE)" >> "$LOG_FILE"
