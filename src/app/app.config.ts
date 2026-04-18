import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    // Optimización de detección de cambios
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Router con las rutas definidas
    // withComponentInputBinding() permite pasar params de ruta
    // como @Input() en los componentes (útil más adelante)
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient()
  ]
};