import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaFacturacionComponent } from './caja-facturacion.component';

describe('CajaFacturacion', () => {
  let component: CajaFacturacionComponent;
  let fixture: ComponentFixture<CajaFacturacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaFacturacionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CajaFacturacionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
