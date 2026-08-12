import { useCountUp } from '@/hooks/useCountUp'

export function AnimatedNumber({
  value,
  formatter,
}: {
  value: number
  formatter: (n: number) => string
}) {
  const animated = useCountUp(value)
  return <>{formatter(Math.round(animated))}</>
}
