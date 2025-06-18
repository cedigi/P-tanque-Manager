import React from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <img src="/logo.png" alt="Pétanque Manager" className={className} />
  );
}
