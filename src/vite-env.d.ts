/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
// window.icpRenderer

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import('electron').IpcRenderer
}
