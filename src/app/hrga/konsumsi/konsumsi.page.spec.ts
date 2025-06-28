import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KonsumsiPage } from './konsumsi.page';

describe('KonsumsiPage', () => {
  let component: KonsumsiPage;
  let fixture: ComponentFixture<KonsumsiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(KonsumsiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
