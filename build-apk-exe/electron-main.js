const { app, BrowserWindow } = require('electron');
const path = require('path');
app.whenReady().then(() => {
  const win = new BrowserWindow({ width: 1366, height: 840, backgroundColor: '#080a0e', autoHideMenuBar: true });
  win.loadFile(path.join(__dirname, '..', 'index.html'));
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
