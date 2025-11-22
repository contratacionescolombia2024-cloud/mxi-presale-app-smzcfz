
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// CRITICAL: Simple context with only primitive callback
type WidgetContextType = {
  refreshTrigger: number;
  refreshWidget: () => void;
};

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function useWidget() {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidget must be used within a WidgetProvider');
  }
  return context;
}

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // CRITICAL: Stable callback that only updates a number
  const refreshWidget = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // CRITICAL: Memoize the context value with only primitives
  const value = useMemo<WidgetContextType>(() => ({
    refreshTrigger,
    refreshWidget,
  }), [refreshTrigger, refreshWidget]);

  return (
    <WidgetContext.Provider value={value}>
      {children}
    </WidgetContext.Provider>
  );
}
