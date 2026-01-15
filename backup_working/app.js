// API Configuration
const API_URL = 'http://localhost:3000/api';

// State
let devices = [];
let confirmCallback = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized');
    loadDevices();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    document.getElementById('addDeviceBtn').addEventListener('click', openAddDeviceModal);
    document.getElementById('addDeviceForm').addEventListener('submit', handleAddDevice);
}

// Load devices from API
async function loadDevices() {
    console.log('Loading devices...');
    try {
        const response = await fetch(`${API_URL}/devices`);
        if (!response.ok) throw new Error('Failed to load devices');
        
        devices = await response.json();
        console.log('Loaded devices:', devices);
        renderDevices();
    } catch (error) {
        console.error('Error loading devices:', error);
        showNotification('Failed to load devices', 'error');
    }
}

// Render devices to the grid using DOM API (no innerHTML)
function renderDevices() {
    console.log('Rendering devices...');
    const deviceGrid = document.getElementById('deviceGrid');
    const emptyState = document.getElementById('emptyState');
    const deviceCount = document.getElementById('deviceCount');

    deviceCount.textContent = devices.length;

    // Clear existing content
    deviceGrid.innerHTML = '';

    if (devices.length === 0) {
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');

    // Create device cards using DOM API
    devices.forEach(device => {
        const card = createDeviceCard(device);
        deviceGrid.appendChild(card);
    });
}

// Create a device card element
function createDeviceCard(device) {
    const card = document.createElement('div');
    card.className = 'device-card';
    
    // Header
    const header = document.createElement('div');
    header.className = 'device-header';
    
    const deviceInfo = document.createElement('div');
    deviceInfo.className = 'device-info';
    
    const h3 = document.createElement('h3');
    h3.textContent = device.name;
    
    const status = document.createElement('div');
    status.className = 'device-status';
    status.innerHTML = '<span class="status-dot"></span> Registered';
    
    deviceInfo.appendChild(h3);
    deviceInfo.appendChild(status);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
    `;
    deleteBtn.addEventListener('click', () => {
        console.log('Delete clicked for:', device.name);
        confirmDelete(device.id, device.name);
    });
    
    header.appendChild(deviceInfo);
    header.appendChild(deleteBtn);
    
    // Details
    const details = document.createElement('div');
    details.className = 'device-details';
    
    details.innerHTML = `
        <div class="detail-item">
            <span class="detail-label">MAC Address</span>
            <span class="detail-value">${device.macAddress}</span>
        </div>
        ${device.ipAddress ? `
        <div class="detail-item">
            <span class="detail-label">IP Address</span>
            <span class="detail-value">${device.ipAddress}</span>
        </div>
        ` : ''}
        ${device.sshUsername ? `
        <div class="detail-item">
            <span class="detail-label">SSH User</span>
            <span class="detail-value">${device.sshUsername}</span>
        </div>
        ` : ''}
        ${device.description ? `
        <p class="device-description">${device.description}</p>
        ` : ''}
    `;
    
    // Actions
    const actions = document.createElement('div');
    actions.className = 'device-actions';
    
    // Enable SSH buttons as long as device has IP address
    // (SSH credentials are required fields when adding a device)
    const hasSSHConfig = !!device.ipAddress;
    
    // Power On Button
    const powerOnBtn = createActionButton(
        'power-on',
        'Power On',
        '<path d="M12 2v10m0 0L8 8m4 4l4-4"></path><circle cx="12" cy="12" r="10"></circle>',
        () => {
            console.log('Power On clicked for:', device.name);
            wakeDevice(device.id, device.name);
        }
    );
    actions.appendChild(powerOnBtn);
    
    // Sleep Button
    const sleepBtn = createActionButton(
        'sleep',
        'Sleep',
        '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>',
        () => {
            console.log('Sleep clicked for:', device.name);
            confirmSleep(device.id, device.name);
        },
        !hasSSHConfig
    );
    actions.appendChild(sleepBtn);
    
    // Shutdown Button
    const shutdownBtn = createActionButton(
        'shutdown',
        'Shutdown',
        '<path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line>',
        () => {
            console.log('Shutdown clicked for:', device.name);
            confirmShutdown(device.id, device.name);
        },
        !hasSSHConfig
    );
    actions.appendChild(shutdownBtn);
    
    // Restart Button
    const restartBtn = createActionButton(
        'restart',
        'Restart',
        '<polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>',
        () => {
            console.log('Restart clicked for:', device.name);
            confirmRestart(device.id, device.name);
        },
        !hasSSHConfig
    );
    actions.appendChild(restartBtn);
    
    // Assemble card
    card.appendChild(header);
    card.appendChild(details);
    card.appendChild(actions);
    
    return card;
}

// Helper to create action buttons
function createActionButton(className, label, svgPath, clickHandler, disabled = false) {
    const btn = document.createElement('button');
    btn.className = `action-btn ${className}`;
    btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${svgPath}
        </svg>
        ${label}
    `;
    
    if (disabled) {
        btn.disabled = true;
    } else {
        btn.addEventListener('click', clickHandler);
    }
    
    return btn;
}

// Modal functions
function openAddDeviceModal() {
    document.getElementById('addDeviceModal').classList.add('show');
    document.getElementById('addDeviceForm').reset();
}

function closeAddDeviceModal() {
    document.getElementById('addDeviceModal').classList.remove('show');
}

function openConfirmModal(title, message, callback) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    document.getElementById('confirmModal').classList.add('show');
    
    confirmCallback = callback;
    
    const confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.onclick = () => {
        if (confirmCallback) {
            confirmCallback();
            confirmCallback = null;
        }
        closeConfirmModal();
    };
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('show');
    confirmCallback = null;
}

// Device operations
async function handleAddDevice(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('deviceName').value,
        macAddress: document.getElementById('macAddress').value,
        ipAddress: document.getElementById('ipAddress').value,
        sshUsername: document.getElementById('sshUsername').value,
        sshPassword: document.getElementById('sshPassword').value,
        description: document.getElementById('description').value
    };

    console.log('Adding device:', formData.name);

    try {
        const response = await fetch(`${API_URL}/devices`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to add device');
        }

        showNotification('Device added successfully', 'success');
        closeAddDeviceModal();
        loadDevices();
    } catch (error) {
        console.error('Error adding device:', error);
        showNotification(error.message, 'error');
    }
}

async function wakeDevice(id, name) {
    console.log(`Waking device: ${name} (ID: ${id})`);
    try {
        const response = await fetch(`${API_URL}/devices/${id}/wake`, {
            method: 'POST'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to wake device');
        }

        showNotification(`Wake-on-LAN packet sent to ${name}`, 'success');
    } catch (error) {
        console.error('Error waking device:', error);
        showNotification(error.message, 'error');
    }
}

function confirmShutdown(id, name) {
    console.log(`Confirm shutdown for: ${name} (ID: ${id})`);
    openConfirmModal(
        'Confirm Shutdown',
        `Are you sure you want to shutdown "${name}"? This will immediately power off the device.`,
        () => shutdownDevice(id, name)
    );
}

async function shutdownDevice(id, name) {
    console.log(`Shutting down device: ${name} (ID: ${id})`);
    try {
        const response = await fetch(`${API_URL}/devices/${id}/shutdown`, {
            method: 'POST'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to shutdown device');
        }

        showNotification(`Shutdown command sent to ${name}`, 'success');
    } catch (error) {
        console.error('Error shutting down device:', error);
        showNotification(error.message, 'error');
    }
}

function confirmRestart(id, name) {
    console.log(`Confirm restart for: ${name} (ID: ${id})`);
    openConfirmModal(
        'Confirm Restart',
        `Are you sure you want to restart "${name}"? This will immediately reboot the device.`,
        () => restartDevice(id, name)
    );
}

async function restartDevice(id, name) {
    console.log(`Restarting device: ${name} (ID: ${id})`);
    try {
        const response = await fetch(`${API_URL}/devices/${id}/restart`, {
            method: 'POST'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to restart device');
        }

        showNotification(`Restart command sent to ${name}`, 'success');
    } catch (error) {
        console.error('Error restarting device:', error);
        showNotification(error.message, 'error');
    }
}

function confirmSleep(id, name) {
    console.log(`Confirm sleep for: ${name} (ID: ${id})`);
    openConfirmModal(
        'Confirm Sleep',
        `Are you sure you want to put "${name}" to sleep? The device will enter low-power mode and can be woken via network activity.`,
        () => sleepDevice(id, name)
    );
}

async function sleepDevice(id, name) {
    console.log(`Putting device to sleep: ${name} (ID: ${id})`);
    try {
        const response = await fetch(`${API_URL}/devices/${id}/sleep`, {
            method: 'POST'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to sleep device');
        }

        showNotification(`Sleep command sent to ${name}`, 'success');
    } catch (error) {
        console.error('Error putting device to sleep:', error);
        showNotification(error.message, 'error');
    }
}

function confirmDelete(id, name) {
    console.log(`Confirm delete for: ${name} (ID: ${id})`);
    openConfirmModal(
        'Delete Device',
        `Are you sure you want to remove "${name}" from the device list? This action cannot be undone.`,
        () => deleteDevice(id)
    );
}

async function deleteDevice(id) {
    console.log(`Deleting device ID: ${id}`);
    try {
        const response = await fetch(`${API_URL}/devices/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete device');
        }

        showNotification('Device removed successfully', 'success');
        loadDevices();
    } catch (error) {
        console.error('Error deleting device:', error);
        showNotification(error.message, 'error');
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    alert(message);
}
