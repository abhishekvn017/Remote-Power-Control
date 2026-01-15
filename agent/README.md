# Remote Control Agent (Node.js Version)

## ✅ No Python Needed!

This agent runs with Node.js (which you already have installed).

## Quick Start

### 1. Install Dependencies
```bash
cd "e:\remote control\agent"
npm install
```

### 2. Run Agent
```bash
npm start
```

### 3. Copy the TOKEN
You'll see something like:
```
============================================================
🔑 DEVICE TOKEN (save this in your remote control app):
   xYz123AbCdEf...
============================================================
```

**Copy this token** - you'll need it when adding the device in the web UI!

## What It Does

✅ Listens on port **8765**  
✅ Accepts commands: shutdown, restart, sleep  
✅ Uses token authentication  
✅ No passwords needed!

## Usage

1. Keep this agent running on the laptop you want to control
2. Add device in web UI at http://localhost:3000
3. Use the token shown above
4. Done!

## To Run Automatically on Startup (Optional)

Create a `.bat` file:
```batch
@echo off
cd "e:\remote control\agent"
npm start
```

Save as `start-agent.bat` and add to Startup folder.
