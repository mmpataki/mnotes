const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 900, height: 600 })

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
var home;
const { ipcMain } = require('electron')
ipcMain.on('asynchronous-message', (event, arg) => {
  if (arg[0] == "home") {
    home = app.getPath('home')
    event.sender.send('asynchronous-reply', home)
  }
  else if (arg[0] == "print-to-pdf") {
    console.log(arg[1])
    const pdfPath = path.join(home, 'print.pdf')
    const fs = require('fs')
    hiddenWindow = new BrowserWindow({ width: 0, height: 0, show: false })

    // and load the index.html of the app.
    hiddenWindow.loadURL(url.format({
      pathname: path.join(arg[1]),
      protocol: 'file:',
      slashes: true
    }))

    hiddenWindow.webContents.on('did-finish-load', () => {
      hiddenWindow.webContents.printToPDF(
        { pageSize: "A4", marginsType: 1, printBackground: true, printSelectionOnly: false, landscape: false },
        function (error, data) {
          if (error) throw error
          fs.writeFile(pdfPath, data, function (error) {
            if (error) {
              throw error
            }
            event.sender.send('wrote-pdf', pdfPath)
            console.log("Done");
            hiddenWindow.close();
          })
        })
    })
  }
})

ipcMain.on('synchronous-message', (event, arg) => {
  event.returnValue = app.getPath('home')
})
