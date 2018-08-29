/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Format3Component } from './format3.component';

describe('Format3Component', () => {
  let component: Format3Component;
  let fixture: ComponentFixture<Format3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Format3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Format3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
