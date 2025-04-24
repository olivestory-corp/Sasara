import { IErrorDetail, IBaseResponse, EnumErrorCode } from '@/types'
import ky, { Options } from 'ky'
import { toast } from 'sonner'
import supabaseClient from '@/lib/supabase'
import { getDefaultStore } from 'jotai'
import { disconnectAtom } from '@/hooks/use-config'

const store = getDefaultStore()

type ICloudRequestEnvironment = 'production' | 'development'

async function getToken() {
  // const token = store.get(tokenAtom)
  // if (token) return token
  if (!supabaseClient) return undefined
  const { data, error } = await supabaseClient.auth.getSession()
  if (error) {
    toast.error(error.message)
  }
  if (data && data.session) {
    const token = data.session.access_token
    // store.set(tokenAtom, token)
    return token
  }
}

const requestOptions: Options = {
  // headers: {
  //   'Content-Type': 'application/json',
  // },
  // Do not automatically retry on request error, default is to retry 2 times
  retry: 0,
  timeout: 300_000,
  hooks: {
    beforeRequest: [
      async (request) => {
        const token: string | undefined = await new Promise((resolve) => {
          let timer: ReturnType<typeof setTimeout>

          getToken()
            .then((token) => {
              store.set(disconnectAtom, false)
              clearTimeout(timer)
              resolve(token)
            })
            .catch(() => {
              if (!store.get(disconnectAtom)) {
                store.set(disconnectAtom, true)
                console.log('Network error switching to offline mode')
              }
              resolve(undefined)
            })

          // After 3 seconds without response, consider it offline
          if (store.get(disconnectAtom)) {
            resolve(undefined)
          } else {
            timer = setTimeout(() => {
              if (!store.get(disconnectAtom)) {
                store.set(disconnectAtom, true)
                console.log('Network error switching to offline mode')
              }
              resolve(undefined)
            }, 3_000)
          }
        })
        if (token) {
          request.headers.set('Authorization', token)
        }
        request.headers.set(
          'Environment',
          (import.meta.env.DEV ? 'development' : 'production') as ICloudRequestEnvironment,
        )
        return request
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        const contentType = response.headers.get('content-type')?.split(';')[0]
        if (contentType !== 'application/json') return response

        if (!response.ok) {
          const errorBody: IErrorDetail = await response.json()
          const message =
            typeof errorBody.detail === 'string'
              ? errorBody.detail
              : typeof errorBody.message === 'string'
              ? errorBody.message
              : 'request failed.'

          // toast.error(message)
          throw new Error(message)
        }

        const data: IBaseResponse<unknown> = await response.json()
        if ('error_code' in data) {
          if (typeof data.error_code === 'string' && data.error_code !== '') {
            const message = EnumErrorCode[data.error_code] || data.message || 'operation failed.'
            toast.error(message)
            throw new Error(message)
          }
          if (typeof data.error_code === 'number' && data.error_code !== 0) {
            const message = EnumErrorCode[data.error_code] || data.message || 'operation failed.'
            toast.error(message)
            throw new Error(message)
          }
          return new Response(JSON.stringify(data.data), {
            status: response.status,
            statusText: response.statusText,
          })
        }

        return new Response(JSON.stringify(data), {
          status: response.status,
          statusText: response.statusText,
        })
      },
    ],
    // beforeError: [
    //   (error) => {
    //     const { response } = error
    //     if (response && response.status >= 400) {
    //       console.error(`API error: ${response.status} ${response.statusText}`)
    //     }
    //     return error
    //   },
    // ],
  },
}

export const localRequest = ky.create({
  ...requestOptions,
  prefixUrl: import.meta.env.VITE_REQUEST_PREFIX_URL || 'http://localhost:6190',
})
