import { spawn } from 'child_process'
import fs from 'fs/promises'
import { executablePath } from '../appPath'
import { isDev } from '../env'
import Logger from 'electron-log/main'
import { processManager } from './processManager'
const logger = Logger.scope('[main] kernel executor')

let childProcess: ReturnType<typeof spawn> | null = null

const disabled = isDev
// const disabled = false

export async function extractAndRunProgram() {
  try {
    if (childProcess) {
      logger.info('child process already exists, skip')
      return
    }
    logger.info('Preparing to start program')
    logger.info('Current environment:', isDev ? 'development' : 'production')
    const platform = process.platform
    logger.info(`current platform: ${platform}`)

    // const check = true
    if (!disabled) {
      logger.info('!!!Production environment, starting program')

      // Must clean up processes first, otherwise the port may be occupied
      await cleanupChildProcess()

      logger.info(`start program`)
      logger.info(`child process path: ${executablePath}`)

      // 3. Check file permissions
      const stats = await fs.stat(executablePath)
      logger.info(`File permissions: ${stats.mode}`)

      // 4. Use spawn to start process, add more environment variables
      childProcess = spawn(executablePath)

      logger.info(`Child process PID: ${childProcess.pid}`)

      // 5. Add more detailed error handling
      childProcess.stdout?.on('data', (data) => {
        logger.info(`Child process output => stdout: ${data.toString().trim()}`)
      })

      childProcess.stderr?.on('data', (data) => {
        logger.info(`Child process output => stderr: ${data.toString().trim()}`)
      })

      childProcess.on('error', (err) => {
        logger.info('Child process output => Failed to start child process:', {
          message: err.message,
          code: err.name,
          stack: err.stack,
        })
      })

      childProcess.on('close', (code, signal) => {
        logger.info(`child process output => child process exit, exit code ${code}, signal ${signal}`)
      })
    } else {
      logger.info('!!!Development environment, starting directly')
    }

    return childProcess
  } catch (err) {
    logger.error('Program execution error:', err)
    throw err
  }
}

async function cleanupProcessWithChildProcess() {
  // Use childProcess to exit normally
  childProcess?.kill('SIGTERM')
  setTimeout(() => {
    if (childProcess) {
      // If the process is still running, force terminate
      childProcess?.kill('SIGKILL')
      logger.info('force terminate child process')
    }
  }, 5000)
}

export async function cleanupChildProcess() {
  try {
    logger.info('Process cleanup started')
    if (childProcess) {
      logger.info('Using childProcess to exit normally')
      await cleanupProcessWithChildProcess()
    } else {
      logger.info('Using processManager for cleanup')
      await processManager.cleanup()
    }
  } catch (error) {
    Logger.error('Process cleanup failed:', error)
  } finally {
    Logger.info('Process cleanup completed')
    childProcess = null
  }
}
