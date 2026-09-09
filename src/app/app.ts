import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
