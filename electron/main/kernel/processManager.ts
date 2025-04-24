import { exec } from 'child_process'
import { promisify } from 'util'
import Logger from 'electron-log/main'
const logger = Logger.scope('[main] kernel processManager')

const execAsync = promisify(exec)

interface ProcessInfo {
  pid: string
  isRunning: boolean
}

const PORT = 6190

export class ProcessManager {
  private static instance: ProcessManager | null = null

  private constructor() {}

  /**
   * Get ProcessManager singleton
   */
  public static getInstance(): ProcessManager {
    if (!ProcessManager.instance) {
      ProcessManager.instance = new ProcessManager()
    }
    return ProcessManager.instance
  }

  /**
   * Find process using specified port
   */
  async findProcessByPort(): Promise<ProcessInfo | null> {
    if (process.platform === 'darwin') {
      return this.findProcessOnMac()
    } else if (process.platform === 'win32') {
      return this.findProcessOnWindows()
    }
    return null
  }

  /**
   * Find process on macOS
   */
  private async findProcessOnMac(): Promise<ProcessInfo | null> {
    try {
      const { stdout } = await execAsync(`lsof -i :${PORT} -t`)
      const pid = stdout.trim()
      logger.log('findProcessOnMac', pid)

      if (!pid) {
        return null
      }

      return {
        pid,
        isRunning: true,
      }
    } catch (error) {
      logger.error('Failed to find Mac process:', error)
      return null
    }
  }

  /**
   * Find process on Windows
   */
  private async findProcessOnWindows(): Promise<ProcessInfo | null> {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${PORT} | findstr LISTENING`)

      if (!stdout) {
        return null
      }

      const pid = stdout.trim().split(/\s+/).pop()
      if (!pid) {
        return null
      }

      return {
        pid,
        isRunning: true,
      }
    } catch (error) {
      logger.error('Failed to find Windows process:', error)
      return null
    }
  }

  /**
   * Check if process is running
   */
  private async isProcessRunning(pid: string): Promise<boolean> {
    try {
      if (process.platform === 'darwin') {
        await execAsync(`ps -p ${pid}`)
      } else if (process.platform === 'win32') {
        await execAsync(`tasklist /FI "PID eq ${pid}"`)
      }
      return true
    } catch {
      return false
    }
  }

  /**
   * Terminate process
   */
  private async killProcess(pid: string, force = false): Promise<void> {
    try {
      if (process.platform === 'darwin') {
        await execAsync(`kill ${force ? '-9' : '-15'} ${pid}`)
      } else if (process.platform === 'win32') {
        await execAsync(`taskkill ${force ? '/F' : ''} /PID ${pid} /T`)
      }
      logger.info(`${force ? 'Force' : 'Normal'} terminated process ${pid}`)
    } catch (error) {
      logger.error(`Failed to terminate process ${pid}:`, error)
      throw error
    }
  }

  /**
   * Clean up process using specified port
   */
  async cleanup(): Promise<void> {
    try {
      logger.info(`Attempting to terminate process using port ${PORT}`)

      const processInfo = await this.findProcessByPort()
      if (!processInfo) {
        logger.info(`No process found using port ${PORT}`)
        return
      }

      logger.info(`Found process using port ${PORT}: ${processInfo.pid}`)

      // Try graceful exit first
      await this.killProcess(processInfo.pid, false)
      logger.info('Termination signal sent')

      // Wait for process to exit
      await new Promise((resolve) => setTimeout(resolve, 5000))

      // Check if process is still running
      const isRunning = await this.isProcessRunning(processInfo.pid)
      if (isRunning) {
        // Force terminate
        await this.killProcess(processInfo.pid, true)
        logger.info('Process forcefully terminated')
      } else {
        logger.info('Process terminated normally')
      }
    } catch (error) {
      logger.error('Error occurred while cleaning up process:', error)
      throw error
    }
  }
}

export const processManager = ProcessManager.getInstance()
