import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rectangular' }) => {
  const baseClasses = "animate-pulse bg-gray-200";
  const variantClasses = {
    text: "h-4 rounded",
    rectangular: "rounded-xl",
    circular: "rounded-full"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}></div>
  );
};

export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm h-full flex flex-col">
    <Skeleton className="w-full aspect-[4/3] mb-4" />
    <Skeleton variant="text" className="w-3/4 mb-2" />
    <Skeleton variant="text" className="w-1/2 mb-4" />
    <div className="mt-auto flex justify-between items-center">
      <Skeleton variant="text" className="w-1/4 h-6" />
      <Skeleton className="w-20 h-10 rounded-xl" />
    </div>
  </div>
);