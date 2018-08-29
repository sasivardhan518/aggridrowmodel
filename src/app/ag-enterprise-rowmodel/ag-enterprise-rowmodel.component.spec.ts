import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgEnterpriseRowmodelComponent } from './ag-enterprise-rowmodel.component';

describe('AgEnterpriseRowmodelComponent', () => {
  let component: AgEnterpriseRowmodelComponent;
  let fixture: ComponentFixture<AgEnterpriseRowmodelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgEnterpriseRowmodelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgEnterpriseRowmodelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
