
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from './AuthContext';
import { PreSaleStage, Purchase, VestingData, ReferralStats } from '@/types';
import { supabase } from '@/app/integrations/supabase/client';

interface PreSaleContextType {
  currentStage: PreSaleStage | null;
  userPurchases: Purchase[];
  vestingData: VestingData | null;
  referralStats: ReferralStats | null;
  isLoading: boolean;
  purchaseMXI: (amount: number) => Promise<void>;
  refreshData: () => Promise<void>;
  forceReloadReferrals: () => Promise<void>;
}

const PreSaleContext = createContext<PreSaleContextType | undefined>(undefined);

export function usePreSale() {
  const context = useContext(PreSaleContext);
  if (!context) {
    throw new Error('usePreSale must be used within a PreSaleProvider');
  }
  return context;
}

function safeNumeric(value: any): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

export function PreSaleProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentStage, setCurrentStage] = useState<PreSaleStage | null>(null);
  const [userPurchases, setUserPurchases] = useState<Purchase[]>([]);
  const [vestingData, setVestingData] = useState<VestingData | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const loadCurrentStage = useCallback(async () => {
    try {
      console.log('📊 Loading current presale stage...');
      const { data, error } = await supabase
        .from('presale_stages')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('❌ Error loading current stage:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Current stage loaded:', data);
        setCurrentStage({
          id: data.id,
          stage: data.stage,
          price: safeNumeric(data.price),
          totalMXI: safeNumeric(data.total_mxi),
          soldMXI: safeNumeric(data.sold_mxi),
          startDate: data.start_date,
          endDate: data.end_date,
          isActive: data.is_active,
        });
      } else {
        console.log('⚠️ No active presale stage found');
        setCurrentStage(null);
      }
    } catch (error) {
      console.error('❌ Failed to load current stage:', error);
      setCurrentStage(null);
    }
  }, []);

  const loadUserPurchases = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ No user ID, skipping purchases load');
      return;
    }

    try {
      console.log('💰 Loading user purchases for:', user.id);
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading purchases:', error);
        throw error;
      }

      console.log('✅ Purchases loaded:', data?.length || 0);
      setUserPurchases(data || []);
    } catch (error) {
      console.error('❌ Failed to load purchases:', error);
      setUserPurchases([]);
    }
  }, [user?.id]);

  const loadVestingData = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ No user ID, skipping vesting data load');
      return;
    }

    try {
      console.log('📈 Loading vesting data for:', user.id);
      const { data, error } = await supabase
        .from('vesting')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error loading vesting data:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Vesting data loaded:', data);
        const monthlyRate = safeNumeric(data.monthly_rate) || 0.03;
        const totalMXI = safeNumeric(data.total_mxi);
        const purchasedMXI = safeNumeric(data.purchased_mxi);
        const currentRewards = safeNumeric(data.current_rewards);
        const tournamentsBalance = safeNumeric(data.tournaments_balance);
        const commissionBalance = safeNumeric(data.commission_balance);
        
        console.log('💰 Vesting breakdown:', {
          totalMXI,
          purchasedMXI,
          commissionMXI: totalMXI - purchasedMXI,
          currentRewards,
          tournamentsBalance,
          commissionBalance,
          note: 'Vesting rewards calculated ONLY on purchasedMXI'
        });
        
        setVestingData({
          id: data.id,
          userId: data.user_id,
          totalMXI: totalMXI,
          purchasedMXI: purchasedMXI,
          currentRewards: currentRewards,
          monthlyRate: monthlyRate,
          lastUpdate: data.last_update || new Date().toISOString(),
          tournamentsBalance: tournamentsBalance,
          commissionBalance: commissionBalance,
          projections: {
            days7: purchasedMXI * monthlyRate * (7 / 30),
            days15: purchasedMXI * monthlyRate * (15 / 30),
            days30: purchasedMXI * monthlyRate,
          },
        });
      } else {
        console.log('⚠️ No vesting data found, initializing with zeros');
        setVestingData({
          id: '',
          userId: user.id,
          totalMXI: 0,
          purchasedMXI: 0,
          currentRewards: 0,
          monthlyRate: 0.03,
          lastUpdate: new Date().toISOString(),
          tournamentsBalance: 0,
          commissionBalance: 0,
          projections: {
            days7: 0,
            days15: 0,
            days30: 0,
          },
        });
      }
    } catch (error) {
      console.error('❌ Failed to load vesting data:', error);
      setVestingData(null);
    }
  }, [user?.id]);

  const loadReferralStats = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ No user ID, skipping referral stats load');
      return;
    }

    try {
      console.log('👥 Loading referral stats for user:', user.id);
      
      const { data: rawReferrals, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id);

      if (referralsError) {
        console.error('❌ Error loading referrals:', referralsError);
        throw referralsError;
      }

      if (!rawReferrals || rawReferrals.length === 0) {
        console.log('⚠️ No referrals found');
        const emptyStats = {
          totalReferrals: 0,
          level1Count: 0,
          level2Count: 0,
          level3Count: 0,
          level1MXI: 0,
          level2MXI: 0,
          level3MXI: 0,
          totalMXIEarned: 0,
          referrals: [],
        };
        setReferralStats(emptyStats);
        return;
      }

      console.log('✅ Referrals found:', rawReferrals.length);

      let level1MXI = 0;
      let level2MXI = 0;
      let level3MXI = 0;
      let level1Count = 0;
      let level2Count = 0;
      let level3Count = 0;

      rawReferrals.forEach((referral) => {
        const level = referral.level;
        const commissionMXI = safeNumeric(referral.commission_mxi);

        if (level === 1) {
          level1Count++;
          level1MXI += commissionMXI;
        } else if (level === 2) {
          level2Count++;
          level2MXI += commissionMXI;
        } else if (level === 3) {
          level3Count++;
          level3MXI += commissionMXI;
        }
      });

      const totalEarned = level1MXI + level2MXI + level3MXI;

      const newStats = {
        totalReferrals: rawReferrals.length,
        level1Count: level1Count,
        level2Count: level2Count,
        level3Count: level3Count,
        level1MXI: level1MXI,
        level2MXI: level2MXI,
        level3MXI: level3MXI,
        totalMXIEarned: totalEarned,
        referrals: rawReferrals,
      };

      console.log('✅ Referral stats calculated:', newStats);
      setReferralStats(newStats);
    } catch (error) {
      console.error('❌ Failed to load referral stats:', error);
      const emptyStats = {
        totalReferrals: 0,
        level1Count: 0,
        level2Count: 0,
        level3Count: 0,
        level1MXI: 0,
        level2MXI: 0,
        level3MXI: 0,
        totalMXIEarned: 0,
        referrals: [],
      };
      setReferralStats(emptyStats);
    }
  }, [user?.id]);

  const forceReloadReferrals = useCallback(async () => {
    console.log('🔥 Force reload referrals triggered');
    await loadReferralStats();
    await loadVestingData();
  }, [loadReferralStats, loadVestingData]);

  const refreshData = useCallback(async () => {
    console.log('🔄 Refreshing all presale data...');
    setIsLoading(true);
    try {
      await loadCurrentStage();
      if (isAuthenticated && user) {
        await Promise.all([
          loadUserPurchases(),
          loadVestingData(),
          loadReferralStats(),
        ]);
      }
      console.log('✅ Data refresh complete');
      setDataLoaded(true);
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, loadCurrentStage, loadUserPurchases, loadVestingData, loadReferralStats]);

  useEffect(() => {
    if (authLoading) {
      console.log('⏳ Waiting for auth to complete...');
      return;
    }

    console.log('🔄 PreSaleContext - Loading data, auth state:', { isAuthenticated, userId: user?.id });
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        await loadCurrentStage();
        if (isAuthenticated && user) {
          await Promise.all([
            loadUserPurchases(),
            loadVestingData(),
            loadReferralStats(),
          ]);
        } else {
          setUserPurchases([]);
          setVestingData(null);
          setReferralStats(null);
        }
        setDataLoaded(true);
      } catch (error) {
        console.error('❌ Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id, isAuthenticated, authLoading, loadCurrentStage, loadUserPurchases, loadVestingData, loadReferralStats]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !dataLoaded) {
      return;
    }

    console.log('🔔 Setting up real-time subscriptions');

    const referralsSubscription = supabase
      .channel('referrals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referrals',
          filter: `referrer_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔔 Referral change detected:', payload);
          loadReferralStats();
          loadVestingData();
        }
      )
      .subscribe();

    const vestingSubscription = supabase
      .channel('vesting-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vesting',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔔 Vesting change detected:', payload);
          loadVestingData();
        }
      )
      .subscribe();

    const profilesSubscription = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users_profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔔 Profile change detected:', payload);
          loadReferralStats();
        }
      )
      .subscribe();

    return () => {
      console.log('🛑 Cleaning up real-time subscriptions');
      referralsSubscription.unsubscribe();
      vestingSubscription.unsubscribe();
      profilesSubscription.unsubscribe();
    };
  }, [user?.id, isAuthenticated, dataLoaded, loadReferralStats, loadVestingData]);

  const calculateServerVestingRewards = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('🔄 Calculating server-side vesting rewards for user:', user.id);
      
      const { data, error } = await supabase.rpc('calculate_and_update_vesting_rewards', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('❌ Error calculating vesting rewards:', error);
        return;
      }

      if (data && data.length > 0) {
        const result = data[0];
        console.log('✅ Server vesting calculation complete:', {
          oldRewards: result.old_rewards,
          newRewards: result.new_rewards,
          secondsElapsed: result.seconds_elapsed,
        });
        
        await loadVestingData();
      }
    } catch (error) {
      console.error('❌ Failed to calculate server vesting rewards:', error);
    }
  }, [user?.id, loadVestingData]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !dataLoaded) {
      return;
    }

    calculateServerVestingRewards();

    const interval = setInterval(() => {
      calculateServerVestingRewards();
    }, 30000);

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('📱 App came to foreground, calculating vesting rewards...');
        calculateServerVestingRewards();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [user?.id, isAuthenticated, dataLoaded, calculateServerVestingRewards]);

  useEffect(() => {
    if (!isAuthenticated || !user || !vestingData?.purchasedMXI || !dataLoaded) {
      return;
    }

    console.log('⏱️ Starting real-time vesting display updates for user:', user.id);

    const interval = setInterval(() => {
      setVestingData((prev) => {
        if (!prev) return null;

        const monthlyRate = prev.monthlyRate || 0.03;
        const secondlyRate = monthlyRate / (30 * 24 * 60 * 60);
        
        const increment = prev.purchasedMXI * secondlyRate;
        const newRewards = (prev.currentRewards || 0) + increment;

        return {
          ...prev,
          currentRewards: newRewards,
          lastUpdate: new Date().toISOString(),
          projections: {
            days7: prev.purchasedMXI * monthlyRate * (7 / 30),
            days15: prev.purchasedMXI * monthlyRate * (15 / 30),
            days30: prev.purchasedMXI * monthlyRate,
          },
        };
      });
    }, 1000);

    return () => {
      console.log('🛑 Stopping real-time vesting display updates');
      clearInterval(interval);
    };
  }, [user, isAuthenticated, vestingData?.purchasedMXI, dataLoaded]);

  const purchaseMXI = async (amount: number) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    if (!currentStage) {
      throw new Error('No active presale stage');
    }

    try {
      console.log('💳 Processing purchase:', { amount, userId: user.id });

      const mxiAmount = amount / currentStage.price;

      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          stage_id: currentStage.stage,
          amount_usd: amount,
          mxi_amount: mxiAmount,
          payment_method: 'manual',
          status: 'pending',
        })
        .select()
        .single();

      if (purchaseError) {
        console.error('❌ Purchase error:', purchaseError);
        throw purchaseError;
      }

      console.log('✅ Purchase request created:', purchase);
      await refreshData();
    } catch (error) {
      console.error('❌ Purchase failed:', error);
      throw error;
    }
  };

  return (
    <PreSaleContext.Provider
      value={{
        currentStage,
        userPurchases,
        vestingData,
        referralStats,
        isLoading,
        purchaseMXI,
        refreshData,
        forceReloadReferrals,
      }}
    >
      {children}
    </PreSaleContext.Provider>
  );
}
