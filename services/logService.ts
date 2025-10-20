import type { LogEntry, LogLevel } from '../types';

class LogService {
  private logs: LogEntry[] = [];
  private listeners: Set<() => void> = new Set();

  private log(level: LogLevel, title: string, details?: any) {
    // Keep the log to a reasonable size to avoid memory issues
    if (this.logs.length > 500) {
      this.logs.shift();
    }
    this.logs.push({ 
      id: Date.now() + Math.random(), 
      timestamp: new Date(), 
      level, 
      title, 
      details: details || {} 
    });
    this.listeners.forEach(listener => listener());
  }

  public debug(title: string, details?: any) {
    this.log('DEBUG', title, details);
    console.debug(`[DEBUG] ${title}`, details);
  }

  public info(title: string, details?: any) {
    this.log('INFO', title, details);
    console.info(`[INFO] ${title}`, details);
  }

  public warn(title: string, details?: any) {
    this.log('WARN', title, details);
    console.warn(`[WARN] ${title}`, details);
  }

  public error(title: string, details?: any) {
    this.log('ERROR', title, details);
    console.error(`[ERROR] ${title}`, details);
  }
  
  public api(title: string, details?: any) {
    this.log('API', title, details);
  }

  public getLogs(): LogEntry[] {
    return this.logs;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const logService = new LogService();
