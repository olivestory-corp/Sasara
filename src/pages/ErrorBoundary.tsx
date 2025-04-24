import AppSidebar from '@/pages/sidebar/AppSidebar'
import MainContent from '@/components/main-content'
import { useRouteError, isRouteErrorResponse } from 'react-router-dom'

function ErrorMessage() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <i>This page doesn&apos;t exist!</i>
    }

    if (error.status === 401) {
      return <i>You aren&apos;t authorized to see this</i>
    }

    if (error.status === 503) {
      return <i>Looks like our API is down</i>
    }

    if (error.status === 418) {
      return <i>🫖</i>
    }
  }

  return <i>Something went wrong</i>
}

export default function ErrorBoundary() {
  return (
    <main className="flex h-full w-full overflow-hidden">
      <AppSidebar />
      <MainContent>
        <div id="error-page">
          <h1>Oops!</h1>
          <p>Sorry, an unexpected error has occurred.</p>
          <p>
            <ErrorMessage />
          </p>
        </div>
      </MainContent>
    </main>
  )
}
