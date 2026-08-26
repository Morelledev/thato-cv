import {
  Directive,
  ElementRef,
  Injectable,
  NgZone,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { KhumoService } from '../bot/khumo.service';

/**
 * The bug hunt: once per visit, one random card that the visitor has
 * actually scrolled to grows a little green beetle that crawls along its
 * edge. Clicking it flips the card over to a mini terminal that triages
 * the "bug" and closes it as FALSE ALARM: works as designed. Khumo
 * apologises for filing it.
 *
 * `BugHuntService` picks the card; `appBugHost` marks candidates and owns
 * the flip theatrics for the chosen one. Styles live in styles.scss under
 * "Bug hunt". Global reduced-motion CSS collapses the crawl and flip to
 * instant swaps automatically.
 */

@Injectable({ providedIn: 'root' })
export class BugHuntService {
  private visible = new Set<BugHostDirective>();
  private assigned = false;
  private pickTimer: ReturnType<typeof setTimeout> | null = null;

  reportVisible(host: BugHostDirective): void {
    if (this.assigned) {
      return;
    }
    this.visible.add(host);
    // A few seconds after the first card scrolls into view, one of the
    // currently visible cards gets the bug. Feels found, not staged.
    if (!this.pickTimer) {
      this.pickTimer = setTimeout(() => {
        const pool = [...this.visible];
        if (pool.length > 0 && !this.assigned) {
          this.assigned = true;
          pool[Math.floor(Math.random() * pool.length)].infest();
        }
      }, 3500 + Math.random() * 3500);
    }
  }

  forget(host: BugHostDirective): void {
    this.visible.delete(host);
  }
}

const BUG_SVG = `
<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M10.6 4 9 1.9 M13.4 4 15 1.9" stroke="#3ec46d" stroke-width="1.2" stroke-linecap="round"/>
  <circle cx="12" cy="6.2" r="3" fill="#3ec46d"/>
  <ellipse cx="12" cy="14" rx="5.4" ry="6.4" fill="#3ec46d"/>
  <path d="M12 8.5 V20" stroke="#0a2916" stroke-width="1"/>
  <path d="M7 10.5 3.6 8.4 M6.7 14 3 14 M7.4 17.6 4.4 19.8 M17 10.5 20.4 8.4 M17.3 14 21 14 M16.6 17.6 19.6 19.8"
    stroke="#3ec46d" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;

@Directive({
  selector: '[appBugHost]',
  standalone: true,
})
export class BugHostDirective implements OnInit, OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly service = inject(BugHuntService);
  private readonly khumo = inject(KhumoService);

  private observer?: IntersectionObserver;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private bug?: HTMLButtonElement;
  private back?: HTMLDivElement;

  ngOnInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.service.reportVisible(this);
            this.observer?.disconnect();
          }
        },
        { threshold: 0.5 },
      );
      this.observer.observe(this.el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.service.forget(this);
    this.observer?.disconnect();
    this.timers.forEach(clearTimeout);
    this.bug?.remove();
    this.back?.remove();
  }

  /** Called by the service on the one chosen card. */
  infest(): void {
    const host = this.el.nativeElement;
    const bug = document.createElement('button');
    bug.type = 'button';
    bug.className = 'bug-crawler';
    bug.setAttribute('aria-label', 'A bug is crawling on this card. Click to investigate.');
    bug.innerHTML = BUG_SVG;
    bug.addEventListener('click', () => this.squash(), { once: true });
    host.appendChild(bug);
    this.bug = bug;

    // Khumo spots it and tells the visitor to squash it.
    const section = host.closest('section')?.id ?? '';
    const place =
      section === 'skills'
        ? 'Skills & tooling'
        : section === 'ai-lab'
          ? 'the AI testing lab'
          : section === 'education'
            ? 'Certifications & education'
            : 'that section';
    this.zone.run(() =>
      this.khumo.say(
        `🐛 wait. I see movement on a card in ${place}. Click that bug before it ships to production!`,
      ),
    );
  }

  /** Flip, triage, deliver the punchline, flip back. */
  private squash(): void {
    const host = this.el.nativeElement;
    if (host.dataset['flipping']) {
      return;
    }
    host.dataset['flipping'] = '1';
    this.bug?.remove();
    this.bug = undefined;

    const kids = Array.from(host.children) as HTMLElement[];
    const bugId = `BUG-00${Math.floor(10 + Math.random() * 90)}`;
    const lines: Array<[string, string]> = [
      ['cmd', `$ npx triage ${bugId}`],
      ['info', '> reproducing: hover flicker on card corner'],
      ['info', '> running visual diff: 0px changed'],
      ['ok', '✓ FALSE ALARM: not a bug. It is the design.'],
      ['end', 'ticket closed · works as intended'],
    ];

    // Half-flip out, swap faces, half-flip in: reads as a full card flip
    // without preserve-3d mirroring complications.
    host.style.transition = 'transform 0.22s cubic-bezier(0.55, 0, 1, 0.45)';
    host.style.transform = 'perspective(900px) rotateY(90deg)';

    this.wait(230, () => {
      for (const kid of kids) {
        kid.style.visibility = 'hidden';
      }
      const back = document.createElement('div');
      back.className = 'bug-triage';
      host.appendChild(back);
      this.back = back;

      host.style.transition = 'none';
      host.style.transform = 'perspective(900px) rotateY(-90deg)';
      void host.offsetWidth; // commit the snap before easing back
      host.style.transition = 'transform 0.26s cubic-bezier(0, 0.55, 0.45, 1)';
      host.style.transform = 'perspective(900px) rotateY(0deg)';

      lines.forEach(([kind, text], index) => {
        this.wait(400 + index * 750, () => {
          const line = document.createElement('p');
          line.className = `l ${kind}`;
          line.textContent = text;
          back.appendChild(line);
        });
      });

      // Leave the closed ticket up long enough to actually read it.
      const done = 400 + lines.length * 750;
      this.wait(done + 1200, () => {
        this.zone.run(() =>
          this.khumo.say(`I filed that one. Sorry. Closing as works-as-designed ✓`),
        );
      });
      this.wait(done + 7000, () => this.flipBack(kids));
    });
  }

  private flipBack(kids: HTMLElement[]): void {
    const host = this.el.nativeElement;
    host.style.transition = 'transform 0.22s cubic-bezier(0.55, 0, 1, 0.45)';
    host.style.transform = 'perspective(900px) rotateY(-90deg)';
    this.wait(230, () => {
      this.back?.remove();
      this.back = undefined;
      for (const kid of kids) {
        kid.style.visibility = '';
      }
      host.style.transition = 'none';
      host.style.transform = 'perspective(900px) rotateY(90deg)';
      void host.offsetWidth;
      host.style.transition = 'transform 0.26s cubic-bezier(0, 0.55, 0.45, 1)';
      host.style.transform = 'perspective(900px) rotateY(0deg)';
      this.wait(280, () => {
        host.style.transform = '';
        host.style.transition = '';
        delete host.dataset['flipping'];
      });
    });
  }

  private wait(ms: number, fn: () => void): void {
    this.timers.push(setTimeout(fn, ms));
  }
}
