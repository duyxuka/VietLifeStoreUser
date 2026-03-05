import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThongtincanhanComponent } from './thongtincanhan.component';

describe('ThongtincanhanComponent', () => {
  let component: ThongtincanhanComponent;
  let fixture: ComponentFixture<ThongtincanhanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ThongtincanhanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ThongtincanhanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
