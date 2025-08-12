#!/usr/bin/env python3
"""
WeatherEndZone Setup Script
Simple setup script to help users get started with the weather app
"""

import os
import shutil
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading
import time

def print_banner():
    print("""
    ╔══════════════════════════════════════════╗
    ║            WeatherEndZone                ║
    ║     Weather, Time & News Hub             ║
    ╚══════════════════════════════════════════╝
    """)

def check_files():
    """Check if all required files exist"""
    required_files = ['index.html', 'script.js', 'styles.css']
    missing_files = []
    
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Missing files: {', '.join(missing_files)}")
        return False
    else:
        print("✅ All required files found")
        return True

def setup_config():
    """Setup configuration file"""
    if not os.path.exists('config.js'):
        if os.path.exists('config.example.js'):
            print("📝 Creating config.js from example...")
            shutil.copy('config.example.js', 'config.js')
            print("✅ config.js created")
            print("⚠️  Please edit config.js and add your API keys")
        else:
            print("⚠️  config.example.js not found")
    else:
        print("✅ config.js already exists")

def start_server(port=8000):
    """Start a simple HTTP server"""
    try:
        server = HTTPServer(('localhost', port), SimpleHTTPRequestHandler)
        print(f"🚀 Starting server on http://localhost:{port}")
        
        # Open browser in a separate thread
        def open_browser():
            time.sleep(1)  # Wait for server to start
            webbrowser.open(f'http://localhost:{port}')
        
        browser_thread = threading.Thread(target=open_browser)
        browser_thread.daemon = True
        browser_thread.start()
        
        print("🌐 Opening browser...")
        print("📝 Press Ctrl+C to stop the server")
        server.serve_forever()
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {port} is already in use")
            try_port = port + 1
            print(f"🔄 Trying port {try_port}...")
            start_server(try_port)
        else:
            print(f"❌ Error starting server: {e}")

def show_api_instructions():
    """Show instructions for getting API keys"""
    print("""
    📋 API Setup Instructions:
    
    1. OpenWeatherMap API (Required):
       • Go to: https://openweathermap.org/api
       • Sign up for a free account
       • Get your API key from the dashboard
       • Free tier: 1,000 calls/day
    
    2. NewsAPI (Optional):
       • Go to: https://newsapi.org/
       • Sign up for a free account
       • Get your API key
       • Free tier: 1,000 requests/month
       • Note: App works with mock data if not provided
    
    3. Edit config.js and replace the placeholder API keys
    """)

def main():
    print_banner()
    
    print("🔍 Checking setup...")
    
    if not check_files():
        print("❌ Setup incomplete. Please ensure all files are present.")
        return
    
    setup_config()
    
    print("\n" + "="*50)
    show_api_instructions()
    print("="*50)
    
    while True:
        choice = input("\nWhat would you like to do?\n1. Start development server\n2. Show API instructions again\n3. Exit\n\nChoice (1-3): ").strip()
        
        if choice == '1':
            start_server()
            break
        elif choice == '2':
            show_api_instructions()
        elif choice == '3':
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please enter 1, 2, or 3.")

if __name__ == "__main__":
    main()
