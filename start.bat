@echo off
title WeatherEndZone Setup
color 0B

echo.
echo ===============================================
echo            WeatherEndZone Setup
echo     Weather, Time ^& News Hub
echo ===============================================
echo.

echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo Python found!
echo.

echo Starting WeatherEndZone...
echo.
echo Open your browser and go to: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

python -m http.server 8000

pause
