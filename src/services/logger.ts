export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

const IS_DEBUG = typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_URSAI_DEBUG === 'true';

/**
 * Sanitizes object keys and values to ensure credentials/tokens are never logged.
 */
function sanitizeData(data: any): any {
  if (!data) return data;
  if (typeof data === 'string') {
    if (data.includes('Bearer ') || data.includes('api_key') || data.includes('NVIDIA_API_KEY')) {
      return '[REDACTED_SECRET]';
    }
    return data;
  }
  if (typeof data !== 'object') return data;

  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('key') || lowerKey.includes('secret') || lowerKey.includes('token') || lowerKey.includes('auth')) {
      sanitized[key] = '[REDACTED_SECRET]';
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = sanitizeData(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

export const logger = {
  info(message: string, context?: Record<string, any>): StructuredLogEntry {
    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      context: sanitizeData(context),
    };
    if (IS_DEBUG) {
      console.log(`[URSAI INFO ${entry.timestamp}] ${message}`, entry.context || '');
    }
    return entry;
  },

  warn(message: string, context?: Record<string, any>): StructuredLogEntry {
    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      context: sanitizeData(context),
    };
    console.warn(`[URSAI WARN ${entry.timestamp}] ${message}`, entry.context || '');
    return entry;
  },

  error(message: string, error?: any, context?: Record<string, any>): StructuredLogEntry {
    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message: `${message}${error ? `: ${error.message || String(error)}` : ''}`,
      context: sanitizeData(context),
    };
    console.error(`[URSAI ERROR ${entry.timestamp}] ${entry.message}`, entry.context || '');
    return entry;
  },
};
