import { localRequest } from '@/lib/request'

export function getHeartbeat() {
  return localRequest.get('base/status').json<{ status: 'OK' }>()
}

// get /note/synchronize-files
export function syncFiles() {
  return localRequest.get('note/synchronize-files').json<{ status: 'OK' }>()
}

export function getSyncFilesStatus() {
  return
  // return localRequest.get('base/sync-files-status').json<{ status: 'OK' }>()
}

// sync local mode
export function syncLocalMode(local_mode: boolean) {
  return localRequest
    .put('base/conversation/setting/local_mode', {
      json: {
        local_mode,
      },
    })
    .json<{ status: 'OK' }>()
}
