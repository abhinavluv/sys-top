const path = require('path');
const { ipcRenderer } = require('electron');
const osu = require('node-os-utils');
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

let cpuOverload;
let alertFrequency;

// Get settings and values
ipcRenderer.on('settings:get', (event, settings) => {
    cpuOverload = +settings.cpuOverload;
    alertFrequency = +settings.alertFrequency;
});

// Run every 2s
setInterval(() => {
    // CPU usage
    cpu.usage().then((info) => {
        document.getElementById('cpu-usage').innerText = info + ' %';

        // Progress Bar
        document.getElementById('cpu-progress').style.width = info + '%';

        // Make progress bar red if crosses cpuOverload
        if (info >= cpuOverload) {
            document.getElementById('cpu-progress').style.background = 'red';
            document.getElementById('cpu-usage').style.color = 'red';
        } else {
            document.getElementById('cpu-progress').style.background =
                '#30c88b';
            document.getElementById('cpu-usage').style.color = '#30c88b';
        }

        // Check overload
        if (info >= cpuOverload && runNotify(alertFrequency)) {
            notifyUser({
                title: 'CPU Overload',
                body: `CPU is over ${cpuOverload} %`,
                icon: path.join(__dirname, 'img', 'icon.png'),
            });

            localStorage.setItem('lastNotify', +new Date());
        }
    });

    // CPU free
    cpu.free().then((info) => {
        document.getElementById('cpu-free').innerText = info + ' %';
    });

    // OS Uptime
    document.getElementById('sys-uptime').innerText = secondsToDhms(
        os.uptime()
    );
}, 2000);

// Set model
document.getElementById('cpu-model').innerText = cpu.model();

// Computer Name
document.getElementById('comp-name').innerText = os.hostname();

// OS
document.getElementById('os').innerText = `${os.type()} ${os.arch()}`;

// Total Memory
mem.info().then((info) => {
    document.getElementById('mem-total').innerText = info.totalMemMb;
});

// Show days, Hours, Mins, Seconds
let secondsToDhms = (seconds) => {
    // converting seconds to a number if already not
    seconds = +seconds;
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const sec = Math.floor(seconds % 60);
    return `${days} Days, ${hours} Hours, ${minutes} Minutes, ${sec} Seconds`;
};

// Send notification
function notifyUser(options) {
    new Notification(options.title, options);
}

// Check how much time has passed since notification
function runNotify(frequency) {
    if (localStorage.getItem('lastNotify') === null) {
        // Store timestamp
        localStorage.setItem('lastNotify', +new Date());
        return true;
    }
    const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')));
    const now = new Date();
    const diffTime = Math.abs(now - notifyTime);
    const minutesPassed = Math.ceil(diffTime / (1000 * 60));

    if (minutesPassed > frequency) {
        return true;
    } else {
        return false;
    }
}
