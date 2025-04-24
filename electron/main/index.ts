import { registerAppFolder } from './appPath'
import { registerUpdater } from './updater'
import { registerIpcMain } from './ipc'
import { registerLifecycle } from './lifecycle'
import { registerLogger } from './logger'

const createElectron = async () => {
  // Initialize logging system
  registerLogger()
  // Initialize application directories
  registerAppFolder()
  // Initialize update module
  registerUpdater()
  // Initialize IPC module
  registerIpcMain()
  // Initialize lifecycle module
  registerLifecycle()
}

createElectron()
