#!/bin/bash
# Install Quest Watcher as a macOS LaunchAgent (auto-start at login)

set -e

PLIST_NAME="com.quest.watcher.plist"
PLIST_DST="$HOME/Library/LaunchAgents/$PLIST_NAME"
QUEST_DIR="$(cd "$(dirname "$0")" && pwd)"
NODE_PATH="$(which node)"

if [ -z "$NODE_PATH" ]; then
  echo "Error: node not found in PATH"
  exit 1
fi

# Unload previous version if exists
launchctl unload "$PLIST_DST" 2>/dev/null || true

# Generate plist with detected paths
cat > "$PLIST_DST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.quest.watcher</string>
    <key>ProgramArguments</key>
    <array>
        <string>${NODE_PATH}</string>
        <string>${QUEST_DIR}/watcher.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/quest-watcher.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/quest-watcher.log</string>
</dict>
</plist>
EOF

echo "Plist generated → ~/Library/LaunchAgents/$PLIST_NAME"
echo "  Node:  $NODE_PATH"
echo "  Quest: $QUEST_DIR"

# Load the agent
launchctl load "$PLIST_DST"
echo ""
echo "Watcher installed and running."
echo ""
echo "To stop:    launchctl unload ~/Library/LaunchAgents/$PLIST_NAME"
echo "To restart: launchctl unload ~/Library/LaunchAgents/$PLIST_NAME && launchctl load ~/Library/LaunchAgents/$PLIST_NAME"
echo "Logs:       tail -f /tmp/quest-watcher.log"
