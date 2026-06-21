import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { filter } from 'rxjs';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  mostrarMenu = false;
  private router = inject(Router);
  loadingService = inject(LoadingService);

  constructor() {
    this.mostrarMenu = this.debeMostrarMenu(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.mostrarMenu = this.debeMostrarMenu(event.urlAfterRedirects);
    });
  }

  private debeMostrarMenu(url: string): boolean {
    const ruta = url.split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
    return ruta !== '/' && ruta !== '/login';
  }
}
