# BACAR-13-2025 MQTT Android App

An MQTT Android application built with Angular and Cordova for BaCaR (Balloon Communications and Research) project. This app enables real-time communication with BaCaR launch systems, providing telemetry data, command capabilities, and user management features.

## Features

- **Real-time MQTT Communication**: Connect to BaCaR MQTT brokers for live data streaming
- **Telemetry Monitoring**: Display real-time telemetry data from AeroLink and LuminaS systems
- **Command Interface**: Send commands to BaCaR launch systems
- **User Authentication**: Login/logout functionality for amateur radio operators and alternative users
- **Message History**: Track sent and received MQTT messages with timestamps
- **Topic Management**: Subscribe to and filter MQTT topics (AeroLink, LuminaS)
- **Connection Status**: Monitor MQTT connection status and reconnection capabilities
- **Location Permissions**: Access to device location for grid square calculations

## Technologies Used

- **Angular 20**: Modern web framework for building the user interface
- **Paho MQTT**: JavaScript MQTT client library for broker communication
- **Cordova**: Hybrid mobile app framework for Android deployment
- **TypeScript**: Strongly typed programming language
- **RxJS**: Reactive programming library for handling asynchronous operations

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Android SDK (for Cordova builds)
- Java JDK (for Android development)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd MQTTAndroidApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the Angular application:
   ```bash
   npm run build
   ```

## Development

To start the development server:

```bash
npm start
```

This will start the Angular development server on `http://localhost:4200`.

## Building for Android

1. Navigate to the Cordova directory:
   ```bash
   cd MQTTAndroidAppCordova
   ```

2. Add Android platform (if not already added):
   ```bash
   cordova platform add android
   ```

3. Build the Android APK:
   ```bash
   cordova build android
   ```

4. Run on device/emulator:
   ```bash
   cordova run android
   ```

## Usage

1. **Launch the App**: Open the app on your Android device
2. **Connect to MQTT**: The app will automatically attempt to connect to the configured MQTT broker
3. **Login**: Choose between amateur radio login (call sign + grid square) or alternative login (name + city)
4. **Monitor Telemetry**: View real-time data from subscribed topics
5. **Send Commands**: Use the interface to send commands to BaCaR systems
6. **View History**: Check message history and connection status

## MQTT Topics

The app subscribes to the following BaCaR topics:
- `BaCaR/Launch/Event/ZS6HJH/#` (wildcard subscription)
- `BaCaR/Launch/Event/ZS6HJH/AeroLink/Telemetry`
- `BaCaR/Launch/Event/ZS6HJH/LuminaS/Telemetry`
- `BaCaR/Launch/Event/ZS6HJH/AeroLink/Commands`
- `BaCaR/Launch/Event/ZS6HJH/LuminaS/Commands`
- `BaCaR/Launch/Event/ZS6HJH/LuminaS/Response`
- `BaCaR/Launch/Event/ZS6HJH/AeroLink/Response`

## Permissions

The app requires the following Android permissions:
- `ACCESS_FINE_LOCATION`: For precise location access
- `ACCESS_COARSE_LOCATION`: For approximate location access
- `INTERNET`: For MQTT broker communication
- `ACCESS_NETWORK_STATE`: For network connectivity monitoring

## Author

Dylan - dylan@example.com

## Contributing

Please read the contributing guidelines before making contributions to this project.

## License

This project is proprietary software for BaCaR operations.
