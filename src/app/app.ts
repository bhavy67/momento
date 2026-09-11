import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { UiStateService } from '@core/services/ui-state.service';
import { SettingsService } from '@core/services/settings.service';
import { NotificationService } from '@core/services/notification.service';
import { SearchOverlay } from '@shared/components/search-overlay/search-overlay';
import { TooltipDirective } from '@shared/directives/tooltip.directive';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SearchOverlay, TooltipDirective],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly ui       = inject(UiStateService);
  protected readonly settings = inject(SettingsService);

  private readonly router = inject(Router);
  protected readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
    ),
    { initialValue: this.router.url }
  );

  protected get fabLink(): string {
    const url = this.currentUrl() ?? '';
    if (url.startsWith('/people'))   return '/people/new';
    if (url.startsWith('/memories')) return '/memories/new';
    return '/events/new';
  }

  protected get fabLabel(): string {
    const url = this.currentUrl() ?? '';
    if (url.startsWith('/people'))   return 'Add person';
    if (url.startsWith('/memories')) return 'Add memory';
    return 'Add event';
  }

  constructor() {
    inject(NotificationService).checkAndNotify();
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(e: KeyboardEvent): void {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      this.ui.searchOpen() ? this.ui.closeSearch() : this.ui.openSearch();
    }
  }
}
