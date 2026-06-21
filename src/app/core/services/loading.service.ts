import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, observeOn, asapScheduler } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  
  // Contador interno: ¿Cuántas peticiones están viajando a Spring Boot ahora mismo?
  private activeRequestsCount = 0;
  
  // La "radio" privada que emite el estado (true/false)
  private readonly isLoadingSubject = new BehaviorSubject<boolean>(false);

  // La antena pública a la que se conectará nuestro HTML para escuchar la radio
  readonly isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable().pipe(
    observeOn(asapScheduler)
  );

  /**
   * Se ejecuta cada vez que el interceptor detecta que una petición SALE hacia el servidor.
   */
  show(): void {
    this.activeRequestsCount++;
    // Solo encendemos el spinner en la primera petición. Las demás se apilan en silencio.
    if (this.activeRequestsCount === 1) {
      this.isLoadingSubject.next(true);
    }
  }

  /**
   * Se ejecuta cada vez que una petición REGRESA del servidor (sea éxito o error).
   */
  hide(): void {
    this.activeRequestsCount--;
    
    // Condición de seguridad: Previene que el contador baje de 0 si ocurre un error extraño.
    // Solo apagamos el spinner cuando el contador llega exactamente a 0 (cero peticiones volando).
    if (this.activeRequestsCount <= 0) {
      this.activeRequestsCount = 0;
      this.isLoadingSubject.next(false);
    }
  }
}
