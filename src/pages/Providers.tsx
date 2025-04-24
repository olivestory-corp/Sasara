import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// import { ThemeProvider } from 'next-themes'
import { ThemeSwitcher } from '@/pages/setting/theme-switcher'
import SupabaseProvider from '@/pages/SupabaseProvider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { I18nextProvider } from 'react-i18next'
import i18next from '@/i18n'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'always',
      refetchOnWindowFocus: false,
      retry: false,
      throwOnError: false,
      staleTime: Infinity,
    },
    mutations: {
      networkMode: 'always',
    },
    // mutations: {
    //   onError(error, variables, context) {
    //     console.log('mutation error', error)
    //     // toast.error(error.message)
    //   },
    // },
  },
})

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18next}>
      <SupabaseProvider>
        {/* <ThemeProvider attribute="class"> */}
        <QueryClientProvider client={queryClient}>
          <SidebarProvider
            className="h-full"
            style={
              {
                '--sidebar-width': '320px',
              } as React.CSSProperties
            }
          >
            {children}
          </SidebarProvider>
          {/* <ReactQueryDevtools /> */}
        </QueryClientProvider>
        <ThemeSwitcher />
        {/* </ThemeProvider> */}
      </SupabaseProvider>
    </I18nextProvider>
  )
}
