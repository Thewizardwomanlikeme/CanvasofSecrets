#!/bin/bash
echo "Verifying local environment for Vitra Arcana..."

# Check Node version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    exit 1
fi
NODE_VERSION=$(node -v)
echo "✅ Node.js installed: $NODE_VERSION"

# Check NPM
if ! command -v npm &> /dev/null; then
    echo "❌ NPM is not installed."
    exit 1
fi
echo "✅ NPM installed: $(npm -v)"

# Check .env file
if [ ! -f .env ]; then
    echo "❌ .env file is missing. Please copy .env.example to .env and configure GEMINI_API_KEY."
else
    if grep -q "GEMINI_API_KEY=\"MY_GEMINI_API_KEY\"" .env; then
        echo "❌ GEMINI_API_KEY in .env is still the default. Please set a valid API key."
    else
        echo "✅ .env file exists and GEMINI_API_KEY is configured."
    fi
fi

# Check missing node_modules
if [ ! -d node_modules ]; then
    echo "⚠️ node_modules not found. Run 'npm install' to install dependencies."
else
    echo "✅ node_modules found."
fi

echo "Environment check complete."
