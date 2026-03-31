import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorUbicacionComponent } from './selector-ubicacion.component';

describe('SelectorUbicacionComponent', () => {
  let component: SelectorUbicacionComponent;
  let fixture: ComponentFixture<SelectorUbicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorUbicacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectorUbicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
