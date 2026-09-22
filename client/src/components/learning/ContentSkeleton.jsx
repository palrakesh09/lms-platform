import Skeleton, { LoadingRegion } from '../common/Skeleton.jsx';

export default function ContentSkeleton() {
  return (
    <LoadingRegion label="Loading learning content…" className="space-y-4">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-7 w-24 rounded-full" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="mt-4 h-10 w-40" />
    </LoadingRegion>
  );
}