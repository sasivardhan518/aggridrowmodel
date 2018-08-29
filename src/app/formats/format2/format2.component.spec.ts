/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Format2Component } from './format2.component';

describe('Format2Component', () => {
  let component: Format2Component;
  let fixture: ComponentFixture<Format2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Format2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Format2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
