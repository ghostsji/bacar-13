import { Injectable } from '@angular/core';
import { MqttPayload } from './mqtt-payload.model';
import * as Paho from 'paho-mqtt';

@Injectable({
  providedIn: 'root',
})
export class MqttService {
  private client: Paho.Client;
  private readonly brokerHost = 'broker.emqx.io';
  private readonly brokerPort = 8084;
  private readonly clientId = `client_${Math.random().toString(16).slice(3)}`;
  private isConnected = false;
  private subscribedTopics = new Set<string>();
  private reconnectInterval: any = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 5000;

  public onMessageArrived: ((topic: string, payload: any) => void) | null =
    null;
  public onConnectionChange: ((connected: boolean) => void) | null = null;
  public onError: ((error: any) => void) | null = null;

  constructor() {
    this.client = new Paho.Client(
      this.brokerHost,
      this.brokerPort,
      this.clientId
    );
    this.client.onMessageArrived = (message: Paho.Message) => {
      if (this.onMessageArrived) {
        try {
          const payload = JSON.parse(message.payloadString);
          this.onMessageArrived(message.destinationName, payload);
        } catch (e) {
          this.onMessageArrived(message.destinationName, message.payloadString);
        }
      }
    };

    this.client.onConnectionLost = (responseObject: any) => {
      console.warn('MQTT connection lost:', responseObject.errorMessage);
      this.isConnected = false;
      if (this.onConnectionChange) {
        this.onConnectionChange(false);
      }
      this.scheduleReconnect();
    };

    this.connect();
  }

  public connect() {
    this.client.connect({
      timeout: 10, // timeout in seconds
      useSSL: true,
      onSuccess: () => {
        console.log('Connected to MQTT broker');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
        if (this.onConnectionChange) {
          this.onConnectionChange(true);
        }
        // Resubscribe to all topics
        this.resubscribe();
      },
      onFailure: (error: any) => {
        console.error('MQTT connection failed:', error);
        this.isConnected = false;
        if (this.onConnectionChange) {
          this.onConnectionChange(false);
        }
        if (this.onError) {
          this.onError(error);
        }
        this.scheduleReconnect();
      },
    });
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      if (this.onError) {
        this.onError('Max reconnection attempts reached');
      }
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }
    this.reconnectInterval = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private resubscribe() {
    // Initial subscriptions
    const initialTopics = [
      'BaCaR/Launch/Event/ZS6HJH/#',
      'BaCaR/Launch/Event/ZS6HJH/AeroLink/Telemetry',
      'BaCaR/Launch/Event/ZS6HJH/LuminaS/Telemetry',
      'BaCaR/Launch/Event/ZS6HJH/AeroLink/Commands',
      'BaCaR/Launch/Event/ZS6HJH/LuminaS/Commands',
      'BaCaR/Launch/Event/ZS6HJH/LuminaS/Response',
      'BaCaR/Launch/Event/ZS6HJH/AeroLink/Response'
    ];
    initialTopics.forEach(topic => {
      if (!this.subscribedTopics.has(topic)) {
        this.subscribeToTopic(topic);
      }
    });

    // Resubscribe to any dynamic topics
    this.subscribedTopics.forEach(topic => {
      if (this.isConnected) {
        try {
          this.client.subscribe(topic);
          console.log('Resubscribed to:', topic);
        } catch (e) {
          console.error('Failed to resubscribe to:', topic, e);
        }
      }
    });
  }

  subscribeToTopic(topic: string): void {
    if (!this.isConnected) {
      console.warn('Cannot subscribe: not connected');
      return;
    }
    try {
      this.client.subscribe(topic);
      this.subscribedTopics.add(topic);
      console.log('Subscribed to:', topic);
    } catch (e) {
      console.error('Failed to subscribe to:', topic, e);
      if (this.onError) {
        this.onError(e);
      }
    }
  }

  unsubscribeFromTopic(topic: string): void {
    if (!this.isConnected) {
      console.warn('Cannot unsubscribe: not connected');
      return;
    }
    try {
      this.client.unsubscribe(topic);
      this.subscribedTopics.delete(topic);
      console.log('Unsubscribed from:', topic);
    } catch (e) {
      console.error('Failed to unsubscribe from:', topic, e);
      if (this.onError) {
        this.onError(e);
      }
    }
  }

  sendMqttMessage(payload: MqttPayload, topic: string) {
    if (!this.client.isConnected()) {
      console.error('MQTT client is not connected');
      if (this.onError) {
        this.onError('Client not connected');
      }
      return;
    }
    try {
      const message = new Paho.Message(JSON.stringify(payload));
      message.destinationName = topic;
      this.client.send(message);
      console.log('Message sent to topic:', topic, payload);
    } catch (e) {
      console.error('Failed to send message:', e);
      if (this.onError) {
        this.onError(e);
      }
    }
  }

  public getSubscribedTopics(): string[] {
    return Array.from(this.subscribedTopics);
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  ngOnDestroy() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }
    if (this.isConnected) {
      this.client.disconnect();
    }
    this.subscribedTopics.clear();
  }
}
