#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR"

# Ensure logs directory exists
mkdir -p "$PROJECT_ROOT/logs"

# Run the update script
echo "----------------------------------------" >> "$PROJECT_ROOT/logs/music_update.log"
echo "Running music update at $(date)" >> "$PROJECT_ROOT/logs/music_update.log"

# Use the node executable from the environment or default
NODE_EXEC=$(which node || echo "/usr/local/bin/node")

"$NODE_EXEC" "$PROJECT_ROOT/backend/scripts/update_music.js" >> "$PROJECT_ROOT/logs/music_update.log" 2>&1

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "Update finished successfully" >> "$PROJECT_ROOT/logs/music_update.log"
else
    echo "Update failed with exit code $EXIT_CODE" >> "$PROJECT_ROOT/logs/music_update.log"
fi
