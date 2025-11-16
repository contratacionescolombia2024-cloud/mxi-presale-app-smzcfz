
export interface User {
  id: string;
  email: string;
  name: string;
  identification?: string;
  address?: string;
  createdAt?: string;
  emailVerified?: boolean;
  kycStatus: 'pending' | 'approved' | 'rejected';
  kycDocuments?: string[];
  referralCode?: string;
  referredBy?: string;
  isAdmin?: boolean;
}

export interface PreSaleStage {
  id?: string;
  stage: number;
  price: number;
  startDate: string;
  endDate: string;
  totalMXI: number;
  soldMXI: number;
  isActive?: boolean;
}

export interface Purchase {
  id: string;
  userId: string;
  amount: number;
  mxiAmount: number;
  paymentMethod: 'paypal' | 'binance';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  stage: number;
}

export interface VestingData {
  id?: string;
  userId: string;
  totalMXI: number;
  currentRewards: number;
  monthlyRate: number;
  lastUpdate: string;
  projections: {
    days7: number;
    days15: number;
    days30: number;
  };
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  level: number;
  mxiEarned: number;
  createdAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  level1Count: number;
  level2Count: number;
  level3Count: number;
  totalMXIEarned: number;
  referrals: any[];
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  message: string;
  response?: string;
  status: 'pending' | 'answered';
  createdAt: string;
}

export interface AdminMetrics {
  totalUsers: number;
  totalMXISold: number;
  totalRevenue: number;
  currentStage: number;
  pendingKYC: number;
  pendingMessages: number;
  stageBreakdown: {
    stage1: number;
    stage2: number;
    stage3: number;
  };
}
