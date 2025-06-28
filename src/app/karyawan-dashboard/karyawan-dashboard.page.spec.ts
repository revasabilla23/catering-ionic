import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KaryawanDashboardPage } from './karyawan-dashboard.page';

describe('KaryawanDashboardPage', () => {
  let component: KaryawanDashboardPage;
  let fixture: ComponentFixture<KaryawanDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(KaryawanDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
