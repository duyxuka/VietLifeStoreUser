import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DanhsachcamnangComponent } from './danhsachcamnang.component';

describe('DanhsachcamnangComponent', () => {
  let component: DanhsachcamnangComponent;
  let fixture: ComponentFixture<DanhsachcamnangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DanhsachcamnangComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DanhsachcamnangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
