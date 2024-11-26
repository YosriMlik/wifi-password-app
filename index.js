const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');


let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true, // Enable Node.js in renderer process
            contextIsolation: false,
        },
        icon: path.join(__dirname, 'assets/wifi.png'),
    });
    mainWindow.loadFile('index.html');
});

// Handle IPC to fetch Wi-Fi passwords
ipcMain.handle('get-wifi-passwords', async () => {
    return new Promise((resolve, reject) => {
        exec('netsh wlan show profiles', (err, stdout) => {
            if (err) return reject(err);
            const profiles = stdout
                .match(/(?:Profile\s*:\s*)(.+)/g)
                ?.map(line => line.split(': ')[1].trim());

            if (!profiles) return resolve([]);

            const wifiData = [];
            let processed = 0;

            profiles.forEach(profile => {
                exec(`netsh wlan show profile "${profile}" key=clear`, (err, stdout) => {
                    processed++;
                    const passwordMatch = stdout.match(/Key Content\s*:\s*(.+)/);
                    wifiData.push({
                        ssid: profile,
                        password: passwordMatch ? passwordMatch[1].trim() : 'N/A',
                    });
                    if (processed === profiles.length) resolve(wifiData);
                });
            });
        });
    });
});
