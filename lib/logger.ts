type LogLevel = 'info' | 'warn' | 'error';

function logMessage(level: LogLevel, message: string, meta?: any) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message,
    ...(meta && { meta }),
  };

  // In a real-world scenario, you might want to use a logging service
  // For now, we'll just console.log
  console.log(JSON.stringify(logData));

  // TODO: Implement proper error tracking (e.g., Sentry, LogRocket)
}

export const logger = {
  info: (message: string, meta?: any) => logMessage('info', message, meta),
  warn: (message: string, meta?: any) => logMessage('warn', message, meta),
  error: (message: string, meta?: any) => logMessage('error', message, meta),
};