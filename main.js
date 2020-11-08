const path = require('path');
const { app, Menu, ipcMain, Tray } = require('electron');
const Store = require('./Store');
const MainWindow = require('./MainWindow');
const AppTray = require('./AppTray');

// Set env
process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== 'production' ? true : false;
const isWin = process.platform === 'win32' ? true : false;

let mainWindow;
let tray;

// Init Store
const store = new Store({
    configName: 'user-settings',
    defaults: {
        settings: {
            cpuOverload: 70,
            alertFrequency: 5,
        },
    },
});

function createMainWindow() {
    mainWindow = new MainWindow(`file://${__dirname}/app/index.html`, isDev);
}

app.on('ready', () => {
    createMainWindow();

    mainWindow.webContents.on('dom-ready', () => {
        mainWindow.webContents.send('settings:get', store.get('settings'));
    });

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return true;
    });

    const icon = path.join(__dirname, 'assets', 'icons', 'tray_icon.png');

    // Create tray
    tray = new AppTray(icon, mainWindow);
});

const menu = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                accelerator: isWin ? 'Ctrl+W' : 'Command+W',
                // OR accelerator: 'CmdOrCtrl+W
                click: () => app.quit(),
            },
        ],
    },
    {
        label: 'View',
        submenu: [
            {
                label: 'Toggle Navigation',
                accelerator: 'CmdOrCtrl+T',
                click: () => mainWindow.webContents.send('nav:toggle'),
            },
        ],
    },
    ...(isDev
        ? [
              {
                  label: 'Developer',
                  submenu: [
                      { role: 'reload' },
                      { role: 'forcereload' },
                      { type: 'separator' },
                      { role: 'toggledevtools' },
                  ],
              },
          ]
        : []),
];

ipcMain.on('settings:set', (event, value) => {
    store.set('settings', value);
    mainWindow.webContents.send('settings:get', store.get('settings'));
});

/*app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});*/

app.allowRendererProcessReuse = true;
