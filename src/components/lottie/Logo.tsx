import { cn } from '@/lib/utils'

type LogoProps = React.ImgHTMLAttributes<HTMLImageElement>

export default function Logo({ className, ...props }: LogoProps) {
  return <img src="./log_bg.png" alt="Klee Logo" className={cn('h-20 w-20', className)} {...props} />
}
