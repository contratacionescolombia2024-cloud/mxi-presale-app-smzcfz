
/**
 * Comprehensive Error Handler
 * Provides centralized error handling and logging
 */

export enum ErrorType {
  AUTHENTICATION = 'AUTHENTICATION',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  VALIDATION = 'VALIDATION',
  PAYMENT = 'PAYMENT',
  WEB3 = 'WEB3',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: any;
  timestamp: Date;
  userId?: string;
  context?: Record<string, any>;
}

class ErrorHandler {
  private errors: AppError[] = [];
  private maxErrors = 100; // Keep last 100 errors in memory

  /**
   * Handle an error with proper logging and user feedback
   */
  handle(error: any, type: ErrorType = ErrorType.UNKNOWN, context?: Record<string, any>): AppError {
    const appError: AppError = {
      type,
      message: this.extractMessage(error),
      originalError: error,
      timestamp: new Date(),
      context,
    };

    // Log to console
    this.logError(appError);

    // Store in memory
    this.storeError(appError);

    return appError;
  }

  /**
   * Extract user-friendly message from error
   */
  private extractMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error?.message) {
      return error.message;
    }

    if (error?.error_description) {
      return error.error_description;
    }

    if (error?.msg) {
      return error.msg;
    }

    return 'An unexpected error occurred';
  }

  /**
   * Log error to console with formatting
   */
  private logError(error: AppError): void {
    const emoji = this.getErrorEmoji(error.type);
    console.error(`${emoji} [${error.type}] ${error.message}`);
    
    if (error.context) {
      console.error('Context:', error.context);
    }
    
    if (error.originalError) {
      console.error('Original Error:', error.originalError);
    }
  }

  /**
   * Get emoji for error type
   */
  private getErrorEmoji(type: ErrorType): string {
    const emojiMap: Record<ErrorType, string> = {
      [ErrorType.AUTHENTICATION]: '🔐',
      [ErrorType.NETWORK]: '🌐',
      [ErrorType.DATABASE]: '🗄️',
      [ErrorType.VALIDATION]: '⚠️',
      [ErrorType.PAYMENT]: '💳',
      [ErrorType.WEB3]: '🔗',
      [ErrorType.UNKNOWN]: '❌',
    };

    return emojiMap[type] || '❌';
  }

  /**
   * Store error in memory
   */
  private storeError(error: AppError): void {
    this.errors.push(error);

    // Keep only last N errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
  }

  /**
   * Get all stored errors
   */
  getErrors(): AppError[] {
    return [...this.errors];
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: ErrorType): AppError[] {
    return this.errors.filter(e => e.type === type);
  }

  /**
   * Clear all stored errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: any, type: ErrorType = ErrorType.UNKNOWN): string {
    const message = this.extractMessage(error);

    // Map common errors to user-friendly messages
    const messageMap: Record<string, string> = {
      'Email not confirmed': 'Please verify your email address before logging in. Check your inbox for the verification link.',
      'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
      'User already registered': 'An account with this email already exists. Please login instead.',
      'Network request failed': 'Network error. Please check your internet connection and try again.',
      'Failed to fetch': 'Unable to connect to server. Please check your internet connection.',
      'Insufficient USDT balance': 'You don\'t have enough USDT in your wallet for this transaction.',
      'Insufficient BNB for gas': 'You don\'t have enough BNB to pay for transaction fees.',
      'Transaction was rejected': 'You rejected the transaction in your wallet.',
      'Wallet not connected': 'Please connect your wallet first.',
    };

    // Check for exact matches
    for (const [key, value] of Object.entries(messageMap)) {
      if (message.includes(key)) {
        return value;
      }
    }

    // Return original message if no mapping found
    return message;
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

/**
 * Helper function to handle async operations with error handling
 */
export async function handleAsync<T>(
  operation: () => Promise<T>,
  errorType: ErrorType = ErrorType.UNKNOWN,
  context?: Record<string, any>
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error) {
    const appError = errorHandler.handle(error, errorType, context);
    return { data: null, error: appError };
  }
}

/**
 * Helper function to wrap sync operations with error handling
 */
export function handleSync<T>(
  operation: () => T,
  errorType: ErrorType = ErrorType.UNKNOWN,
  context?: Record<string, any>
): { data: T | null; error: AppError | null } {
  try {
    const data = operation();
    return { data, error: null };
  } catch (error) {
    const appError = errorHandler.handle(error, errorType, context);
    return { data: null, error: appError };
  }
}

/**
 * Helper to check if error is of specific type
 */
export function isErrorType(error: any, type: ErrorType): boolean {
  if (!error) return false;
  return error.type === type;
}

/**
 * Helper to format error for display
 */
export function formatErrorForDisplay(error: AppError): string {
  return `${error.message}\n\nTime: ${error.timestamp.toLocaleString()}`;
}

export default errorHandler;
