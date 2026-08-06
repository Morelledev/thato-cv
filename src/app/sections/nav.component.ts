import { Component, HostListener, signal } from '@angular/core';
import { NAV_LINKS, PROFILE } from '../data/resume.data';

@Component({
  selector: 'app-nav',
  standalone: true,
  template: `
    <div class="progress" [style.width.%]="progress()"></div>
    <header class="nav" [class.scrolled]="scrolled()">
      <div class="container nav-inner">
        <a class="logo" (click)="scrollTo('top')">
          <span class="prompt">~$</span> thato.kekana
          <span class="cursor">▊</span>
        </a>

        <nav class="links" [class.open]="menuOpen()">
          @for (link of links; track link.id) {
            <a (click)="scrollTo(link.id)">{{ link.label }}</a>
          }
          <a class="cv-link" [href]="cv" download>
            <span aria-hidden="true">⇩</span> download_cv
          </a>
        </nav>

        <button
          class="burger"
          type="button"
          aria-label="Toggle menu"
          [attr.aria-expanded]="menuOpen()"
          (click)="menuOpen.set(!menuOpen())"
        >
          {{ menuOpen() ? '✕' : '☰' }}
        </button>
      </div>
    </header>
  `,
  styles: `
    .progress {
      position: fixed;
      top: 0;
      left: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--pass), var(--accent));
      z-index: 120;
      transition: width 0.1s linear;
    }

    .nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--nav-h);
      z-index: 110;
      border-bottom: 1px solid transparent;
      transition: background 0.3s ease, border-color 0.3s ease;
    }

    .nav.scrolled {
      background: rgba(10, 15, 22, 0.82);
      backdrop-filter: blur(12px);
      border-bottom-color: var(--line);
    }

    .nav-inner {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: 1rem;
      color: var(--ink);
      cursor: pointer;

      .prompt { color: var(--pass); }
      .cursor {
        color: var(--pass);
        animation: blink 1.1s steps(1) infinite;
      }
    }

    @keyframes blink { 50% { opacity: 0; } }

    .links {
      display: flex;
      align-items: center;
      gap: 26px;

      a {
        font-family: var(--font-mono);
        font-size: 0.82rem;
        color: var(--muted);
        cursor: pointer;
        transition: color 0.2s ease;
        &:hover { color: var(--pass); }
      }

      .cv-link {
        color: var(--pass);
        border: 1px solid rgba(67, 214, 117, 0.4);
        padding: 7px 14px;
        border-radius: 8px;
        transition: background 0.2s ease, box-shadow 0.2s ease;
        &:hover {
          background: var(--pass-dim);
          box-shadow: 0 0 18px rgba(67, 214, 117, 0.25);
        }
      }
    }

    .burger {
      display: none;
      background: none;
      border: 1px solid var(--line);
      border-radius: 8px;
      color: var(--ink);
      font-size: 1.1rem;
      width: 42px;
      height: 42px;
      cursor: pointer;
    }

    @media (max-width: 880px) {
      .burger { display: block; }

      .links {
        position: fixed;
        top: var(--nav-h);
        right: 0;
        flex-direction: column;
        align-items: flex-end;
        gap: 20px;
        background: rgba(13, 20, 29, 0.97);
        border: 1px solid var(--line);
        border-right: none;
        border-radius: 0 0 0 var(--radius);
        padding: 26px 28px;
        transform: translateX(110%);
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);

        &.open { transform: none; }
      }
    }
  `,
})
export class NavComponent {
  links = NAV_LINKS;
  cv = PROFILE.cvFile;
  scrolled = signal(false);
  progress = signal(0);
  menuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    const top = window.scrollY;
    this.scrolled.set(top > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    this.progress.set(max > 0 ? (top / max) * 100 : 0);
  }

  scrollTo(id: string): void {
    this.menuOpen.set(false);
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }
}
