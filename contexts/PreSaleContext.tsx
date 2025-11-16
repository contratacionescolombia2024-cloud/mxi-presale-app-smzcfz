
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PreSaleStage, Purchase, VestingData, ReferralStats } from '@/types';

interface PreSaleContextType {
  currentStage: PreSaleStage;
  userPurchases: Purchase[];
  vestingData: VestingData;
  referralStats: ReferralStats;
  purchaseMXI: (amount: number, paymentMethod: 'paypal' | 'binance') => Promise<void>;
  refreshData: () => void;
}

const PreSaleContext = createContext<PreSaleContextType | undefined>(undefined);

export function PreSaleProvider({ children }: { children: React.ReactNode }) {
  const [currentStage, setCurrentStage] = useState<PreSaleStage>({
    stage: 1,
    price: 0.4,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    totalMXI: 8333333,
    soldMXI: 2500000,
  });

  const [userPurchases, setUserPurchases] = useState<Purchase[]>([
    {
      id: '1',
      userId: '1',
      amount: 100,
      mxiAmount: 250,
      paymentMethod: 'paypal',
      status: 'completed',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      stage: 1,
    },
  ]);

  const [vestingData, setVestingData] = useState<VestingData>({
    userId: '1',
    totalMXI: 250,
    currentRewards: 3.75,
    monthlyRate: 0.03,
    lastUpdate: new Date().toISOString(),
    projections: {
      days7: 1.75,
      days15: 3.75,
      days30: 7.5,
    },
  });

  const [referralStats, setReferralStats] = useState<ReferralStats>({
    level1Count: 3,
    level2Count: 5,
    level3Count: 8,
    totalMXIEarned: 45.5,
    level1MXI: 25,
    level2MXI: 12.5,
    level3MXI: 8,
  });

  // Simulate real-time vesting updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVestingData(prev => {
        const secondsPerMonth = 30 * 24 * 60 * 60;
        const rewardPerSecond = (prev.totalMXI * prev.monthlyRate) / secondsPerMonth;
        return {
          ...prev,
          currentRewards: prev.currentRewards + rewardPerSecond,
          lastUpdate: new Date().toISOString(),
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const purchaseMXI = async (amount: number, paymentMethod: 'paypal' | 'binance') => {
    console.log('Purchase MXI:', amount, paymentMethod);
    
    if (amount < 10 || amount > 50000) {
      throw new Error('Amount must be between 10 and 50000 USDT');
    }

    const mxiAmount = amount / currentStage.price;
    
    const newPurchase: Purchase = {
      id: Math.random().toString(36).substr(2, 9),
      userId: '1',
      amount,
      mxiAmount,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
      stage: currentStage.stage,
    };

    setUserPurchases(prev => [...prev, newPurchase]);
    
    // Simulate payment processing
    setTimeout(() => {
      setUserPurchases(prev => 
        prev.map(p => p.id === newPurchase.id ? { ...p, status: 'completed' } : p)
      );
      setVestingData(prev => ({
        ...prev,
        totalMXI: prev.totalMXI + mxiAmount,
      }));
    }, 2000);
  };

  const refreshData = () => {
    console.log('Refreshing pre-sale data');
  };

  return (
    <PreSaleContext.Provider value={{ 
      currentStage, 
      userPurchases, 
      vestingData, 
      referralStats, 
      purchaseMXI,
      refreshData 
    }}>
      {children}
    </PreSaleContext.Provider>
  );
}

export function usePreSale() {
  const context = useContext(PreSaleContext);
  if (context === undefined) {
    throw new Error('usePreSale must be used within a PreSaleProvider');
  }
  return context;
}
