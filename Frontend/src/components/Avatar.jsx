import React from 'react';

const colors = [
  'bg-violet-600', 'bg-pink-600', 'bg-cyan-600',
  'bg-emerald-600', 'bg-amber-600', 'bg-red-600', 'bg-blue-600'
];

const getColor = (name) => {
  if (!name) return colors[0];
  let sum = 0;
  for (let c of name) sum += c.charCodeAt(0);
  return colors[sum % colors.length];
};

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-lg'
};

export default function Avatar({ user, size = 'md', className = '' }) {
  if (!user) return null;
  const initials = user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`${sizes[size]} rounded-full object-cove ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} ${getColor(user.name)} rounded-full flex items-center justify-center font-semibold text-white  ${className}`}
      title={user.name}
    >
      {initials}
    </div>
  );
}