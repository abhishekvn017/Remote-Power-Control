# Agent-Based Remote Control Setup

## 🎯 What Changed

**✅ NO MORE SSH**
- No SSH passwords stored
- No SSH configuration needed
- Simple agent-based communication

## 📦 Quick Start

### Step 1: Install Backend Dependencies

```bash
cd "e:\remote control"
npm install
npm start
```

Server will run on: `http://localhost:3000`

### Step 2: Install Agent on Target Laptop

**On the laptop you want to control:**

1. Make sure Python is installed (download from python.org if needed)
2. Navigate to agent folder:
   ```bash
   cd "e:\remote control\agent"
   python agent.py
   ```

3. **Copy the TOKEN** that appears in console (looks like: `xYz123AbC...`)

### Step 3: Add Device in Web UI

1. Open browser → http://localhost:3000
2. Click "Add New Device"
3. Fill in:
   - **Device Name**: e.g., "Laptop B"
   - **MAC Address**: Network adapter MAC (for Wake-on-LAN)
   - **IP Address**: Laptop's local IP (e.g., 192.168.1.100)
   - **Agent Port**: 8765 (default)
   - **Device Token**: Paste token from agent console
4. Click "Add Device"

### Step 4: Test!

- **Power On**: Uses Wake-on-LAN (laptop can be off)
- **Shutdown/Restart/Sleep**: Requires agent running on laptop

## 🔒 Security Improvements

✅ No passwords stored
✅ Token-based authentication
✅ Each device has unique token
✅ Agent only accepts commands with valid token

## 📝 Notes

- Agent must be running for shutdown/restart/sleep commands
- Power On works even when laptop is off (Wake-on-LAN)
- Keep agent running in background for full control
- Token is shown only once when agent starts (save it!)

## 🔄 To Revert to SSH Version

If you want to go back to the previous SSH-based system, I can restore it - just ask!
