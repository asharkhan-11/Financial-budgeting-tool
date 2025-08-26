#!/bin/bash

# Load nvm and start the development server
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Starting Financial Budgeting Tool..."
echo "Server will be available at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
