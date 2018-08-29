/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DataMergeService } from './data-merge.service';

describe('Service: DataMerge', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataMergeService]
    });
  });

  it('should ...', inject([DataMergeService], (service: DataMergeService) => {
    expect(service).toBeTruthy();
  }));
});
