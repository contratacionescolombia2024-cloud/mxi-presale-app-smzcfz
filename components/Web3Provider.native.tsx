
import React from 'react';

// Native platforms don't support Web3Modal
// This is a stub that just renders children
export function Web3Provider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
