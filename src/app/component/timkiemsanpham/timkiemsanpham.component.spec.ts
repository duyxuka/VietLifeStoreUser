import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimkiemsanphamComponent } from './timkiemsanpham.component';

describe('TimkiemsanphamComponent', () => {
  let component: TimkiemsanphamComponent;
  let fixture: ComponentFixture<TimkiemsanphamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimkiemsanphamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimkiemsanphamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
