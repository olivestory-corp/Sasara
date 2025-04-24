import dotenv from 'dotenv'
import { notarize } from 'electron-notarize'
import path from 'node:path'

dotenv.config({
  path: [path.resolve(process.cwd(), '.env')],
})

const _default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  const appName = context.packager.appInfo.productFilename
  console.log('Notarizing your application...')

  const appPath = `${appOutDir}/${appName}.app`
  console.log('Notarization path', appPath)
  console.log('Notarization app ID', 'com.signerlabs.klee')
  console.log('Notarization team ID', process.env.APPLETEAMID)
  console.log('Notarization Apple ID', process.env.APPLEID)
  console.log('Notarization Apple ID password', process.env.APPLEIDPASS)

  return await notarize({
    tool: 'notarytool',
    teamId: process.env.APPLETEAMID,
    appBundleId: 'com.signerlabs.klee',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
  })
}
export { _default as default }
