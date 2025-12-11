import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

declare var window: any;

if (window.cordova) {
  // Wait for Cordova to be ready
  document.addEventListener('deviceready', () => {
    bootstrapApplication(App, appConfig)
      .catch((err) => console.error(err));
  }, false);
} else {
  // For browser development
  bootstrapApplication(App, appConfig)
    .catch((err) => console.error(err));
}
