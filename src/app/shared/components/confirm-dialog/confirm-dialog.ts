import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
