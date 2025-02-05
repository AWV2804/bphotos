#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' "$(dirname "$0")/.env" | xargs)
echo "$(dirname "$0")/.env"

# Check the argument passed to the script
if [ "$1" == "b" ]; then
    PORT=$BACKEND_PORT
elif [ "$1" == "f" ]; then
    PORT=$FRONTEND_PORT
else
    echo "Invalid argument. Use 'b' for BACKEND_PORT or 'f' for FRONTEND_PORT."
    exit 1
fi

# Find the process running on the specified port and kill it
PID=$(sudo lsof -t -i :$PORT)

if [ -z "$PID" ]; then
    echo "No process is running on port $PORT."
else
    sudo kill -9 $PID
    echo "Killed process $PID running on port $PORT."
fi
