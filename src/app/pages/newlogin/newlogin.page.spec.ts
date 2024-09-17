import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewloginPage } from './newlogin.page';

describe('NewloginPage', () => {
  let component: NewloginPage;
  let fixture: ComponentFixture<NewloginPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(NewloginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
