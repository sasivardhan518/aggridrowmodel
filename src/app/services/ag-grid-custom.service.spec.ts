/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AgGridCustomService } from './ag-grid-custom.service';

describe('Service: AgGridCustom', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AgGridCustomService]
    });
  });

  it('should ...', inject([AgGridCustomService], (service: AgGridCustomService) => {
    expect(service).toBeTruthy();
  }));
});
