import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="p-6"><p>Settings — coming in Phase 7</p></div>`,
})
export class Settings {}
