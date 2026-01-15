const express = require('express');
const { exec } = require('child_process');
const os = require('os');
const crypto = require('crypto');

// Configuration
const PORT = 8765;
const DEVICE_TOKEN = crypto.randomBytes(32).toString('base64url');

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/status', (req, res) => {
    res.json({
        status: 'online',
        hostname: os.hostname(),
        platform: os.platform(),
        token: DEVICE_TOKEN
    });
});

// Command endpoint
app.post('/command', (req, res) => {
    const { command, token } = req.body;
    
    // Verify token
    if (token !== DEVICE_TOKEN) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Execute command
    switch(command) {
        case 'shutdown':
            res.json({ status: 'shutting down' });
            executeShutdown();
            break;
            
        case 'restart':
            res.json({ status: 'restarting' });
            executeRestart();
            break;
            
        case 'sleep':
            res.json({ status: 'sleeping' });
            executeSleep();
            break;
            
        default:
            res.status(400).json({ error: 'Unknown command' });
    }
});

function executeShutdown() {
    console.log('Executing shutdown...');
    const cmd = os.platform() === 'win32' 
        ? 'shutdown /s /t 0'
        : 'sudo shutdown -h now';
    exec(cmd);
}

function executeRestart() {
    console.log('Executing restart...');
    const cmd = os.platform() === 'win32'
        ? 'shutdown /r /t 0'
        : 'sudo reboot';
    exec(cmd);
}

function executeSleep() {
    console.log('Executing sleep...');
    const cmd = os.platform() === 'win32'
        ? 'rundll32.exe powrprof.dll,SetSuspendState 0,1,0'
        : 'systemctl suspend';
    exec(cmd);
}

// Get local IP
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log('\n' + '='.repeat(60));
    console.log('🔑 DEVICE TOKEN (save this in your remote control app):');
    console.log(`   ${DEVICE_TOKEN}`);
    console.log('='.repeat(60));
    console.log('');
    console.log('🚀 Remote Control Agent Started');
    console.log(`📍 Listening on: http://${localIP}:${PORT}`);
    console.log(`💻 Hostname: ${os.hostname()}`);
    console.log(`🖥️  Platform: ${os.platform()}`);
    console.log('');
    console.log('Waiting for commands from remote control...');
    console.log('Press Ctrl+C to stop');
    console.log('');
});
