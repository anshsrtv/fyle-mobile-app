import { TestBed } from '@angular/core/testing';

import { PushNotificationService } from './push-notification.service';

xdescribe('PushNotificationService', () => {
  let service: PushNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PushNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
