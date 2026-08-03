import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhoneUtil } from './phone.util';

describe('PhoneUtil', () => {
  let component: PhoneUtil;
  let fixture: ComponentFixture<PhoneUtil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhoneUtil],
    }).compileComponents();

    fixture = TestBed.createComponent(PhoneUtil);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
