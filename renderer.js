const { ipcRenderer, shell } = require('electron');
const QRCode = require('qrcode');

// Fetch Wi-Fi Passwords
document.getElementById('fetch-btn').addEventListener('click', async () => {
    const wifiList = document.getElementById('wifi-list');
    wifiList.innerHTML = 'Fetching...';

    try {
        const wifiData = await ipcRenderer.invoke('get-wifi-passwords');
        wifiList.innerHTML = `            
            <thead>
                <tr>
                    <th style="width: 150px;">SSID</th>
                    <th>Password</th>
                    <th>QR Code</th>
                </tr>
            </thead>
        `;
        const wifiTableBody = document.createElement('tbody');
        wifiData.forEach(({ ssid, password }) => {
            const wifiDiv = document.createElement('tr');
            wifiDiv.innerHTML = `
                <td><h3>${ssid}</h3></td>
                <td><p>${password}</p></td>
                <td>
                    <button onclick="generateQRCode('${ssid}', '${password}')">Generate QR Code</button>
                    <div class="qr-image" id="qr-${ssid}"></div>
                </td>
            `;
            wifiTableBody.appendChild(wifiDiv);
        });
        wifiList.appendChild(wifiTableBody);

        wifiList.insertAdjacentHTML('beforeend', `
            <button onclick='shell.openExternal("https://www.linkedin.com/in/yosri-mlik/")'>
                By <span class="has-text-info">Yosri Mlik</span> &#169;
            </button>
        `);
    } catch (error) {
        wifiList.innerHTML = 'Error fetching Wi-Fi passwords.';
        console.error(error);
    }
});

// Handle QR Code Generation
window.generateQRCode = async (ssid, password) => {
    const wifiString = `WIFI:T:WPA;S:${ssid};P:${password};;`;
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, wifiString);
    const qrDiv = document.getElementById(`qr-${ssid}`);
    qrDiv.innerHTML = '';
    qrDiv.appendChild(canvas);
};

// Search Wi-Fi List
const searchInput = document.getElementById('searching');
if (searchInput) {
    searchInput.addEventListener('keyup', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        console.log('Searching for:', searchTerm);
        filterWifiList(searchTerm);
    });
} else {
    console.error('Search input not found');
}

function filterWifiList(searchTerm) {
    const rows = document.querySelectorAll('#wifi-list tbody tr');
    rows.forEach(row => {
        const ssid = row.querySelector('td h3').textContent.toLowerCase();
        if (ssid.includes(searchTerm)) {
            row.style.display = ''; // Show row
        } else {
            row.style.display = 'none'; // Hide row
        }
    });
}
