import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { MqttService } from './mqtt.service';

describe('App', () => {
  let mqttServiceSpy: jasmine.SpyObj<MqttService>;

  beforeEach(async () => {
    mqttServiceSpy = jasmine.createSpyObj('MqttService', ['sendMqttMessage', 'getConnectionStatus', 'getSubscribedTopics', 'connect']);
    mqttServiceSpy.getConnectionStatus.and.returnValue(false);
    mqttServiceSpy.getSubscribedTopics.and.returnValue([]);
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: MqttService, useValue: mqttServiceSpy }]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('MQTTAndroidApp');
  });
});