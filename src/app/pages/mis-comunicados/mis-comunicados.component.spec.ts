import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisComunicadosComponent } from './mis-comunicados.component';

describe('MisComunicadosComponent', () => {
  let component: MisComunicadosComponent;
  let fixture: ComponentFixture<MisComunicadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisComunicadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisComunicadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
