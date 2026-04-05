import React from 'react';

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-800/50 rounded-xl ${className}`}></div>
);

export const JobSkeleton = () => (
  <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
    <div className="flex justify-between items-start">
      <div className="space-y-3 flex-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-[60%]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-16 ml-auto" />
        <Skeleton className="h-3 w-12 ml-auto" />
      </div>
    </div>
    <Skeleton className="h-16 w-full" />
    <div className="flex gap-4 pt-4 border-t border-slate-800">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 h-[400px]" />
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 h-[300px]" />
  </div>
);

export default Skeleton;
