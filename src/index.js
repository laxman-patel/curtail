const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const imagemin = require("imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
const imageminSvgo = require("imagemin-svgo");
const imageminGifsicle = require("imagemin-gifsicle");
const fs = require("fs");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

let mainWindow;
let menuWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    show: false,
    resizable: false,
    maximizable: false,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => (mainWindow = null));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const getFileSize = filename => {
  const stats = fs.statSync(filename);
  const fileSizeInBytes = stats["size"];
  return fileSizeInBytes / 1000000.0;
};

exports.compressImage = async filesArr => {
  // const buffer = fs.readFileSync(filePath);

  try {
    let sizeSaved = 0;

    const destination = path.join(app.getPath("pictures"), "curtail");

    for (let i = 0; i < filesArr.length; i++) {
      const file = filesArr[i];
      const filename = path.basename(file.path);

      console.log(filename);

      const files = await imagemin([file.path], {
        destination,
        plugins: [
          imageminMozjpeg({
            quality: 80,
          }),
          imageminPngquant({
            quality: [0.6, 0.8],
          }),
          imageminGifsicle(),
          imageminSvgo({
            plugins: [{ removeViewBox: false }],
          }),
        ],
      });

      const sizeDiff =
        getFileSize(files[0].sourcePath) -
        getFileSize(files[0].destinationPath);

      sizeSaved += sizeDiff;
    }

    mainWindow.webContents.send("compressed", sizeSaved.toFixed(1));
  } catch (error) {
    console.log("error while compressing images", error);
  }
};
