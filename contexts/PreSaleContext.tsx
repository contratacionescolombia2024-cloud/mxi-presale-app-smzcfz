
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { PreSaleStage, Purchase, VestingData, ReferralStats } from '@/types';
import { supabase } from '@/app/integrations/supabase/client';

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

export function usePreSale() {
  const context = useContext(PreSaleContext);
  if (!context) {
    throw new Error('usePreSale must be used within a PreSaleProvider');
  }
  return context;
}

// Helper function to safely convert database numeric values to JavaScript numbers
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
  const { user, isAuthenticated } = useAuth();
  const [currentStage, setCurrentStage] = useState<PreSaleStage | null>(null);
  const [userPurchases, setUserPurchases] = useState<Purchase[]>([]);
  const [vestingData, setVestingData] = useState<VestingData | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 PreSaleContext - Loading data, auth state:', { isAuthenticated, userId: user?.id });
    loadCurrentStage();
    if (isAuthenticated && user) {
      loadUserPurchases();
      loadVestingData();
      loadReferralStats();
    } else {
      setUserPurchases([]);
      setVestingData(null);
      setReferralStats(null);
      setIsLoading(false);
    }
  }, [user, isAuthenticated]);

  // Real-time subscription for referrals
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    console.log('🔔 Setting up real-time subscription for referrals and vesting');

    // Subscribe to changes in the referrals table
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
          loadVestingData(); // Reload vesting data when referrals change
        }
      )
      .subscribe();

    // Subscribe to changes in vesting table
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

    // Subscribe to changes in users_profiles (for referral linking)
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
  }, [user?.id, isAuthenticated]);

  // Real-time vesting updates
  useEffect(() => {
    if (!isAuthenticated || !user || !vestingData?.totalMXI) {
      return;
    }

    console.log('⏱️ Starting real-time vesting updates for user:', user.id);

    const interval = setInterval(() => {
      setVestingData((prev) => {
        if (!prev) return null;

        const monthlyRate = prev.monthlyRate || 0.03;
        const secondlyRate = monthlyRate / (30 * 24 * 60 * 60);
        const increment = prev.totalMXI * secondlyRate;

        const newRewards = (prev.currentRewards || 0) + increment;

        return {
          ...prev,
          currentRewards: newRewards,
          lastUpdate: new Date().toISOString(),
          projections: {
            days7: prev.totalMXI * monthlyRate * (7 / 30),
            days15: prev.totalMXI * monthlyRate * (15 / 30),
            days30: prev.totalMXI * monthlyRate,
          },
        };
      });
    }, 1000);

    return () => {
      console.log('🛑 Stopping real-time vesting updates');
      clearInterval(interval);
    };
  }, [user, isAuthenticated, vestingData?.totalMXI]);

  const loadCurrentStage = async () => {
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
  };

  const loadUserPurchases = async () => {
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
  };

  const loadVestingData = async () => {
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
        
        setVestingData({
          id: data.id,
          userId: data.user_id,
          totalMXI: totalMXI,
          purchasedMXI: purchasedMXI,
          currentRewards: currentRewards,
          monthlyRate: monthlyRate,
          lastUpdate: data.last_update || new Date().toISOString(),
          projections: {
            days7: totalMXI * monthlyRate * (7 / 30),
            days15: totalMXI * monthlyRate * (15 / 30),
            days30: totalMXI * monthlyRate,
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
    } finally {
      setIsLoading(false);
    }
  };

  const loadReferralStats = async () => {
    if (!user?.id) {
      console.log('⚠️ No user ID, skipping referral stats load');
      return;
    }

    try {
      console.log('👥 Loading referral stats for user:', user.id);
      
      // Get all referrals where this user is the referrer
      const { data: allReferrals, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          *,
          referred:users_profiles!referrals_referred_id_fkey(id, email, name)
        `)
        .eq('referrer_id', user.id)
        .order('level', { ascending: true });

      if (referralsError) {
        console.error('❌ Error loading referrals:', referralsError);
        throw referralsError;
      }

      console.log('✅ Raw referrals data loaded:', JSON.stringify(allReferrals, null, 2));

      // Separate by level
      const level1Data = allReferrals?.filter(r => r.level === 1) || [];
      const level2Data = allReferrals?.filter(r => r.level === 2) || [];
      const level3Data = allReferrals?.filter(r => r.level === 3) || [];

      console.log('📊 Referrals by level:', {
        level1: level1Data.length,
        level2: level2Data.length,
        level3: level3Data.length,
      });

      // Calculate total MXI earned from commissions using commission_mxi field
      const level1MXI = level1Data.reduce((sum, r) => {
        const commission = safeNumeric(r.commission_mxi);
        console.log('💰 Level 1 - Referral ID:', r.id, 'Commission:', commission);
        return sum + commission;
      }, 0);
      
      const level2MXI = level2Data.reduce((sum, r) => {
        const commission = safeNumeric(r.commission_mxi);
        console.log('💰 Level 2 - Referral ID:', r.id, 'Commission:', commission);
        return sum + commission;
      }, 0);
      
      const level3MXI = level3Data.reduce((sum, r) => {
        const commission = safeNumeric(r.commission_mxi);
        console.log('💰 Level 3 - Referral ID:', r.id, 'Commission:', commission);
        return sum + commission;
      }, 0);
      
      const totalEarned = level1MXI + level2MXI + level3MXI;

      console.log('📊 Referral stats calculated:', {
        level1Count: level1Data.length,
        level2Count: level2Data.length,
        level3Count: level3Data.length,
        level1MXI,
        level2MXI,
        level3MXI,
        totalEarned,
      });

      const newStats = {
        totalReferrals: allReferrals?.length || 0,
        level1Count: level1Data.length,
        level2Count: level2Data.length,
        level3Count: level3Data.length,
        level1MXI: level1MXI,
        level2MXI: level2MXI,
        level3MXI: level3MXI,
        totalMXIEarned: totalEarned,
        referrals: allReferrals || [],
      };

      console.log('✅ Setting referral stats:', newStats);
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
      console.log('⚠️ Setting empty referral stats due to error');
      setReferralStats(emptyStats);
    }
  };

  const refreshData = async () => {
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
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseMXI = async (amount: number, paymentMethod: 'paypal' | 'binance') => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    if (!currentStage) {
      throw new Error('No active presale stage');
    }

    try {
      console.log('💳 Processing purchase:', { amount, paymentMethod, userId: user.id });

      const mxiAmount = amount / currentStage.price;

      // Create purchase record
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          stage_id: currentStage.stage,
          amount_usd: amount,
          mxi_amount: mxiAmount,
          payment_method: paymentMethod,
          status: 'completed',
        })
        .select()
        .single();

      if (purchaseError) {
        console.error('❌ Purchase error:', purchaseError);
        throw purchaseError;
      }

      console.log('✅ Purchase created:', purchase);

      // Update or create vesting record - now tracking purchased_mxi separately
      const { data: existingVesting } = await supabase
        .from('vesting')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVesting) {
        const newTotal = safeNumeric(existingVesting.total_mxi) + mxiAmount;
        const newPurchased = safeNumeric(existingVesting.purchased_mxi) + mxiAmount;
        const { error: vestingError } = await supabase
          .from('vesting')
          .update({
            total_mxi: newTotal,
            purchased_mxi: newPurchased,
            last_update: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (vestingError) {
          console.error('❌ Vesting update error:', vestingError);
          throw vestingError;
        }
      } else {
        const { error: vestingError } = await supabase
          .from('vesting')
          .insert({
            user_id: user.id,
            total_mxi: mxiAmount,
            purchased_mxi: mxiAmount,
            current_rewards: 0,
            monthly_rate: 0.03,
            last_update: new Date().toISOString(),
          });

        if (vestingError) {
          console.error('❌ Vesting creation error:', vestingError);
          throw vestingError;
        }
      }

      // Update presale stage sold amount
      const { error: stageError } = await supabase
        .from('presale_stages')
        .update({
          sold_mxi: currentStage.soldMXI + mxiAmount,
        })
        .eq('stage', currentStage.stage);

      if (stageError) {
        console.error('❌ Stage update error:', stageError);
        throw stageError;
      }

      console.log('✅ Purchase completed successfully');
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
      }}
    >
      {children}
    </PreSaleContext.Provider>
  );
}
