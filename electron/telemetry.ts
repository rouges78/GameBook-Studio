import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';

interface TelemetryEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: number;
}

class TelemetryService {
  private static instance: TelemetryService;
  private logPath: string;
  private isEnabled: boolean = true;

  private constructor() {
    this.logPath = path.join(app.getPath('userData'), 'telemetry');
  }

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  private async ensureLogDirectory(): Promise<void> {
    try {
      await fs.access(this.logPath);
    } catch {
      await fs.mkdir(this.logPath, { recursive: true });
    }
  }

  private getLogFileName(): string {
    const date = new Date();
    return `telemetry-${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.log`;
  }

  public async logEvents(events: TelemetryEvent[]): Promise<void> {
    if (!this.isEnabled || events.length === 0) return;

    try {
      await this.ensureLogDirectory();
      const logFile = path.join(this.logPath, this.getLogFileName());
      
      const formattedEvents = events.map(event => JSON.stringify({
        ...event,
        appVersion: app.getVersion(),
        platform: process.platform,
        arch: process.arch,
      })).join('\n') + '\n';

      await fs.appendFile(logFile, formattedEvents, 'utf8');
    } catch (error) {
      console.error('Failed to log telemetry events:', error);
    }
  }

  public async getAllTelemetryData(): Promise<TelemetryEvent[]> {
    try {
      await this.ensureLogDirectory();
      const files = await fs.readdir(this.logPath);
      const logFiles = files.filter(file => file.startsWith('telemetry-') && file.endsWith('.log'));
      
      const allEvents: TelemetryEvent[] = [];
      
      for (const file of logFiles) {
        const content = await fs.readFile(path.join(this.logPath, file), 'utf8');
        const lines = content.trim().split('\n');
        
        for (const line of lines) {
          try {
            const event = JSON.parse(line);
            allEvents.push(event);
          } catch (e) {
            console.error(`Failed to parse telemetry event: ${line}`, e);
          }
        }
      }
      
      // Sort events by timestamp
      return allEvents.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Failed to read telemetry data:', error);
      return [];
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public istelemetryEnabled(): boolean {
    return this.isEnabled;
  }

  public async getTelemetryStatus(): Promise<boolean> {
    return this.isEnabled;
  }
}

export const telemetryService = TelemetryService.getInstance();
