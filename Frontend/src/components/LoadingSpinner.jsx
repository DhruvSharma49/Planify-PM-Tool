import React from 'react';

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

export default function LoadingSpinner({ size = 'md', className = '' }) {
  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className="w-full h-full border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );
}