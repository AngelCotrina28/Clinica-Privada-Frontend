import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaFacturacion } from './caja-facturacion';

describe('CajaFacturacion', () => {
  let component: CajaFacturacion;
  let fixture: ComponentFixture<CajaFacturacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaFacturacion],
    }).compileComponents();

    fixture = TestBed.createComponent(CajaFacturacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
