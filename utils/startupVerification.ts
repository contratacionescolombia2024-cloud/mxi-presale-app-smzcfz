
/**
 * Startup Verification Utility
 * Checks that all critical systems are working correctly
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
  private results: VerificationResult[] = [];

  /**
   * Run all verification checks
   */
  async runAll(): Promise<VerificationResult[]> {
    console.log('🔍 Starting system verification...');
    console.log('================================');

    this.results = [];

    await this.verifyPolyfills();
    await this.verifyEnvironment();
    await this.verifyDependencies();
    await this.verifyConfiguration();

    this.printResults();

    return this.results;
  }

  /**
   * Verify polyfills are loaded
   */
  private async verifyPolyfills(): Promise<void> {
    const checks: VerificationResult['checks'] = [];

    // Check global object
    checks.push({
      name: 'Global Object',
      status: typeof global !== 'undefined' ? 'pass' : 'fail',
      message: typeof global !== 'undefined' ? 'Global object available' : 'Global object missing',
    });

    // Check Buffer
    checks.push({
      name: 'Buffer',
      status: typeof Buffer !== 'undefined' ? 'pass' : 'fail',
      message: typeof Buffer !== 'undefined' ? 'Buffer polyfill loaded' : 'Buffer polyfill missing',
    });

    // Check process
    checks.push({
      name: 'Process',
      status: typeof process !== 'undefined' ? 'pass' : 'fail',
      message: typeof process !== 'undefined' ? 'Process polyfill loaded' : 'Process polyfill missing',
    });

    // Check process.env
    checks.push({
      name: 'Process.env',
      status: typeof process?.env !== 'undefined' ? 'pass' : 'fail',
      message: typeof process?.env !== 'undefined' ? 'Process.env available' : 'Process.env missing',
    });

    // Check setImmediate
    checks.push({
      name: 'setImmediate',
      status: typeof setImmediate !== 'undefined' ? 'pass' : 'fail',
      message: typeof setImmediate !== 'undefined' ? 'setImmediate available' : 'setImmediate missing',
    });

    this.results.push({
      category: 'Polyfills',
      checks,
    });
  }

  /**
   * Verify environment configuration
   */
  private async verifyEnvironment(): Promise<void> {
    const checks: VerificationResult['checks'] = [];

    // Check platform
    const platform = this.getPlatform();
    checks.push({
      name: 'Platform',
      status: 'pass',
      message: `Running on ${platform}`,
    });

    // Check NODE_ENV
    const nodeEnv = process.env.NODE_ENV || 'development';
    checks.push({
      name: 'NODE_ENV',
      status: 'pass',
      message: `Environment: ${nodeEnv}`,
    });

    // Check if development mode
    const isDev = __DEV__;
    checks.push({
      name: 'Development Mode',
      status: 'pass',
      message: isDev ? 'Development mode enabled' : 'Production mode',
    });

    this.results.push({
      category: 'Environment',
      checks,
    });
  }

  /**
   * Verify critical dependencies
   */
  private async verifyDependencies(): Promise<void> {
    const checks: VerificationResult['checks'] = [];

    // Check React
    try {
      await import('react');
      checks.push({
        name: 'React',
        status: 'pass',
        message: 'React loaded successfully',
      });
    } catch {
      checks.push({
        name: 'React',
        status: 'fail',
        message: 'React failed to load',
      });
    }

    // Check React Native
    try {
      await import('react-native');
      checks.push({
        name: 'React Native',
        status: 'pass',
        message: 'React Native loaded successfully',
      });
    } catch {
      checks.push({
        name: 'React Native',
        status: 'fail',
        message: 'React Native failed to load',
      });
    }

    // Check Expo Router
    try {
      await import('expo-router');
      checks.push({
        name: 'Expo Router',
        status: 'pass',
        message: 'Expo Router loaded successfully',
      });
    } catch {
      checks.push({
        name: 'Expo Router',
        status: 'fail',
        message: 'Expo Router failed to load',
      });
    }

    // Check Reanimated
    try {
      await import('react-native-reanimated');
      checks.push({
        name: 'React Native Reanimated',
        status: 'pass',
        message: 'Reanimated loaded successfully',
      });
    } catch {
      checks.push({
        name: 'React Native Reanimated',
        status: 'fail',
        message: 'Reanimated failed to load',
      });
    }

    // Check Supabase
    try {
      await import('@supabase/supabase-js');
      checks.push({
        name: 'Supabase',
        status: 'pass',
        message: 'Supabase client loaded successfully',
      });
    } catch {
      checks.push({
        name: 'Supabase',
        status: 'fail',
        message: 'Supabase client failed to load',
      });
    }

    this.results.push({
      category: 'Dependencies',
      checks,
    });
  }

  /**
   * Verify app configuration
   */
  private async verifyConfiguration(): Promise<void> {
    const checks: VerificationResult['checks'] = [];

    // Check if running on web
    const isWeb = this.getPlatform() === 'web';

    // Check Web3 configuration (web only)
    if (isWeb) {
      try {
        const webConfig = await import('@/config/web3Config');
        const { WALLETCONNECT_PROJECT_ID } = webConfig;
        
        if (WALLETCONNECT_PROJECT_ID === 'YOUR_WALLETCONNECT_PROJECT_ID') {
          checks.push({
            name: 'WalletConnect Project ID',
            status: 'warning',
            message: 'WalletConnect Project ID not configured (using placeholder)',
          });
        } else {
          checks.push({
            name: 'WalletConnect Project ID',
            status: 'pass',
            message: 'WalletConnect Project ID configured',
          });
        }
      } catch {
        checks.push({
          name: 'Web3 Configuration',
          status: 'warning',
          message: 'Web3 configuration not available (expected on native)',
        });
      }
    } else {
      checks.push({
        name: 'Web3 Configuration',
        status: 'pass',
        message: 'Web3 not required on native platform',
      });
    }

    // Check Supabase configuration
    try {
      const supabaseModule = await import('@/app/integrations/supabase/client');
      const { supabase } = supabaseModule;
      
      if (supabase) {
        checks.push({
          name: 'Supabase Client',
          status: 'pass',
          message: 'Supabase client initialized',
        });
      } else {
        checks.push({
          name: 'Supabase Client',
          status: 'fail',
          message: 'Supabase client not initialized',
        });
      }
    } catch {
      checks.push({
        name: 'Supabase Client',
        status: 'fail',
        message: 'Failed to load Supabase client',
      });
    }

    this.results.push({
      category: 'Configuration',
      checks,
    });
  }

  /**
   * Get current platform
   */
  private getPlatform(): string {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      return 'web';
    }
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Platform } = require('react-native');
      return Platform.OS;
    } catch {
      return 'unknown';
    }
  }

  /**
   * Print verification results
   */
  private printResults(): void {
    console.log('');
    console.log('📊 Verification Results:');
    console.log('================================');

    let totalChecks = 0;
    let passedChecks = 0;
    let failedChecks = 0;
    let warningChecks = 0;

    this.results.forEach((result) => {
      console.log('');
      console.log(`📁 ${result.category}`);
      console.log('---');

      result.checks.forEach((check) => {
        totalChecks++;
        
        let icon = '';
        if (check.status === 'pass') {
          icon = '✅';
          passedChecks++;
        } else if (check.status === 'fail') {
          icon = '❌';
          failedChecks++;
        } else {
          icon = '⚠️';
          warningChecks++;
        }

        console.log(`${icon} ${check.name}: ${check.message}`);
      });
    });

    console.log('');
    console.log('================================');
    console.log(`Total Checks: ${totalChecks}`);
    console.log(`✅ Passed: ${passedChecks}`);
    console.log(`❌ Failed: ${failedChecks}`);
    console.log(`⚠️ Warnings: ${warningChecks}`);
    console.log('================================');

    if (failedChecks === 0) {
      console.log('');
      console.log('🎉 All critical checks passed!');
      console.log('✅ App is ready to run');
    } else {
      console.log('');
      console.log('⚠️ Some checks failed!');
      console.log('❌ Please fix the issues above before running the app');
    }

    console.log('');
  }

  /**
   * Get summary of results
   */
  getSummary(): {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    allPassed: boolean;
  } {
    let total = 0;
    let passed = 0;
    let failed = 0;
    let warnings = 0;

    this.results.forEach((result) => {
      result.checks.forEach((check) => {
        total++;
        if (check.status === 'pass') passed++;
        else if (check.status === 'fail') failed++;
        else warnings++;
      });
    });

    return {
      total,
      passed,
      failed,
      warnings,
      allPassed: failed === 0,
    };
  }
}

// Export singleton instance
export const startupVerification = new StartupVerification();

export default startupVerification;
