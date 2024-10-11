import { TestBed } from '@angular/core/testing';

import { BubbleUIService } from './bubble-ui.service';

describe('BubbleUIService', () => {
  let service: BubbleUIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BubbleUIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
