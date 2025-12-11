export interface AeroLinkPayload {
  "Device": string;
  "From Address": string;
  "To Address": string;
  "Command": string;
  "VHF Frequency": number;
  "UHF Frequency": number;
  "LoRa TX Delay Time": string;
  "Battery Voltage": number;
  "RunTime": string;
  "Packets Sent": number;
  "Packets Received": number;
  "CRC": string;
}

export interface LuminaSPayload {
  "Device": string;
  "From Address": string;
  "To Address": string;
  "Command": string;
  "System Status": string;
  "RPi Status": string;
  "WiFi Status": string;
  "GSM Status": string;
  "APRS Radio": string;
  "APRS TX Delay Time": string;
  "LoRa TX Delay Time": string;
  "Battery Heater Status": string;
  "GPS LAT": number;
  "GPS LON": number;
  "APRS Packets Sent": number;
  "LoRa Packets Sent": number;
  "GSM Packets Sent": number;
  "Temperature Outside": number;
  "Temperature Inside": number;
  "Humidity Outside": number;
  "Humidity Inside": number;
  "Altitude": string;
  "Pressure": number;
  "Accelerometer": [number, number, number];
  "Gyroscope": [number, number, number];
  "Magnetometer": [number, number, number];
  "UV Index": number;
  "Battery Level": string;
  "Battery Max Current Draw": string;
  "Battery Avg Current Draw": string;
  "Battery Temperature": number;
  "Battery Heater Current Draw": string;
  "Images Taken": number;
  "Videos Taken": number;
  "Total Packets Sent": number;
  "Packets Received": number;
  "Runtime": string;
  "CRC": string;
}

export type MqttPayload = {
  logout: AeroLinkPayload | LuminaSPayload | { [key: string]: any };
};