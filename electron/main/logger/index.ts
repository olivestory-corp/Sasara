import Logger from 'electron-log/main'
import { loggerFilePath } from '../appPath'

export function registerLogger() {
  Logger.info('======== registerLogger START ========')
  // Initialize logging system
  Logger.initialize()
  Logger.transports.file.resolvePathFn = () => {
    return loggerFilePath
  }
  // Enable all transport methods
  Logger.transports.file.level = 'info'
  Logger.transports.console.level = 'info'
  Logger.transports.ipc.level = 'info'
  Logger.transports.file.setAppName('com.signerlabs.klee')

  // Customize log format
  Logger.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'

  // Set log file size
  Logger.transports.file.maxSize = 10 * 1024 * 1024 // 10MB

  // Set synchronous log writing
  Logger.transports.file.sync = true

  // Test if logging works properly
  Logger.info('[main] Logger initialized, path is:', Logger.transports.file.getFile().path)

  // Replace console.log with current logger.info
  // console.log = Logger.info
  Logger.info('======== registerLogger END ========')
}
