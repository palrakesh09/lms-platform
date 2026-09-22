import Skeleton, { LoadingRegion } from '../common/Skeleton.jsx';

export default function SidebarSkeleton() {
  return (
    <LoadingRegion label="Loading course content…" className="flex-1 space-y-4 p-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-5 w-3/4" />
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="space-y-2 pt-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="ml-4 h-4 w-2/3" />
        </div>
      ))}
    </LoadingRegion>
  );
}