import { Directive, ElementRef, NgZone, OnDestroy, OnInit, inject } from '@angular/core';

/**
 * Hover float for cards: the card lifts and tilts up to ~6deg toward the
 * cursor, as if it is about to flip. CSS 3D transforms only.
 *
 * Arms its inline transition lazily on pointerenter so it never fights
 * the scroll-reveal transition that runs when the card first appears.
 * Disabled on touch devices and under `prefers-reduced-motion`. Backs off
 * while the bug-hunt flip owns the element (data-flipping).
 */
@Directive({
  selector: '[appCard3d]',
  standalone: true,
})
export class Card3dDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private enabled = false;

  private onEnter = (): void => {
    const node = this.el.nativeElement;
    if (node.dataset['flipping']) {
      return;
    }
    node.style.transition =
      'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), ' +
      'box-shadow 0.45s var(--ease-spring), border-color 0.3s var(--ease-out)';
    node.style.transitionDelay = '0ms';
  };

  private onMove = (e: PointerEvent): void => {
    const node = this.el.nativeElement;
    if (node.dataset['flipping']) {
      return;
    }
    const rect = node.getBoundingClientRect();
    const dx = (e.clientX - rect.left) / rect.width - 0.5;
    const dy = (e.clientY - rect.top) / rect.height - 0.5;
    node.style.transform =
      `perspective(900px) rotateX(${(-dy * 6).toFixed(2)}deg) ` +
      `rotateY(${(dx * 6).toFixed(2)}deg) translateY(-6px)`;
  };

  private onLeave = (): void => {
    const node = this.el.nativeElement;
    if (node.dataset['flipping']) {
      return;
    }
    node.style.transform = '';
  };

  ngOnInit(): void {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(hover: none)').matches
    ) {
      return;
    }
    this.enabled = true;
    const node = this.el.nativeElement;
    this.zone.runOutsideAngular(() => {
      node.addEventListener('pointerenter', this.onEnter, { passive: true });
      node.addEventListener('pointermove', this.onMove, { passive: true });
      node.addEventListener('pointerleave', this.onLeave, { passive: true });
    });
  }

  ngOnDestroy(): void {
    if (this.enabled) {
      const node = this.el.nativeElement;
      node.removeEventListener('pointerenter', this.onEnter);
      node.removeEventListener('pointermove', this.onMove);
      node.removeEventListener('pointerleave', this.onLeave);
    }
  }
}
