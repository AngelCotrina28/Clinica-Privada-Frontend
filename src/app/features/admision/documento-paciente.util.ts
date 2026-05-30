export type TipoDocumentoPaciente = 'DNI' | 'CE';

const DNI_LONGITUD = 8;
const CE_LONGITUD_MAXIMA = 9;

export function limpiarDocumentoPaciente(tipo: TipoDocumentoPaciente, valor: string): string {
  const limpio = (valor ?? '').trim().toUpperCase();

  if (tipo === 'DNI') {
    return limpio.replace(/\D/g, '').slice(0, DNI_LONGITUD);
  }

  return limpio.replace(/[^A-Z0-9]/g, '').slice(0, CE_LONGITUD_MAXIMA);
}

export function maxDocumentoPaciente(tipo: TipoDocumentoPaciente): number {
  return tipo === 'DNI' ? DNI_LONGITUD : CE_LONGITUD_MAXIMA;
}

export function patronDocumentoPaciente(tipo: TipoDocumentoPaciente): string {
  return tipo === 'DNI' ? '^[0-9]{8}$' : '^[A-Za-z0-9]{1,9}$';
}

export function mensajeDocumentoPaciente(tipo: TipoDocumentoPaciente, valor: string): string {
  const documento = (valor ?? '').trim();

  if (!documento) {
    return 'Ingrese el documento del paciente.';
  }

  if (tipo === 'DNI' && !/^\d{8}$/.test(documento)) {
    return 'El DNI debe tener exactamente 8 digitos numericos.';
  }

  if (tipo === 'CE' && !/^[A-Z0-9]{1,9}$/i.test(documento)) {
    return 'El CE debe tener maximo 9 caracteres alfanumericos.';
  }

  return '';
}

