export const mode = process.env.NODE_ENV
export const isDev = mode === 'development'

export const channel: 'development' | 'beta' | 'alpha' | 'stable' | 'latest' = isDev ? 'latest' : 'latest'

const { platform } = process
export const isMacOS = platform === 'darwin'

export const isWindows = platform === 'win32'

export const isLinux = platform === 'linux'
