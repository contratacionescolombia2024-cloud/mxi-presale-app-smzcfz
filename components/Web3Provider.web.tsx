
import React from 'react';

// Web3 functionality has been removed
// This component now just passes through children
export function Web3Provider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
