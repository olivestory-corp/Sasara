import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { EnumRouterLink } from '@/constants/paths'
import LogoLottie from '@/components/lottie/Logo'

export default function NotFound() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <LogoLottie className="h-20 w-20" />
      <p className="text-2xl">Page Not Found.</p>
      <Link to={EnumRouterLink.ConversationNew}>
        <Button size="sm">Go Back</Button>
      </Link>
    </div>
  )
}
