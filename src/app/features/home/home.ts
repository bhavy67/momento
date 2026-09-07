import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="p-6"><p>Home — coming in Phase 2</p></div>`,
})
export class Home {}
