/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DataGeneratorService } from './data-generator.service';

describe('Service: DataGenerator', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataGeneratorService]
    });
  });

  it('should ...', inject([DataGeneratorService], (service: DataGeneratorService) => {
    expect(service).toBeTruthy();
  }));
});
