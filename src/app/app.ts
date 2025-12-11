import { Component, signal, OnDestroy } from '@angular/core';
import { MqttService } from './mqtt.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App implements OnDestroy {
  public readonly title = signal('MQTTAndroidApp');

  public loginTab = signal<'amateur' | 'alternative'>('amateur');
  public callSign = signal<string>('');
  public gridSquare = signal<string>('');
  public name = signal<string>('');
  public city = signal<string>('');
  public isLoggedIn = signal<boolean>(false);
  public isLoggingIn = signal<boolean>(false);
  public isConnecting = signal<boolean>(false);
  public errorMessage = signal<string>('');
  public successMessage = signal<string>('');

  private lastLoginData: any = null;

  public responses = new Map<string, any>();
  public timers = new Map<string, number>();
  public highlights = new Map<string, boolean>();
  public lastUpdateTimes = new Map<string, Date>();
  public selectedTopic = signal<string>('BaCaR/Launch/Event/ZS6HJH/AeroLink/Response');
  public selectedTab = signal<'AeroLink' | 'Lumina'>('AeroLink');

  public isConnected = false;
  public lastMessageTime = signal<Date | null>(null);
  public updateTrigger = signal(0);

  public messageHistory: {topic: string, payload: any, timestamp: Date, type: 'sent' | 'received'}[] = [];

  private intervals = new Map<string, any>();
  private highlightTimeouts = new Map<string, any>();
  private historyTimerInterval: any = null;
  private readonly countdownSeconds = 10;

  public subscribedTopics = signal<string[]>([]);

  private initialTopics = [
    'BaCaR/Launch/Event/ZS6HJH/#',
    'BaCaR/Launch/Event/ZS6HJH/AeroLink/Telemetry',
    'BaCaR/Launch/Event/ZS6HJH/LuminaS/Telemetry',
    'BaCaR/Launch/Event/ZS6HJH/AeroLink/Commands',
    'BaCaR/Launch/Event/ZS6HJH/LuminaS/Commands',
    'BaCaR/Launch/Event/ZS6HJH/LuminaS/Response',
    'BaCaR/Launch/Event/ZS6HJH/AeroLink/Response'
  ];

  public getFilteredTopics(): string[] {
    const tab = this.selectedTab();
    return this.subscribedTopics().filter(topic =>
      topic.includes('AeroLink') || topic.includes('LuminaS') ?
      (tab === 'AeroLink' ? topic.includes('AeroLink') : topic.includes('LuminaS')) : true
    );
  }

  public getAllResponses(): {topic: string, payload: any, lastUpdate: Date}[] {
    const result: {topic: string, payload: any, lastUpdate: Date}[] = [];
    this.responses.forEach((payload, topic) => {
      const lastUpdate = this.lastUpdateTimes.get(topic) || new Date();
      result.push({ topic, payload, lastUpdate });
    });
    return result.sort((a, b) => b.lastUpdate.getTime() - a.lastUpdate.getTime());
  }

  constructor(private mqttService: MqttService) {
    this.subscribedTopics.set(this.initialTopics);

    this.mqttService.onMessageArrived = (topic, payload) => {
      const wrappedPayload = { a: payload };
      this.messageHistory.push({topic, payload: wrappedPayload, timestamp: new Date(), type: 'received'});
      this.lastMessageTime.set(new Date());
      this.lastUpdateTimes.set(topic, new Date());
      if (this.messageHistory.length > 50) {
        this.messageHistory.shift();
      }
      this.responses.set(topic, wrappedPayload);
      this.resetTimer(topic);
      this.highlight(topic);
    };

    this.mqttService.onConnectionChange = (connected) => {
      this.isConnected = connected;
      this.isConnecting.set(false);
      if (connected) {
        this.subscribedTopics.set(this.mqttService.getSubscribedTopics());
      }
    };

    this.mqttService.onError = (error) => {
      console.error('MQTT Error:', error);
      this.errorMessage.set('Connection error: ' + error.message || error);
      this.isConnecting.set(false);
    };

    // Initialize connection status
    this.isConnected = this.mqttService.getConnectionStatus();

    // Start history timer update
    this.historyTimerInterval = setInterval(() => this.updateTrigger.set(this.updateTrigger() + 1), 1000);
  }

  private highlight(topic: string) {
    this.highlights.set(topic, true);
    const existingTimeout = this.highlightTimeouts.get(topic);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    const timeout = setTimeout(() => {
      this.highlights.set(topic, false);
    }, 3000);
    this.highlightTimeouts.set(topic, timeout);
  }

  private resetTimer(topic: string) {
    this.timers.set(topic, this.countdownSeconds);
    const existingInterval = this.intervals.get(topic);
    if (existingInterval) {
      clearInterval(existingInterval);
    }
    const interval = setInterval(() => {
      const currentTimer = this.timers.get(topic) || 0;
      if (currentTimer > 0) {
        this.timers.set(topic, currentTimer - 1);
      }
    }, 1000);
    this.intervals.set(topic, interval);
  }

  public objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  public isArray(val: any): boolean {
    return Array.isArray(val);
  }

  public timeSinceLastMessage(): string {
    const lastTime = this.lastMessageTime();
    if (!lastTime) return 'No messages yet';
    const diffMs = Date.now() - lastTime.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    return `${diffHour}h ago`;
  }

  public login() {
    this.errorMessage.set('');
    this.successMessage.set('');
    let loginData: any;
    if (this.loginTab() === 'amateur') {
      if (!this.callSign() || !this.gridSquare()) {
        this.errorMessage.set('Call sign and grid square are required');
        return;
      }
      if (this.gridSquare().length !== 6) {
        this.errorMessage.set('Grid square must be exactly 6 characters');
        return;
      }
      loginData = {
        callSign: this.callSign(),
        gridSquare: this.gridSquare()
      };
      this.lastLoginData = loginData;
      this.callSign.set('');
      this.gridSquare.set('');
    } else {
      if (!this.name() || !this.city()) {
        this.errorMessage.set('Name and city are required');
        return;
      }
      loginData = {
        name: this.name(),
        city: this.city()
      };
      this.lastLoginData = loginData;
      this.name.set('');
      this.city.set('');
    }
    const payload: any = { login: loginData };
    if (this.mqttService.getConnectionStatus()) {
      this.isLoggingIn.set(true);
      this.mqttService.sendMqttMessage(payload, 'BaCaR/Launch/Event/AppUsers');
      this.isLoggedIn.set(true);
      this.isLoggingIn.set(false);
      this.successMessage.set('Login successful!');
      setTimeout(() => this.successMessage.set(''), 3000);
      console.log('Login sent:', payload);
    } else {
      this.errorMessage.set('Cannot login: MQTT not connected');
    }
  }

  public clearHistory() {
    this.messageHistory = [];
    this.lastMessageTime.set(null);
  }

  public logout() {
    this.isLoggedIn.set(false);
    this.callSign.set('');
    this.gridSquare.set('');
    this.name.set('');
    this.city.set('');

    const logoutData = { action: 'logout', ...this.lastLoginData };
    const payload = { logout: logoutData };
    if (this.mqttService.getConnectionStatus()) {
      this.mqttService.sendMqttMessage(payload, 'BaCaR/Launch/Event/AppUsers');
      console.log('Logout sent:', payload);
    }
  }

  public retryConnect() {
    this.isConnecting.set(true);
    this.errorMessage.set('');
    this.mqttService.connect();
    // Note: isConnecting will be reset when connection status changes
  }

  ngOnDestroy() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.highlightTimeouts.forEach(timeout => clearTimeout(timeout));
    this.highlightTimeouts.clear();
    if (this.historyTimerInterval) {
      clearInterval(this.historyTimerInterval);
    }
  }
}
