import { ROLE } from '../constants/roles';

export const RUTAS_INICIO_POR_ROL: Record<string, string> = {
    [ROLE.MEDICO]: '/atencion-medica',
    [ROLE.TECNICO_FARMACIA]: '/farmacia/despacho',
    [ROLE.CAJERO]: '/caja-facturacion',
    [ROLE.RECEPCIONISTA]: '/admision/consulta',
    [ROLE.ENFERMERO]: '/admision/historias',
    [ROLE.JEFE_ENFERMERIA]: '/admision/historias',
    [ROLE.ADMINISTRADOR]: '/dashboard'
};

export const RUTA_POR_DEFECTO = '/login';