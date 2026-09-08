import React from 'react';

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/90 overflow-hidden shadow-2xs animate-pulse">
      {/* Image box placeholder */}
      <div className="w-full aspect-[3/4] bg-gradient-to-b from-gray-100 via-gray-50 to-gray-100 relative">
        <div className="absolute top-2 left-2 w-14 h-4 rounded-full bg-gray-200/80" />
      </div>
      {/* Details placeholder */}
      <div className="p-3.5 space-y-2.5">
        <div className="h-3 w-16 bg-gray-200 rounded-md" />
        <div className="h-4 w-full bg-gray-200 rounded-md" />
        <div className="flex items-center gap-2 pt-1">
          <div className="h-4 w-14 bg-gray-200 rounded-md" />
          <div className="h-3 w-10 bg-gray-100 rounded-md" />
        </div>
      </div>
    </div>
  );
}
