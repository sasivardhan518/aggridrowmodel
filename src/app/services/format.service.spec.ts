/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FormatService } from './format.service';

describe('Service: Format', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormatService]
    });
  });

  it('should ...', inject([FormatService], (service: FormatService) => {
    expect(service).toBeTruthy();
  }));
});
