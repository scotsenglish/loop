import { Skeleton } from '@/components/Skeleton'

/** Shown while the first Firestore sync is still loading, shaped roughly
 *  like the real Home screen so the swap-in doesn't feel like a jump cut. */
export function HomeSkeleton() {
  return (
    <div className="animate-fade-in px-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-2 h-6 w-28" />
        </div>
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>

      <Skeleton className="mt-3 h-16 rounded-2xl" />
      <Skeleton className="mt-4 h-24 rounded-2xl" />
      <Skeleton className="mt-4 h-56 rounded-2xl" />
      <Skeleton className="mt-4 h-40 rounded-2xl" />
      <Skeleton className="mt-4 h-48 rounded-2xl" />
    </div>
  )
}
