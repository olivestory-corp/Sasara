import Lottie, { LottieComponentProps } from 'lottie-react'
import Loading from '@/assets/lottie/loading.json'

export default function LoadingLottie(props: Omit<LottieComponentProps, 'animationData'>) {
  return <Lottie animationData={Loading} {...props} />
}
