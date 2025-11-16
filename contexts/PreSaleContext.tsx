
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PreSaleStage, Purchase, VestingData, ReferralStats } from '@/types';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface PreSaleContextType {
  currentStage: PreSaleStage | null;
  userPurchases: Purchase[];
  vestingData: VestingData | null;
  referralStats: ReferralStats | null;
  isLoading: boolean;
  purchaseMXI: (amount: number, paymentMethod: 'paypal' | 'binance') => Promise<void>;
  refreshData: () => Promise<void>;
}

const PreSaleContext = createContext<PreSaleContextType | undefined>(undefined);

export function PreSaleProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [currentStage, setCurrentStage] = useState<PreSaleStage | null>(null);
  const [userPurchases, setUserPurchases] = useState<Purchase[]>([]);
  const [vestingData, setVestingData] = useState<VestingData | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load current presale stage (public data, no auth required)
  const loadCurrentStage = async () => {
    try {
      console.log('📊 Loading current presale stage...');
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('presale_stages')
        .select('*')
        .lte('start_date', now)
        .gte('end_date', now)
        .single();

      if (error) {
        console.log('⚠️ No active stage found, loading first stage...', error.message);
        // If no active stage, get the first stage
        const { data: firstStage, error: firstStageError } = await supabase
          .from('presale_stages')
          .select('*')
          .order('stage', { ascending: true })
          .limit(1)
          .single();
        
        if (firstStageError) {
          console.error('❌ Error loading first stage:', firstStageError);
          return;
        }

        if (firstStage) {
          console.log('✅ Loaded first stage:', firstStage.stage);
          setCurrentStage({
            stage: firstStage.stage,
            price: Number(firstStage.price),
            startDate: firstStage.start_date,
            endDate: firstStage.end_date,
            totalMXI: Number(firstStage.total_mxi),
            soldMXI: Number(firstStage.sold_mxi || 0),
          });
        }
        return;
      }

      if (data) {
        console.log('✅ Loaded active stage:', data.stage);
        setCurrentStage({
          stage: data.stage,
          price: Number(data.price),
          startDate: data.start_date,
          endDate: data.end_date,
          totalMXI: Number(data.total_mxi),
          soldMXI: Number(data.sold_mxi || 0),
        });
      }
    } catch (error) {
      console.error('❌ Error in loadCurrentStage:', error);
    }
  };

  // Load user purchases (requires authentication)
  const loadUserPurchases = async () => {
    if (!user || !isAuthenticated) {
      console.log('ℹ️ Skipping purchases load - user not authenticated');
      setUserPurchases([]);
      return;
    }

    try {
      console.log('📦 Loading user purchases...');
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading purchases:', error);
        setUserPurchases([]);
        return;
      }

      if (data) {
        console.log('✅ Loaded', data.length, 'purchases');
        setUserPurchases(data.map(p => ({
          id: p.id,
          userId: p.user_id,
          amount: Number(p.amount),
          mxiAmount: Number(p.mxi_amount),
          paymentMethod: p.payment_method as 'paypal' | 'binance',
          status: p.status as 'pending' | 'completed' | 'failed',
          createdAt: p.created_at || '',
          stage: p.stage,
        })));
      }
    } catch (error) {
      console.error('❌ Error in loadUserPurchases:', error);
      setUserPurchases([]);
    }
  };

  // Load vesting data (requires authentication)
  const loadVestingData = async () => {
    if (!user || !isAuthenticated) {
      console.log('ℹ️ Skipping vesting load - user not authenticated');
      setVestingData(null);
      return;
    }

    try {
      console.log('💰 Loading vesting data...');
      // Get current vesting data
      const { data, error } = await supabase
        .from('vesting')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error loading vesting:', error);
        setVestingData(null);
        return;
      }

      if (data) {
        console.log('✅ Loaded vesting data');
        const totalMXI = Number(data.total_mxi || 0);
        const monthlyRate = Number(data.monthly_rate || 0.03);
        
        // Calculate current rewards using the database function
        const { data: currentRewards, error: rewardsError } = await supabase
          .rpc('calculate_vesting_rewards', { p_user_id: user.id });

        if (rewardsError) {
          console.error('❌ Error calculating rewards:', rewardsError);
        }

        const rewards = Number(currentRewards || data.current_rewards || 0);

        setVestingData({
          userId: user.id,
          totalMXI,
          currentRewards: rewards,
          monthlyRate,
          lastUpdate: data.last_update || new Date().toISOString(),
          projections: {
            days7: (totalMXI * monthlyRate * 7) / 30,
            days15: (totalMXI * monthlyRate * 15) / 30,
            days30: totalMXI * monthlyRate,
          },
        });
      } else {
        console.log('ℹ️ No vesting data yet, creating default');
        // No vesting data yet
        setVestingData({
          userId: user.id,
          totalMXI: 0,
          currentRewards: 0,
          monthlyRate: 0.03,
          lastUpdate: new Date().toISOString(),
          projections: {
            days7: 0,
            days15: 0,
            days30: 0,
          },
        });
      }
    } catch (error) {
      console.error('❌ Error in loadVestingData:', error);
      setVestingData(null);
    }
  };

  // Load referral stats (requires authentication)
  const loadReferralStats = async () => {
    if (!user || !isAuthenticated) {
      console.log('ℹ️ Skipping referrals load - user not authenticated');
      setReferralStats(null);
      return;
    }

    try {
      console.log('👥 Loading referral stats...');
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id);

      if (error) {
        console.error('❌ Error loading referrals:', error);
        setReferralStats(null);
        return;
      }

      if (data) {
        console.log('✅ Loaded', data.length, 'referrals');
        const level1 = data.filter(r => r.level === 1);
        const level2 = data.filter(r => r.level === 2);
        const level3 = data.filter(r => r.level === 3);

        const level1MXI = level1.reduce((sum, r) => sum + Number(r.mxi_earned || 0), 0);
        const level2MXI = level2.reduce((sum, r) => sum + Number(r.mxi_earned || 0), 0);
        const level3MXI = level3.reduce((sum, r) => sum + Number(r.mxi_earned || 0), 0);

        setReferralStats({
          level1Count: level1.length,
          level2Count: level2.length,
          level3Count: level3.length,
          totalMXIEarned: level1MXI + level2MXI + level3MXI,
          level1MXI,
          level2MXI,
          level3MXI,
        });
      } else {
        console.log('ℹ️ No referrals yet, creating default');
        setReferralStats({
          level1Count: 0,
          level2Count: 0,
          level3Count: 0,
          totalMXIEarned: 0,
          level1MXI: 0,
          level2MXI: 0,
          level3MXI: 0,
        });
      }
    } catch (error) {
      console.error('❌ Error in loadReferralStats:', error);
      setReferralStats(null);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    console.log('🔄 Refreshing all data...');
    setIsLoading(true);
    
    // Always load current stage (public data)
    await loadCurrentStage();
    
    // Only load user-specific data if authenticated
    if (isAuthenticated && user) {
      await Promise.all([
        loadUserPurchases(),
        loadVestingData(),
        loadReferralStats(),
      ]);
    } else {
      console.log('ℹ️ User not authenticated, skipping user-specific data');
      setUserPurchases([]);
      setVestingData(null);
      setReferralStats(null);
    }
    
    setIsLoading(false);
    console.log('✅ Data refresh complete');
  };

  // Initial load - always load stage, conditionally load user data
  useEffect(() => {
    console.log('🚀 PreSaleContext: Initial load, isAuthenticated:', isAuthenticated, 'user:', user?.id);
    refreshData();
  }, [user, isAuthenticated]);

  // Real-time vesting updates (only when authenticated)
  useEffect(() => {
    if (!user || !isAuthenticated || !vestingData) {
      console.log('ℹ️ Skipping vesting updates - not ready');
      return;
    }

    console.log('⏱️ Starting real-time vesting updates');
    const interval = setInterval(async () => {
      // Update vesting rewards in real-time
      const { data: currentRewards, error } = await supabase
        .rpc('calculate_vesting_rewards', { p_user_id: user.id });

      if (error) {
        console.error('❌ Error updating vesting rewards:', error);
        return;
      }

      if (currentRewards !== null) {
        setVestingData(prev => prev ? {
          ...prev,
          currentRewards: Number(currentRewards),
          lastUpdate: new Date().toISOString(),
        } : null);
      }
    }, 1000); // Update every second

    return () => {
      console.log('🛑 Stopping real-time vesting updates');
      clearInterval(interval);
    };
  }, [user, isAuthenticated, vestingData?.totalMXI]);

  // Subscribe to real-time changes (only when authenticated)
  useEffect(() => {
    if (!user || !isAuthenticated) {
      console.log('ℹ️ Skipping real-time subscriptions - user not authenticated');
      return;
    }

    console.log('📡 Setting up real-time subscriptions');

    // Subscribe to purchases
    const purchasesSubscription = supabase
      .channel('purchases_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchases',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          console.log('🔔 Purchases changed, reloading...');
          loadUserPurchases();
          loadVestingData();
        }
      )
      .subscribe();

    // Subscribe to vesting
    const vestingSubscription = supabase
      .channel('vesting_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vesting',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          console.log('🔔 Vesting changed, reloading...');
          loadVestingData();
        }
      )
      .subscribe();

    // Subscribe to referrals
    const referralsSubscription = supabase
      .channel('referrals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referrals',
          filter: `referrer_id=eq.${user.id}`,
        },
        () => {
          console.log('🔔 Referrals changed, reloading...');
          loadReferralStats();
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up real-time subscriptions');
      purchasesSubscription.unsubscribe();
      vestingSubscription.unsubscribe();
      referralsSubscription.unsubscribe();
    };
  }, [user, isAuthenticated]);

  const purchaseMXI = async (amount: number, paymentMethod: 'paypal' | 'binance') => {
    if (!user || !currentStage) {
      throw new Error('User not authenticated or no active stage');
    }

    try {
      console.log('💳 Purchase MXI:', amount, paymentMethod);
      
      if (amount < 10 || amount > 50000) {
        throw new Error('Amount must be between 10 and 50000 USDT');
      }

      const mxiAmount = amount / currentStage.price;
      
      // Create purchase record
      const { data, error } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          amount,
          mxi_amount: mxiAmount,
          payment_method: paymentMethod,
          status: 'pending',
          stage: currentStage.stage,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Purchase error:', error);
        throw new Error('Failed to create purchase');
      }

      console.log('✅ Purchase created:', data.id);

      // Simulate payment processing (in production, integrate with PayPal/Binance)
      setTimeout(async () => {
        const { error: updateError } = await supabase
          .from('purchases')
          .update({ status: 'completed' })
          .eq('id', data.id);

        if (updateError) {
          console.error('❌ Purchase update error:', updateError);
        } else {
          console.log('✅ Purchase completed:', data.id);
        }
      }, 2000);

    } catch (error: any) {
      console.error('❌ Purchase failed:', error);
      throw error;
    }
  };

  return (
    <PreSaleContext.Provider value={{ 
      currentStage, 
      userPurchases, 
      vestingData, 
      referralStats,
      isLoading,
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
