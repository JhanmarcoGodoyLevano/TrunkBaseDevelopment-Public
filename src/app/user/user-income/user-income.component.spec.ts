import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserIncomeComponent } from './user-income.component';

describe('UserIncomeComponent', () => {
  let component: UserIncomeComponent;
  let fixture: ComponentFixture<UserIncomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserIncomeComponent]
    });
    fixture = TestBed.createComponent(UserIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
