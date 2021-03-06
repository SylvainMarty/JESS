// dependencies
const electron = require('electron');
const {ipcMain} = require('electron');
const fs = require('fs');
const path = require('path');
const url = require('url');
const properties = require("./src/properties.json");

// Module to control application life.
var app = electron.app;
// Module to create native browser window.
var BrowserWindow = electron.BrowserWindow;
let jekyllPID = null;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
global.mainWindow = null;
global.os = {
    platform: process.platform, // 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
    arch: process.arch // 'arm', 'ia32', or 'x64'
};

function createWindow () {
    global.lang = app.getLocale();

    // Create the browser window.
    global.mainWindow = new BrowserWindow({width: 800, height: 600});
    var startFile = path.join(__dirname, 'index.html');

    if (!fs.existsSync(path.join(__dirname, properties.jekyll.binRootPath))) {
        console.log("Jekyll binaries not found, installation required.", path.join(__dirname, properties.jekyll.binRootPath));
        startFile = path.join(__dirname, 'install.html');
    }

    // and load the index.html of the app.
    global.mainWindow.loadURL(url.format({
        pathname: startFile,
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    global.mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    global.mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        global.mainWindow = null
    })
}


/**
 * @Events
 * App global events
 */

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    app.quit()
});

app.on('before-quit', function () {
    if(jekyllPID != null) {
        console.log(`Killing process with PID ${jekyllPID}`);
        process.kill(jekyllPID, 'SIGINT');
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (global.mainWindow === null) {
        createWindow()
    }
});


/**
 * @Events
 * App communications from rendered process
 */

ipcMain.on('child-process-pid', function(event, arg) {
    console.log(`Storing child process with PID ${arg}`);
    jekyllPID = arg;
});
