/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Format4Component } from './format4.component';

describe('Format3Component', () => {
  let component: Format4Component;
  let fixture: ComponentFixture<Format4Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [Format4Component]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Format4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
