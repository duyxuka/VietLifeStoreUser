import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChitietcamnangComponent } from './chitietcamnang.component';

describe('ChitietcamnangComponent', () => {
  let component: ChitietcamnangComponent;
  let fixture: ComponentFixture<ChitietcamnangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChitietcamnangComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChitietcamnangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
