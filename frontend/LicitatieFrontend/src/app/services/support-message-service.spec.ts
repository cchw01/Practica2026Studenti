import { TestBed } from '@angular/core/testing';

import { SupportMessageService } from './support-message-service';

describe('SupportMessageService', () => {
  let service: SupportMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupportMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
