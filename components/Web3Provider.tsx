
import React from 'react';

// Native version - no Web3Modal support
export function Web3Provider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
