const express = require('express');
const cors = require('cors');
const wol = require('wakeonlan');
const path = require('path');
const { NodeSSH } = require('node-ssh');

const app = express();
const PORT = 3000;

// Global error handlers to prevent server crashes
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    // Don't exit - keep server running
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    // Don't exit - keep server running
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from current directory

// In-memory device storage
let devices = [];
let nextId = 1;

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API Routes

// Get all devices
app.get('/api/devices', (req, res) => {
    res.json(devices);
});

// Register new device
app.post('/api/devices', (req, res) => {
    const { name, macAddress, ipAddress, sshUsername, sshPassword, description } = req.body;
    
    if (!name || !macAddress) {
        return res.status(400).json({ error: 'Name and MAC address are required' });
    }

    const device = {
        id: nextId++,
        name,
        macAddress: macAddress.toUpperCase(),
        ipAddress,
        sshUsername,
        sshPassword,
        description: description || '',
        createdAt: new Date()
    };

    devices.push(device);
    res.status(201).json(device);
});

// Delete device
app.delete('/api/devices/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = devices.findIndex(d => d.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Device not found' });
    }

    devices.splice(index, 1);
    res.json({ message: 'Device deleted successfully' });
});

// Wake device (Wake-on-LAN)
app.post('/api/devices/:id/wake', (req, res) => {
    const id = parseInt(req.params.id);
    const device = devices.find(d => d.id === id);
    
    if (!device) {
        return res.status(404).json({ error: 'Device not found' });
    }

    // Convert MAC address to colon-separated format (wakeonlan requires this)
    const macFormatted = device.macAddress.replace(/-/g, ':');
    console.log(`Sending WOL packet to ${device.name} (${macFormatted})`);

    wol(macFormatted).then(() => {
        console.log(`WOL packet sent successfully to ${device.name}`);
        res.json({ message: `Wake-on-LAN packet sent to ${device.name}` });
    }).catch((error) => {
        console.error('WOL Error:', error);
        res.status(500).json({ error: 'Failed to send Wake-on-LAN packet', details: error.message });
    });
});

// Helper function to execute SSH command with retry
async function executeSSHCommand(device, command, retries = 2) {
    if (!device.ipAddress) {
        throw new Error('Device IP address not configured');
    }
    
    if (!device.sshUsername || !device.sshPassword) {
        throw new Error('SSH credentials not configured');
    }

    let lastError = null;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
        const ssh = new NodeSSH();
        
        try {
            console.log(`Attempt ${attempt}/${retries}: Connecting to ${device.ipAddress} as ${device.sshUsername}...`);
            
            await ssh.connect({
                host: device.ipAddress,
                username: device.sshUsername,
                password: device.sshPassword,
                timeout: 15000, // Increased timeout
                readyTimeout: 20000
            });

            console.log(`Executing command: ${command}`);
            const result = await ssh.execCommand(command);
            
            ssh.dispose();
            console.log(`Command executed successfully`);
            
            return result;
        } catch (error) {
            ssh.dispose();
            lastError = error;
            console.log(`Attempt ${attempt} failed: ${error.message}`);
            
            if (attempt < retries) {
                console.log(`Waiting 2 seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    
    // All retries failed
    if (lastError.message && lastError.message.includes('All configured authentication methods failed')) {
        throw new Error('SSH authentication failed - check username and password');
    } else if (lastError.message && lastError.message.includes('Timed out')) {
        throw new Error('Connection timeout - SSH may still be starting. Try again in a few seconds.');
    } else if (lastError.code === 'ECONNREFUSED') {
        throw new Error('Connection refused - SSH server may not be running. Wait for laptop to fully boot.');
    } else if (lastError.code === 'ECONNRESET') {
        throw new Error('Connection reset - try again in a few seconds');
    } else {
        throw new Error(`SSH Error: ${lastError.message}`);
    }
}

// Shutdown device via SSH
app.post('/api/devices/:id/shutdown', async (req, res) => {
    const id = parseInt(req.params.id);
    const device = devices.find(d => d.id === id);
    
    if (!device) {
        return res.status(404).json({ error: 'Device not found' });
    }

    try {
        console.log(`Sending shutdown command to ${device.name} at ${device.ipAddress}`);
        
        // Detect OS and use appropriate command
        const shutdownCmd = 'shutdown /s /t 0'; // Windows
        // For Linux/Mac: 'sudo shutdown -h now'
        
        await executeSSHCommand(device, shutdownCmd);
        console.log(`Shutdown command sent successfully to ${device.name}`);
        res.json({ message: `Shutdown command sent to ${device.name}` });
    } catch (error) {
        console.error('Shutdown Error:', error);
        res.status(500).json({ error: 'Failed to shutdown device', details: error.message });
    }
});

// Sleep device via SSH
app.post('/api/devices/:id/sleep', async (req, res) => {
    const id = parseInt(req.params.id);
    const device = devices.find(d => d.id === id);
    
    if (!device) {
        return res.status(404).json({ error: 'Device not found' });
    }

    try {
        console.log(`Sending sleep command to ${device.name} at ${device.ipAddress}`);
        
        // Windows sleep command
        const sleepCmd = 'rundll32.exe powrprof.dll,SetSuspendState 0,1,0';
        // For Linux/Mac: 'systemctl suspend'
        
        await executeSSHCommand(device, sleepCmd);
        console.log(`Sleep command sent successfully to ${device.name}`);
        res.json({ message: `Sleep command sent to ${device.name}` });
    } catch (error) {
        console.error('Sleep Error:', error);
        res.status(500).json({ error: 'Failed to sleep device', details: error.message });
    }
});

// Restart device via SSH
app.post('/api/devices/:id/restart', async (req, res) => {
    const id = parseInt(req.params.id);
    const device = devices.find(d => d.id === id);
    
    if (!device) {
        return res.status(404).json({ error: 'Device not found' });
    }

    try {
        console.log(`Sending restart command to ${device.name} at ${device.ipAddress}`);
        
        // Windows restart command
        const restartCmd = 'shutdown /r /t 0';
        // For Linux/Mac: 'sudo reboot'
        
        await executeSSHCommand(device, restartCmd);
        console.log(`Restart command sent successfully to ${device.name}`);
        res.json({ message: `Restart command sent to ${device.name}` });
    } catch (error) {
        console.error('Restart Error:', error);
        res.status(500).json({ error: 'Failed to restart device', details: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Remote Control Server running on http://localhost:${PORT}`);
    console.log(`📱 Open your browser to start managing devices`);
    console.log(`\n✅ SSH-based system (Wake-on-LAN + SSH)`);
    console.log(`⚡ No agent needed on target devices!`);
});
