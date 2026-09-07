import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="p-6"><p>Timeline — coming in Phase 5</p></div>`,
})
export class Timeline {}
