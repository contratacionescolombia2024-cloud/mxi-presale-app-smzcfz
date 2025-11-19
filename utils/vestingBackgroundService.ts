
import { supabase } from '@/app/integrations/supabase/client';

/**
 * Background Vesting Service
 * 
 * This service ensures vesting rewards continue to accumulate even when
 * the app is closed by periodically calling the server-side update function.
 */

let updateInterval: NodeJS.Timeout | null = null;

/**
 * Calls the edge function to update all vesting rewards
 */
export async function updateAllVestingRewards(): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    console.log('🔄 Calling edge function to update all vesting rewards...');
    
    const { data, error } = await supabase.functions.invoke('update-vesting-rewards', {
      method: 'POST',
    });

    if (error) {
      console.error('❌ Error calling vesting update edge function:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Vesting rewards updated via edge function:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Failed to call vesting update edge function:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Starts the background vesting update service
 * This will call the edge function every 5 minutes
 */
export function startVestingBackgroundService() {
  if (updateInterval) {
    console.log('⚠️ Vesting background service already running');
    return;
  }

  console.log('🚀 Starting vesting background service...');
  
  // Update immediately
  updateAllVestingRewards();
  
  // Then update every 5 minutes
  updateInterval = setInterval(() => {
    updateAllVestingRewards();
  }, 5 * 60 * 1000); // 5 minutes
}

/**
 * Stops the background vesting update service
 */
export function stopVestingBackgroundService() {
  if (updateInterval) {
    console.log('🛑 Stopping vesting background service...');
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

/**
 * Calculates vesting rewards for a specific user
 */
export async function calculateUserVestingRewards(userId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    console.log('🔄 Calculating vesting rewards for user:', userId);
    
    const { data, error } = await supabase.rpc('calculate_and_update_vesting_rewards', {
      p_user_id: userId,
    });

    if (error) {
      console.error('❌ Error calculating user vesting rewards:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ User vesting rewards calculated:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Failed to calculate user vesting rewards:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
