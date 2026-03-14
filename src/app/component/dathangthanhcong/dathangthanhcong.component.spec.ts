import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DathangthanhcongComponent } from './dathangthanhcong.component';

describe('DathangthanhcongComponent', () => {
  let component: DathangthanhcongComponent;
  let fixture: ComponentFixture<DathangthanhcongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DathangthanhcongComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DathangthanhcongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
