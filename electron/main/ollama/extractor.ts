import fs from 'fs'
import path from 'path'
import { IKernelUpdaterStatus } from 'electron/types'
import Logger from 'electron-log/main'
import { exec } from 'child_process'
import { promisify } from 'util'
import { chmod } from 'fs/promises'

const logger = Logger.scope('[main] ollama extractor')

const execAsync = promisify(exec)

export class Extractor {
  async cleanDestination(destPath: string): Promise<void> {
    if (fs.existsSync(destPath)) {
      await fs.promises.rm(destPath, { recursive: true, force: true })
    }
  }

  private async setExecutablePermission(filePath: string): Promise<void> {
    try {
      // No need to set executable permissions on Windows
      if (process.platform === 'win32') return

      const filename = path.basename(filePath)
      const dirPath = path.dirname(filePath)

      if (
        filename === 'main' ||
        dirPath.includes('_internal') ||
        filename.endsWith('.dylib') ||
        filename.endsWith('.so') ||
        filename.endsWith('.node') ||
        !path.extname(filename)
      ) {
        await chmod(filePath, 0o755)
        logger.info(`Set executable permission: ${filePath}`)
      }
    } catch (error) {
      logger.warn(`Failed to set file permissions: ${filePath}`, error)
    }
  }

  async extract(
    zipPath: string,
    destPath: string,
    onProgress?: (status: IKernelUpdaterStatus) => void,
  ): Promise<boolean> {
    try {
      // logger.info(`Start extracting file: ${zipPath} -> ${destPath}`)

      // Ensure target directory exists
      fs.mkdirSync(destPath, { recursive: true })

      if (process.platform === 'darwin') {
        // Check file extension
        const ext = path.extname(zipPath).toLowerCase()
        if (ext === '.tgz' || ext === '.gz') {
          // Use tar command for .tgz or .tar.gz files
          await execAsync(`tar -xzf "${zipPath}" -C "${destPath}"`)
          logger.info('tar command executed')
        } else {
          // Use ditto command for .zip files
          await execAsync(`ditto -x -k "${zipPath}" "${destPath}"`)
          logger.info('ditto command executed')
        }
      } else if (process.platform === 'win32') {
        // Windows: Use Expand-Archive
        const command = `powershell.exe -Command "Expand-Archive -Path '${zipPath.replace(
          /'/g,
          "''",
        )}' -DestinationPath '${destPath.replace(/'/g, "''")}' -Force"`
        await execAsync(command)
        logger.info('Expand-Archive command executed')
      } else {
        throw new Error('Unsupported operating system platform')
      }

      // Iterate over permissions (macOS)
      if (process.platform === 'darwin') {
        const setPermissions = async (dir: string) => {
          const entries = await fs.promises.readdir(dir, { withFileTypes: true })

          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)

            if (entry.isDirectory()) {
              await setPermissions(fullPath)
            } else {
              await this.setExecutablePermission(fullPath)
            }
          }
        }
        await setPermissions(destPath)
      }

      // Complete extraction
      onProgress?.({
        status: 'extracting',
        extractionProgress: {
          percent: 100,
          extractedFiles: 1,
          totalFiles: 1,
          currentFile: '',
        },
      })

      logger.info('Extraction completed')
      return true
    } catch (error) {
      logger.error('Extraction error:', error)
      throw error
    }
  }
}
