import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const PostCardSkeleton = () => {
  return (
    <div className='px-7 py-5 overflow-hidden grid grid-cols-[1fr_auto] rounded-xl bg-zinc-950 hover:bg-zinc-900'>
      <Skeleton className="w-full h-12" />
      <div className='w-full'>
        <Skeleton className="h-6 mb-2" />
        <Skeleton className="h-5 mb-2" />
        <Skeleton className="h-5 mb-2" />
        <Skeleton className="h-5" />
      </div>
      <Skeleton className="h-12 w-24 ml-auto" />
    </div>
  );
};

export default PostCardSkeleton;
