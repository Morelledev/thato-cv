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
            <a
              [class.active]="active() === link.id"
              (click)="scrollTo(link.id)"
            >{{ link.label }}</a>
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
          [class.open]="menuOpen()"
          (click)="menuOpen.set(!menuOpen())"
        >
          <span class="bar"></span>
          <span class="bar"></span>
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
      box-shadow: 0 0 12px rgba(67, 214, 117, 0.5);
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
      transition: background 0.4s var(--ease-out), border-color 0.4s var(--ease-out);
    }

    .nav.scrolled {
      background: rgba(10, 15, 22, 0.72);
      backdrop-filter: blur(18px) saturate(1.5);
      -webkit-backdrop-filter: blur(18px) saturate(1.5);
      border-bottom-color: rgba(30, 42, 58, 0.8);
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
        position: relative;
        font-family: var(--font-mono);
        font-size: 0.82rem;
        color: var(--muted);
        cursor: pointer;
        padding: 4px 0;
        transition: color 0.25s var(--ease-out);

        /* Animated underline, grows from the left */
        &::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -2px;
          height: 1px;
          background: linear-gradient(90deg, var(--pass), var(--accent));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s var(--ease-out);
        }

        &:hover { color: var(--ink); }
        &:hover::after { transform: scaleX(1); }

        &.active {
          color: var(--pass);
          &::after { transform: scaleX(1); }
        }
      }

      .cv-link {
        color: var(--pass);
        border: 1px solid rgba(67, 214, 117, 0.4);
        padding: 7px 16px;
        border-radius: 999px;
        transition:
          background 0.25s var(--ease-out),
          box-shadow 0.45s var(--ease-spring),
          transform 0.45s var(--ease-spring);

        &::after { display: none; }

        &:hover {
          background: var(--pass-dim);
          box-shadow: 0 0 18px rgba(67, 214, 117, 0.25);
          transform: translateY(-1px);
        }

        &:active { transform: scale(0.96); }
      }
    }

    /* Hamburger morphs into an X */
    .burger {
      display: none;
      position: relative;
      background: rgba(16, 24, 35, 0.5);
      border: 1px solid var(--line);
      border-radius: 10px;
      width: 42px;
      height: 42px;
      cursor: pointer;
      transition: border-color 0.3s var(--ease-out);

      &:hover { border-color: var(--line-bright); }

      .bar {
        position: absolute;
        left: 12px;
        right: 12px;
        height: 2px;
        border-radius: 2px;
        background: var(--ink);
        transition: transform 0.45s var(--ease-spring);

        &:nth-child(1) { top: 16px; }
        &:nth-child(2) { bottom: 16px; }
      }

      &.open .bar:nth-child(1) { transform: translateY(4px) rotate(45deg); }
      &.open .bar:nth-child(2) { transform: translateY(-4px) rotate(-45deg); }
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
        background: rgba(13, 20, 29, 0.9);
        backdrop-filter: blur(24px) saturate(1.4);
        -webkit-backdrop-filter: blur(24px) saturate(1.4);
        border: 1px solid var(--line);
        border-right: none;
        border-radius: 0 0 0 var(--radius-lg);
        padding: 28px 30px;
        transform: translateX(110%);
        transition: transform 0.5s var(--ease-spring);

        /* Staggered reveal of each link once the panel is open */
        a {
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 0.4s var(--ease-out),
            transform 0.4s var(--ease-out),
            color 0.25s var(--ease-out);
        }

        &.open {
          transform: none;

          a {
            opacity: 1;
            transform: none;
          }

          @for $i from 1 through 8 {
            a:nth-child(#{$i}) {
              transition-delay: #{60 + $i * 45}ms, #{60 + $i * 45}ms, 0ms;
            }
          }
        }
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
  active = signal('');

  @HostListener('window:scroll')
  onScroll(): void {
    const top = window.scrollY;
    this.scrolled.set(top > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    this.progress.set(max > 0 ? (top / max) * 100 : 0);

    // Scroll-spy: last section whose top has crossed the middle of the viewport
    let current = '';
    for (const link of this.links) {
      const el = document.getElementById(link.id);
      if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.45) {
        current = link.id;
      }
    }
    this.active.set(current);
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
