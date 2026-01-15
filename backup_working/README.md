# WiFi Remote Laptop Control

A modern web-based remote control system for managing laptop power states over WiFi. Features Wake-on-LAN, SSH-based shutdown/restart commands, and a premium glassmorphism UI.

## 🌟 Features

- **Wake-on-LAN over WiFi** - Power on laptops remotely using magic packets
- **SSH Remote Commands** - Shutdown and restart laptops via SSH
- **Device Management** - Register, view, and manage multiple devices
- **Premium UI** - Modern glassmorphism design with smooth animations
- **Real-time Control** - Execute commands with instant feedback
- **No Ethernet Required** - Works entirely over WiFi networks

## 📋 Prerequisites

### Control Laptop (where this application runs)
- Node.js 14+ installed
- Network connection to target laptops

### Target Laptops (to be controlled)

#### For Wake-on-LAN:
1. **BIOS/UEFI Settings**:
   - Enable "Wake on WLAN" or "Wake on Wireless LAN" in BIOS
   - Look under Power Management or Advanced settings

2. **Windows Network Adapter Settings**:
   - Open Device Manager → Network Adapters
   - Right-click WiFi adapter → Properties → Power Management
   - Check "Allow this device to wake the computer"
   - Go to Advanced tab → Enable "Wake on Magic Packet" and "Wake on Pattern Match"

3. **Network Requirements**:
   - All laptops must be on the same WiFi network/subnet
   - Router must support broadcasting magic packets

> ⚠️ **Important**: Not all WiFi adapters support Wake-on-WLAN. Check your adapter specifications.

#### For Shutdown/Restart:
1. **Install OpenSSH Server**:
   
   **Windows**:
   ```bash
   # Run PowerShell as Administrator
   Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
   Start-Service sshd
   Set-Service -Name sshd -StartupType 'Automatic'
   ```

   **Linux/Mac**:
   ```bash
   sudo apt-get install openssh-server  # Ubuntu/Debian
   sudo systemctl enable ssh
   sudo systemctl start ssh
   ```

2. **Configure Firewall**:
   - Allow SSH connections on port 22
   - Windows: `New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22`

3. **User Permissions** (for shutdown without password prompt):
   
   **Windows**: User must be Administrator
   
   **Linux**: Add to sudoers for passwordless shutdown:
   ```bash
   sudo visudo
   # Add line: yourusername ALL=(ALL) NOPASSWD: /sbin/shutdown, /sbin/reboot
   ```

## 🚀 Installation

1. **Clone or download this repository**

2. **Install dependencies**:
   ```bash
   cd "e:/remote control"
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## 📖 Usage

### Adding a Device

1. Click **"Add New Device"** button
2. Fill in the device information:
   - **Device Name** (required): Friendly name like "Laptop B"
   - **MAC Address** (required): WiFi adapter MAC address (format: AA:BB:CC:DD:EE:FF)
   - **IP Address** (optional): Static IP or current IP for SSH commands
   - **SSH Username** (optional): Username for SSH login
   - **SSH Password** (optional): Password for SSH authentication
   - **Description** (optional): Additional notes
3. Click **"Add Device"**

### Finding MAC Address

**Windows**:
```bash
ipconfig /all
# Look for "Physical Address" under your WiFi adapter
```

**Linux/Mac**:
```bash
ifconfig
# Look for "ether" or "HWaddr" under your WiFi interface (usually wlan0 or en0)
```

### Controlling Devices

- **Power On** (green button): Sends Wake-on-LAN packet to power on the device
- **Shutdown** (red button): Executes shutdown command via SSH (requires SSH credentials)
- **Restart** (orange button): Executes restart command via SSH (requires SSH credentials)

### Deleting a Device

Click the trash icon in the top-right corner of a device card, then confirm the deletion.

## 🔧 Configuration

### Changing Server Port

Edit `server.js` and modify:
```javascript
const PORT = 3000; // Change to your desired port
```

### Using SSH Keys Instead of Passwords

For better security, you can modify the SSH connection in `server.js` to use private keys:

```javascript
await ssh.connect({
    host: device.ipAddress,
    username: device.sshUsername,
    privateKey: fs.readFileSync('/path/to/private/key'),
    timeout: 10000
});
```

## 🐛 Troubleshooting

### Wake-on-LAN Not Working

1. **Verify BIOS settings** - Ensure Wake-on-WLAN is enabled
2. **Check adapter support** - Not all WiFi adapters support WOL
3. **Same network** - Ensure all devices are on the same subnet
4. **Router settings** - Some routers block broadcast packets
5. **Try with ethernet first** - Test if WOL works via ethernet to isolate the issue

### SSH Commands Failing

1. **Test SSH manually**:
   ```bash
   ssh username@ip-address
   ```
2. **Check firewall** - Ensure port 22 is open
3. **Verify credentials** - Double-check username and password
4. **Check SSH service** - Ensure SSH server is running on target
5. **Sudo permissions** - Linux users need passwordless sudo for shutdown/reboot

### Connection Errors

1. **Server not starting** - Check if port 3000 is already in use
2. **API errors** - Check browser console (F12) for error messages
3. **CORS issues** - Ensure the API URL matches the server address

## 🔒 Security Considerations

- **SSH Passwords**: Stored in memory only (not persisted to disk)
- **Production Use**: Consider implementing:
  - SSH key authentication instead of passwords
  - HTTPS/TLS encryption
  - Authentication for web interface
  - Database for persistent device storage
  - Environment variables for sensitive config

## 📦 Technology Stack

- **Backend**: Node.js, Express
- **Wake-on-LAN**: wake_on_lan package
- **SSH**: node-ssh package
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Design**: Glassmorphism with gradient animations

## 📄 License

MIT License - Feel free to use and modify as needed.

## 🤝 Contributing

Contributions welcome! Feel free to submit issues or pull requests.

---

**Built with ❤️ for remote laptop management**
