#!/bin/bash
# Hermes Health Check & Fix Script
# Neo's self-healing system for React Native

echo "🔍 Checking Hermes health..."

HERMES_PATH="node_modules/react-native/sdks/hermesc/osx-bin/hermes"
BUNDLER_PATH="node_modules/react-native/sdks/hermesc/osx-bin/hermesc"

# Check if Hermes exists
if [ ! -f "$HERMES_PATH" ]; then
    echo "❌ Hermes binary missing!"
    echo "📦 Restoring from backup..."
    
    # Find latest backup
    BACKUP_DIR=$(ls -td ~/Backups/capitalizarte/react-native-backup-* 2>/dev/null | head -1)
    
    if [ -d "$BACKUP_DIR" ]; then
        cp -r "$BACKUP_DIR/"* "node_modules/react-native/"
        echo "✅ Hermes restored from $BACKUP_DIR"
    else
        echo "❌ No backup found! Running npm install..."
        npm install react-native --force
    fi
else
    echo "✅ Hermes binary OK"
fi

# Check if hermesc wrapper works
if [ -f "$BUNDLER_PATH" ]; then
    chmod +x "$BUNDLER_PATH"
    if "$BUNDLER_PATH" --version &>/dev/null; then
        echo "✅ Hermes compiler OK"
    else
        echo "❌ Hermes compiler broken"
        npm install react-native --force
    fi
else
    echo "❌ Hermes wrapper missing"
    npm install react-native --force
fi

echo "✅ Health check complete"