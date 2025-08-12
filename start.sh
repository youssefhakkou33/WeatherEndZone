#!/bin/bash

# WeatherEndZone Startup Script
# For Unix/Linux/macOS systems

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}"
echo "==============================================="
echo "            WeatherEndZone Setup"
echo "     Weather, Time & News Hub"
echo "==============================================="
echo -e "${NC}"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo -e "${RED}❌ Python is not installed or not in PATH${NC}"
        echo "Please install Python from https://python.org"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

echo -e "${GREEN}✅ Python found!${NC}"
echo

# Check if required files exist
required_files=("index.html" "script.js" "styles.css")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Missing file: $file${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ All required files found${NC}"

# Create config.js if it doesn't exist
if [ ! -f "config.js" ] && [ -f "config.example.js" ]; then
    echo -e "${YELLOW}📝 Creating config.js from example...${NC}"
    cp config.example.js config.js
    echo -e "${GREEN}✅ config.js created${NC}"
    echo -e "${YELLOW}⚠️  Please edit config.js and add your API keys${NC}"
fi

echo
echo -e "${BLUE}🚀 Starting WeatherEndZone server...${NC}"
echo
echo -e "${GREEN}📱 Open your browser and go to: http://localhost:8000${NC}"
echo -e "${YELLOW}⏹️  Press Ctrl+C to stop the server${NC}"
echo

# Start the server
$PYTHON_CMD -m http.server 8000
