import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const FORM_PATTERNS = {
  dni: /^\d{8}$/,
  telefono: /^\d{6,15}$/,
  nombrePersona: /^[A-Za-z\u00C0-\u017F]+(?:[ '\-][A-Za-z\u00C0-\u017F]+)*$/,
  codigoSimple: /^[A-Za-z\u00C0-\u017F0-9._\- ]+$/,
  entero: /^\d+$/,
  decimal: /^\d+(\.\d{1,2})?$/
};

export function fechaHoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function mesActualIso(): string {
  return new Date().toISOString().slice(0, 7);
}

export function noFutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    return value > fechaHoyIso() ? { futureDate: true } : null;
  };
}

export function minTodayValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    return value < fechaHoyIso() ? { pastDate: true } : null;
  };
}

export function integerValidator(): ValidatorFn {
  return patternValidator(FORM_PATTERNS.entero, 'integer');
}

export function decimalMoneyValidator(): ValidatorFn {
  return patternValidator(FORM_PATTERNS.decimal, 'decimalMoney');
}

export function patternValidator(pattern: RegExp, errorKey: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') return null;

    return pattern.test(String(value)) ? null : { [errorKey]: true };
  };
}

export function controlErrorMessage(control: AbstractControl | null | undefined, label: string): string {
  if (!control || !control.errors) return '';

  const errors = control.errors;
  if (errors['required']) return `${label} es obligatorio.`;
  if (errors['email']) return `${label} debe tener un correo valido.`;
  if (errors['minlength']) return `${label} debe tener al menos ${errors['minlength'].requiredLength} caracteres.`;
  if (errors['maxlength']) return `${label} no debe superar ${errors['maxlength'].requiredLength} caracteres.`;
  if (errors['min']) return `${label} debe ser mayor o igual a ${errors['min'].min}.`;
  if (errors['max']) return `${label} debe ser menor o igual a ${errors['max'].max}.`;
  if (errors['futureDate']) return `${label} no puede estar en el futuro.`;
  if (errors['pastDate']) return `${label} no puede estar en el pasado.`;
  if (errors['integer']) return `${label} debe contener solo numeros enteros.`;
  if (errors['decimalMoney']) return `${label} debe ser un monto valido con maximo 2 decimales.`;
  if (errors['pattern']) return `${label} tiene un formato invalido.`;

  return `${label} es invalido.`;
}
