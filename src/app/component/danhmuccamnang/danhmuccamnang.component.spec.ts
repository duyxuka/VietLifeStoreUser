import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DanhmuccamnangComponent } from './danhmuccamnang.component';

describe('DanhmuccamnangComponent', () => {
  let component: DanhmuccamnangComponent;
  let fixture: ComponentFixture<DanhmuccamnangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DanhmuccamnangComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DanhmuccamnangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
