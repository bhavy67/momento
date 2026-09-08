import { Directive, ElementRef, OnDestroy, inject, input } from '@angular/core';

let uid = 0;

@Directive({
  selector: '[tooltip]',
  standalone: true,
  host: {
    '(mouseenter)': 'scheduleShow()',
    '(mouseleave)': 'hide()',
    '(focus)':      'scheduleShow()',
    '(blur)':       'hide()',
  },
})
export class TooltipDirective implements OnDestroy {
  readonly tooltip    = input.required<string>();
  readonly tooltipPos = input<'top' | 'bottom' | 'left' | 'right'>('top');

  private readonly el = inject(ElementRef<HTMLElement>);

  private tip: HTMLElement | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly id = `tip-${++uid}`;

  scheduleShow(): void {
    this.timer = setTimeout(() => this.show(), 300);
  }

  private show(): void {
    const text = this.tooltip();
    if (!text || this.tip) return;

    const pos = this.tooltipPos();
    const tip = document.createElement('div');
    tip.id = this.id;
    tip.setAttribute('role', 'tooltip');
    tip.className = `app-tooltip app-tooltip--${pos}`;
    tip.textContent = text;
    document.body.appendChild(tip);
    this.tip = tip;

    this.el.nativeElement.setAttribute('aria-describedby', this.id);

    requestAnimationFrame(() => {
      this.position();
      requestAnimationFrame(() => tip.classList.add('app-tooltip--visible'));
    });
  }

  hide(): void {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    if (!this.tip) return;
    this.tip.remove();
    this.tip = null;
    this.el.nativeElement.removeAttribute('aria-describedby');
  }

  private position(): void {
    if (!this.tip) return;
    const host = this.el.nativeElement.getBoundingClientRect();
    const tip  = this.tip.getBoundingClientRect();
    const gap  = 10;
    const pos  = this.tooltipPos();

    let top: number, left: number;

    if (pos === 'bottom') {
      top  = host.bottom + gap;
      left = host.left + host.width / 2 - tip.width / 2;
    } else if (pos === 'left') {
      top  = host.top + host.height / 2 - tip.height / 2;
      left = host.left - tip.width - gap;
    } else if (pos === 'right') {
      top  = host.top + host.height / 2 - tip.height / 2;
      left = host.right + gap;
    } else {
      // top (default)
      top  = host.top - tip.height - gap;
      left = host.left + host.width / 2 - tip.width / 2;
    }

    // Clamp to viewport
    left = Math.max(8, Math.min(left, window.innerWidth  - tip.width  - 8));
    top  = Math.max(8, Math.min(top,  window.innerHeight - tip.height - 8));

    this.tip.style.top  = `${top}px`;
    this.tip.style.left = `${left}px`;
  }

  ngOnDestroy(): void { this.hide(); }
}
