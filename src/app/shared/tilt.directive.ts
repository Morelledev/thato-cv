import { Directive, ElementRef, NgZone, OnDestroy, OnInit, inject } from '@angular/core';

/**
 * Subtle cursor-tracking 3D tilt (CSS transforms, no WebGL). The element
 * leans up to ~3.5deg toward the pointer and eases back on leave.
 * Skipped entirely under `prefers-reduced-motion`.
 */
@Directive({
  selector: '[appTilt]',
  standalone: true,
})
export class TiltDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private zone = inject(NgZone);
  private enabled = false;

  private onMove = (e: PointerEvent): void => {
    const node = this.el.nativeElement;
    const rect = node.getBoundingClientRect();
    const dx = (e.clientX - rect.left) / rect.width - 0.5;
    const dy = (e.clientY - rect.top) / rect.height - 0.5;
    node.style.transform =
      `perspective(950px) rotateX(${(-dy * 3.5).toFixed(2)}deg) rotateY(${(dx * 3.5).toFixed(2)}deg) translateY(-2px)`;
  };

  private onLeave = (): void => {
    this.el.nativeElement.style.transform = '';
  };

  ngOnInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    this.enabled = true;
    const node = this.el.nativeElement;
    node.style.transition =
      'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.32, 0.72, 0, 1)';
    node.style.willChange = 'transform';
    this.zone.runOutsideAngular(() => {
      node.addEventListener('pointermove', this.onMove, { passive: true });
      node.addEventListener('pointerleave', this.onLeave, { passive: true });
    });
  }

  ngOnDestroy(): void {
    if (this.enabled) {
      this.el.nativeElement.removeEventListener('pointermove', this.onMove);
      this.el.nativeElement.removeEventListener('pointerleave', this.onLeave);
    }
  }
}
