import React from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <img src="/petanque-icon.svg" alt="Pétanque Manager" className={className} />
  );
}
