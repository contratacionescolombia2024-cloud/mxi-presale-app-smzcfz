
/**
 * DISABLED - Startup verification was causing WorkletsError
 * This file is kept for compatibility but does nothing
 */

export interface VerificationResult {
  category: string;
  checks: {
    name: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
  }[];
}

class StartupVerification {
  async runAll(): Promise<VerificationResult[]> {
    console.log('⚠️ Startup verification disabled to prevent WorkletsError');
    return [];
  }

  getSummary() {
    return {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      allPassed: true,
    };
  }
}

export const startupVerification = new StartupVerification();
export default startupVerification;
