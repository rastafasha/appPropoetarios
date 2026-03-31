import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisFacturasComponent } from './mis-facturas.component';

describe('MisFacturasComponent', () => {
  let component: MisFacturasComponent;
  let fixture: ComponentFixture<MisFacturasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisFacturasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisFacturasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
