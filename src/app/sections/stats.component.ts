import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { STATS } from '../data/resume.data';

@Component({
  selector: 'app-stats',
  standalone: true,
  template: `
    <div class="strip">
      <div class="container grid">
        @for (stat of stats; track stat.label; let i = $index) {
          <div class="stat">
            <span class="value">{{ display()[i] }}<span class="suffix">{{ stat.suffix }}</span></span>
            <span class="label">{{ stat.label }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .strip {
      border-block: 1px solid var(--line);
      background:
        radial-gradient(ellipse at 50% 120%, rgba(67, 214, 117, 0.05), transparent 60%),
        rgba(16, 24, 35, 0.6);
      padding: 48px 0;
      position: relative;
      z-index: 1;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 28px;
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 6px;
      text-align: center;
      transition: transform 0.5s var(--ease-spring);

      &:hover { transform: translateY(-3px); }

      &:not(:first-child) {
        border-left: 1px solid rgba(30, 42, 58, 0.7);
      }
    }

    .value {
      font-family: var(--font-display);
      font-size: clamp(2.2rem, 4.5vw, 3.2rem);
      font-weight: 700;
      color: var(--pass);
      line-height: 1;
      font-variant-numeric: tabular-nums;
      text-shadow: 0 0 32px rgba(67, 214, 117, 0.35);

      .suffix { color: var(--accent); }
    }

    .label {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--muted);
      max-width: 220px;
      margin-inline: auto;
    }

    @media (max-width: 800px) {
      .grid { grid-template-columns: repeat(2, 1fr); }
      .stat:nth-child(3) { border-left: none; }
    }
  `,
})
export class StatsComponent implements AfterViewInit, OnDestroy {
  stats = STATS;
  display = signal<number[]>(STATS.map(() => 0));

  private el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;
  private raf = 0;

  ngAfterViewInit(): void {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      this.display.set(this.stats.map((s) => s.value));
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.observer?.disconnect();
          this.animate();
        }
      },
      { threshold: 0.4 },
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    cancelAnimationFrame(this.raf);
  }

  private animate(): void {
    const duration = 1400;
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const frame = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      this.display.set(this.stats.map((s) => Math.round(s.value * ease(t))));
      if (t < 1) {
        this.raf = requestAnimationFrame(frame);
      }
    };
    this.raf = requestAnimationFrame(frame);
  }
}
