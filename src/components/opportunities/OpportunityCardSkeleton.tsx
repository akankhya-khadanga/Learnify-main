import { Skeleton } from '@/components/ui/skeleton';

export default function OpportunityCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4 bg-white/10" />
            <Skeleton className="h-3 w-1/3 bg-white/10" />
          </div>
          <Skeleton className="h-6 w-20 bg-white/10" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-4 w-24 bg-white/10" />
          <Skeleton className="h-4 w-28 bg-white/10" />
        </div>
        <Skeleton className="h-10 w-full bg-white/10" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-4 w-full bg-white/10" />
          <Skeleton className="h-4 w-full bg-white/10" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 bg-white/10" />
          <Skeleton className="h-8 w-12 bg-white/10" />
        </div>
      </div>
    </div>
  );
}
