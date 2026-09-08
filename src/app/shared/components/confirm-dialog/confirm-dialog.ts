import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [A11yModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  readonly open         = input(false);
  readonly title        = input('Confirm');
  readonly message      = input('');
  readonly confirmLabel = input('Delete');
  readonly danger       = input(true);

  readonly confirmed  = output<void>();
  readonly cancelled  = output<void>();
}
