# 🖥️ WiFi Remote Laptop Control

> A modern web-based remote control system for managing laptop power states over WiFi with Wake-on-LAN and SSH capabilities.

[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

![Remote Control Demo](https://img.shields.io/badge/Status-Active-success)

---

## ✨ Features

- 🌐 **Wake-on-LAN over WiFi** - Power on laptops remotely using magic packets
- 🔌 **SSH Remote Commands** - Shutdown, restart, and sleep laptops via SSH
- 📱 **Device Management** - Register, view, and manage multiple devices
- 🎨 **Premium UI** - Modern glassmorphism design with smooth animations
- ⚡ **Real-time Control** - Execute commands with instant feedback
- 📡 **WiFi-First** - Works entirely over WiFi networks (no Ethernet required)

---

## 📋 Prerequisites

### Control Laptop (where this application runs)

- [Node.js 14+](https://nodejs.org/) installed
- Network connection to target laptops

### Target Laptops (to be controlled)

#### For Wake-on-LAN:

1. **BIOS/UEFI Settings**:
   - Enable "Wake on WLAN" or "Wake on Wireless LAN" in BIOS
   - Look under Power Management or Advanced settings

2. **Windows Network Adapter Settings**:
   - Open Device Manager → Network Adapters
   - Right-click WiFi adapter → Properties → Power Management
   - ✅ Check "Allow this device to wake the computer"
   - Go to Advanced tab → Enable "Wake on Magic Packet" and "Wake on Pattern Match"

3. **Network Requirements**:
   - All laptops must be on the same WiFi network/subnet
   - Router must support broadcasting magic packets

> ⚠️ **Important**: Not all WiFi adapters support Wake-on-WLAN. Check your adapter specifications.

#### For Shutdown/Restart/Sleep:

<details>
<summary><b>Windows Setup</b></summary>

**1. Install OpenSSH Server**

Open PowerShell as Administrator and run:

```powershell
# Install OpenSSH Server
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0

# Start the service
Start-Service sshd

# Set to start automatically
Set-Service -Name sshd -StartupType 'Automatic'

# Configure firewall
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
```

**2. Requirements**
- User must have Administrator privileges

</details>

<details>
<summary><b>Linux/Mac Setup</b></summary>

**1. Install OpenSSH Server**

```bash
# Ubuntu/Debian
sudo apt-get install openssh-server

# Enable and start service
sudo systemctl enable ssh
sudo systemctl start ssh
```

**2. Configure Passwordless Shutdown**

```bash
sudo visudo
# Add this line (replace 'yourusername'):
yourusername ALL=(ALL) NOPASSWD: /sbin/shutdown, /sbin/reboot
```

</details>

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/remote-control.git

# Navigate to directory
cd remote-control

# Install dependencies
npm install

# Start the server
npm start
```

The server will start at `http://localhost:3000`

---

## 📖 Usage Guide

### 1️⃣ Adding a Device

1. Click **"Add New Device"** button
2. Fill in the device information:
   - **Device Name** (required): Friendly name like "Laptop B"
   - **MAC Address** (required): WiFi adapter MAC address
   - **IP Address** (optional): Static IP or current IP for SSH commands
   - **SSH Username** (optional): Username for SSH login
   - **SSH Password** (optional): Password for SSH authentication
   - **Description** (optional): Additional notes
3. Click **"Add Device"**

### 2️⃣ Finding Your MAC Address

<details>
<summary><b>Windows</b></summary>

```bash
ipconfig /all
```
Look for "Physical Address" under your WiFi adapter

</details>

<details>
<summary><b>Linux/Mac</b></summary>

```bash
ifconfig
# OR
ip link show
```
Look for "ether" or "HWaddr" under your WiFi interface (usually wlan0 or en0)

</details>

### 3️⃣ Controlling Devices

- 🟢 **Power On** - Sends Wake-on-LAN packet to power on the device
- 🔴 **Shutdown** - Executes shutdown command via SSH (requires SSH credentials)
- 🟠 **Restart** - Executes restart command via SSH (requires SSH credentials)
- 🟣 **Sleep** - Puts device to sleep via SSH (requires SSH credentials)

### 4️⃣ Deleting a Device

Click the trash icon (🗑️) in the top-right corner of a device card, then confirm the deletion.

---

## ⚙️ Configuration

### Changing Server Port

Edit `server.js` and modify:

```javascript
const PORT = 3000; // Change to your desired port
```

### Using SSH Keys (Recommended for Production)

For better security, modify the SSH connection in `server.js`:

```javascript
const fs = require('fs');

await ssh.connect({
    host: device.ipAddress,
    username: device.sshUsername,
    privateKey: fs.readFileSync('/path/to/private/key'),
    timeout: 10000
});
```

---

## 🐛 Troubleshooting

### Wake-on-LAN Not Working

| Issue | Solution |
|-------|----------|
| BIOS settings | Ensure Wake-on-WLAN is enabled in BIOS |
| Adapter support | Not all WiFi adapters support WOL - check specs |
| Network | Ensure all devices are on the same subnet |
| Router | Some routers block broadcast packets |
| Testing | Try with Ethernet first to isolate WiFi issues |

### SSH Commands Failing

```bash
# 1. Test SSH manually
ssh username@ip-address

# 2. Check SSH service status
# Windows (PowerShell):
Get-Service sshd

# Linux/Mac:
sudo systemctl status ssh
```

**Common issues:**
- ❌ Firewall blocking port 22
- ❌ Incorrect username/password
- ❌ SSH service not running
- ❌ (Linux) Missing passwordless sudo permissions

### Connection Errors

- **Port in use**: Change the PORT in `server.js`
- **API errors**: Check browser console (F12) for details
- **Module not found**: Run `npm install` again



---

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Node.js, Express |
| **Wake-on-LAN** | `wakeonlan` package |
| **SSH** | `node-ssh` package |
| **Frontend** | Vanilla HTML/CSS/JavaScript |
| **Design** | Glassmorphism with gradient animations |

---

## 📂 Project Structure

```
remote-control/
├── server.js           # Express server & API endpoints
├── index.html          # Frontend UI
├── styles.css          # Glassmorphism styling
├── package.json        # Dependencies
├── agent/              # Optional agent-based system
└── README.md           # This file
```



---

## 🙏 Acknowledgments

This project was built to simplify remote laptop management and power control over WiFi networks.

---

<div align="center">

**Developed by V n Abhishek**

</div>
