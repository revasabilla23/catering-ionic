import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HrgaDashboardPage } from './hrga-dashboard.page';

describe('HrgaDashboardPage', () => {
  let component: HrgaDashboardPage;
  let fixture: ComponentFixture<HrgaDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HrgaDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
