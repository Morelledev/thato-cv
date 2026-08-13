import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { PROFILE, TERMINAL_SCRIPT } from '../data/resume.data';

interface TermLine {
  type: string;
  text: string;
  time?: string;
  done: boolean;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  template: `
    <section class="hero" id="top">
      <div class="glow glow-green"></div>
      <div class="glow glow-blue"></div>

      <div class="container hero-grid">
        <div class="intro">
          <p class="eyebrow">// senior test automation engineer</p>
          <h1>
            Thato Morelle<br />
            <span class="accent">Kekana</span>
          </h1>
          <p class="tag">
            I build automation frameworks that catch bugs before your users do,
            using Playwright, TypeScript, CI/CD and AI assisted testing for web,
            API and mobile.
          </p>

          <div class="ctas">
            <a class="btn btn-primary" [href]="cv" download>
              Download CV <span class="ico" aria-hidden="true">⇩</span>
            </a>
            <button class="btn btn-ghost" type="button" (click)="scrollTo('experience')">
              npx view --experience
            </button>
          </div>

          <div class="chips">
            <span class="chip"><span class="dot"></span> {{ location }}</span>
            <span class="chip">ISTQB Advanced certified</span>
            <span class="chip">Open to senior roles</span>
          </div>
        </div>

        <div class="term-shell">
        <div class="term" role="img" aria-label="Terminal running a Playwright test of Thato's career where every test passes">
          <div class="term-bar">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
            <span class="term-title">career.spec.ts · playwright</span>
          </div>
          <div class="term-body">
            @for (line of lines(); track $index) {
              <div class="line" [class]="'t-' + line.type">
                @switch (line.type) {
                  @case ('cmd') {
                    <span class="prompt">$</span> {{ line.text }}
                  }
                  @case ('pass') {
                    <span class="check">✓</span> {{ line.text }}
                    @if (line.done) { <span class="time">({{ line.time }})</span> }
                  }
                  @case ('summary') {
                    <span class="check">✓</span> <strong>{{ line.text }}</strong>
                  }
                  @default {
                    {{ line.text }}
                  }
                }
              </div>
            }
            @if (!finished()) {
              <span class="caret">▊</span>
            }
          </div>
        </div>
        </div>
      </div>

      <button class="scroll-hint" type="button" (click)="scrollTo('about')" aria-label="Scroll to about section">
        <span>scroll</span>
        <span class="arrow">↓</span>
      </button>
    </section>
  `,
  styles: `
    .hero {
      min-height: 100svh;
      display: flex;
      align-items: center;
      padding: calc(var(--nav-h) + 40px) 0 60px;
      overflow: hidden;
    }

    .glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(110px);
      opacity: 0.16;
      pointer-events: none;
      animation: drift 14s ease-in-out infinite alternate;
    }

    .glow-green {
      width: 480px;
      height: 480px;
      background: var(--pass);
      top: -120px;
      right: -80px;
    }

    .glow-blue {
      width: 420px;
      height: 420px;
      background: var(--accent);
      bottom: -140px;
      left: -100px;
      animation-delay: -7s;
      animation-duration: 18s;
    }

    @keyframes drift {
      from { transform: translate(0, 0) scale(1); }
      to { transform: translate(-50px, 36px) scale(1.12); }
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1.05fr 1fr;
      gap: 56px;
      align-items: center;
    }

    .eyebrow {
      font-family: var(--font-mono);
      color: var(--pass);
      margin-bottom: 18px;
      animation: fade-up 0.7s ease both;
    }

    h1 {
      font-size: clamp(2.6rem, 6vw, 4.3rem);
      font-weight: 700;
      letter-spacing: -0.03em;
      animation: fade-up 0.7s ease 0.1s both;

      .accent {
        color: transparent;
        background: linear-gradient(100deg, var(--pass), var(--accent), var(--pass));
        background-size: 220% 100%;
        background-clip: text;
        -webkit-background-clip: text;
        animation: hue-slide 7s ease-in-out infinite alternate;
      }
    }

    .tag {
      color: var(--muted);
      max-width: 480px;
      margin-top: 20px;
      font-size: 1.05rem;
      animation: fade-up 0.7s ease 0.2s both;
    }

    .ctas {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin-top: 32px;
      animation: fade-up 0.7s ease 0.3s both;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 30px;
      animation: fade-up 0.7s ease 0.4s both;
    }

    @keyframes hue-slide {
      from { background-position: 0% 0; }
      to { background-position: 100% 0; }
    }

    .chip {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--muted);
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 6px 14px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 24, 35, 0.4);
      transition:
        border-color 0.3s var(--ease-out),
        color 0.3s var(--ease-out),
        transform 0.45s var(--ease-spring);

      &:hover {
        border-color: var(--line-bright);
        color: var(--ink);
        transform: translateY(-2px);
      }

      .dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--pass);
        box-shadow: 0 0 8px var(--pass);
      }
    }

    /* Terminal — double-bezel: glass plate sitting in a machined tray */
    .term-shell {
      padding: 7px;
      background: rgba(232, 240, 247, 0.03);
      border: 1px solid rgba(232, 240, 247, 0.07);
      border-radius: calc(var(--radius) + 7px);
      box-shadow: var(--shadow-deep);
      animation: term-in 0.8s var(--ease-out) 0.25s both;
      transition: transform 0.6s var(--ease-spring), box-shadow 0.6s var(--ease-spring);

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 40px 90px rgba(2, 6, 12, 0.7), 0 0 40px rgba(67, 214, 117, 0.06);
      }
    }

    .term {
      background: rgba(13, 20, 30, 0.92);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow:
        inset 0 1px 0 rgba(232, 240, 247, 0.06),
        0 0 0 1px rgba(67, 214, 117, 0.05);
      overflow: hidden;
    }

    .term-bar {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 12px 16px;
      background: var(--panel-2);
      border-bottom: 1px solid var(--line);

      .dot {
        width: 11px;
        height: 11px;
        border-radius: 50%;
        &.red { background: #f0616d; }
        &.yellow { background: #e5b84b; }
        &.green { background: #43d675; }
      }

      .term-title {
        font-family: var(--font-mono);
        font-size: 0.72rem;
        color: var(--muted);
        margin-left: 10px;
      }
    }

    .term-body {
      padding: 20px 22px 26px;
      font-family: var(--font-mono);
      font-size: 0.83rem;
      line-height: 1.9;
      min-height: 300px;
    }

    .line {
      white-space: pre-wrap;
      word-break: break-word;

      .prompt { color: var(--accent); }
      .check { color: var(--pass); }
      .time { color: var(--muted); }
    }

    .t-cmd { color: var(--ink); }
    .t-info { color: var(--muted); }
    .t-pass { color: #b9cbdc; }
    .t-summary {
      color: var(--pass);
      margin-top: 2px;

      .check { margin-right: 8px; }
    }

    .caret {
      color: var(--pass);
      animation: blink 0.9s steps(1) infinite;
    }

    @keyframes blink { 50% { opacity: 0; } }

    @keyframes fade-up {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: none; }
    }

    @keyframes term-in {
      from { opacity: 0; transform: translateY(30px) scale(0.97); }
      to { opacity: 1; transform: none; }
    }

    .scroll-hint {
      position: absolute;
      bottom: 22px;
      left: 50%;
      transform: translateX(-50%);
      background: none;
      border: none;
      color: var(--muted);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      cursor: pointer;

      .arrow { animation: bob 1.6s ease-in-out infinite; }
    }

    @keyframes bob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(6px); }
    }

    @media (max-width: 940px) {
      .hero-grid { grid-template-columns: 1fr; gap: 40px; }
      .term-body { min-height: 260px; }
      .scroll-hint { display: none; }
    }
  `,
})
export class HeroComponent implements OnInit, OnDestroy {
  cv = PROFILE.cvFile;
  location = PROFILE.location;

  lines = signal<TermLine[]>([]);
  finished = signal(false);

  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private timers: ReturnType<typeof setTimeout>[] = [];

  ngOnInit(): void {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      this.lines.set(
        TERMINAL_SCRIPT.map((l) => ({ ...l, done: true }) as TermLine),
      );
      this.finished.set(true);
      return;
    }
    this.zone.runOutsideAngular(() => this.playLine(0));
  }

  ngOnDestroy(): void {
    this.timers.forEach(clearTimeout);
  }

  /** Types script lines one after another, char-by-char for the command line. */
  private playLine(index: number): void {
    if (index >= TERMINAL_SCRIPT.length) {
      this.zone.run(() => this.finished.set(true));
      return;
    }

    const spec = TERMINAL_SCRIPT[index];

    if (spec.type === 'cmd') {
      let chars = 0;
      this.zone.run(() =>
        this.lines.update((l) => [...l, { ...spec, text: '', done: false }]),
      );
      const tick = () => {
        chars++;
        const partial = spec.text.slice(0, chars);
        this.zone.run(() => {
          this.lines.update((l) => {
            const copy = [...l];
            copy[copy.length - 1] = { ...spec, text: partial, done: chars >= spec.text.length };
            return copy;
          });
          this.cdr.markForCheck();
        });
        if (chars < spec.text.length) {
          this.timers.push(setTimeout(tick, 24));
        } else {
          this.timers.push(setTimeout(() => this.playLine(index + 1), 500));
        }
      };
      this.timers.push(setTimeout(tick, 500));
      return;
    }

    const delay = spec.type === 'pass' ? 420 : spec.type === 'summary' ? 550 : 260;
    this.timers.push(
      setTimeout(() => {
        this.zone.run(() => {
          this.lines.update((l) => [...l, { ...spec, done: true } as TermLine]);
          this.cdr.markForCheck();
        });
        this.playLine(index + 1);
      }, delay),
    );
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
