import Providers from '@/pages/Providers'
import Router from '@/pages/Router'
import { ErrorBoundary } from 'react-error-boundary'

export default function App() {
  return (
    <ErrorBoundary fallback={<p>⚠️Something went wrong</p>}>
      <Providers>
        <Router />
      </Providers>
    </ErrorBoundary>
  )
}
