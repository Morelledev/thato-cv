import { Directive, ElementRef, NgZone, OnDestroy, OnInit, inject } from '@angular/core';

/**
 * Adds the `.spot` class and tracks the cursor with --mx/--my custom
 * properties so the card's radial spotlight follows the pointer.
 * Runs outside Angular — pointermove never triggers change detection.
 */
@Directive({
  selector: '[appSpotlight]',
  standalone: true,
})
export class SpotlightDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private zone = inject(NgZone);
  private onMove = (e: PointerEvent): void => {
    const rect = this.el.nativeElement.getBoundingClientRect();
    this.el.nativeElement.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    this.el.nativeElement.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  ngOnInit(): void {
    const node = this.el.nativeElement;
    node.classList.add('spot');
    this.zone.runOutsideAngular(() =>
      node.addEventListener('pointermove', this.onMove, { passive: true }),
    );
  }

  ngOnDestroy(): void {
    this.el.nativeElement.removeEventListener('pointermove', this.onMove);
  }
}
