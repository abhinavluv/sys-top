const { BrowserWindow } = require('electron');

class MainWindow extends BrowserWindow {
    constructor(file, isDev) {
        super({
            title: 'SysTop',
            width: isDev ? 800 : 600,
            height: 700,
            icon: './assets/icons/icon.png',
            resizable: isDev,
            // show: false,
            opacity: 0.9,
            webPreferences: {
                nodeIntegration: true,
            },
        });

        this.loadURL(file);

        if (isDev) {
            this.webContents.openDevTools();
        }
    }
}

module.exports = MainWindow;
