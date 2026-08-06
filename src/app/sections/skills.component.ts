import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { SKILL_GROUPS } from '../data/resume.data';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [RevealDirective],
  template: `
    <section id="skills">
      <div class="container">
        <div class="section-head" appReveal>
          <span class="eyebrow">
            describe<span class="punct">(</span><span class="str">'what I bring to a quality team'</span><span class="punct">)</span>
          </span>
          <h2>Skills & tooling</h2>
          <p class="lede">
            Each meter reflects how much hands on production experience I have
            with the tool, from daily drivers to tools I reach for when the job
            calls for them.
          </p>
        </div>

        <div class="groups">
          @for (group of groups; track group.title; let gi = $index) {
            <article
              class="group"
              [class.featured]="group.featured"
              appReveal
              [revealDelay]="gi * 100"
            >
              <header>
                <span class="icon" aria-hidden="true">{{ group.icon }}</span>
                <h3>{{ group.title }}</h3>
                @if (group.featured) {
                  <span class="badge">core focus</span>
                }
              </header>

              <ul>
                @for (skill of group.skills; track skill.name) {
                  <li>
                    <div class="row">
                      <span class="name">{{ skill.name }}</span>
                      <span class="pct">{{ skill.level }}%</span>
                    </div>
                    <div class="meter">
                      <div
                        class="fill"
                        [class.featured-fill]="group.featured"
                        [style.width.%]="armed() ? skill.level : 0"
                      ></div>
                    </div>
                  </li>
                }
              </ul>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    section { background: var(--bg-soft); }

    .groups {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
    }

    .group {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 28px;
      transition: border-color 0.3s ease, transform 0.3s ease;

      &:hover {
        border-color: #2b3c52;
        transform: translateY(-4px);
      }

      &.featured {
        border-color: rgba(67, 214, 117, 0.35);
        background:
          radial-gradient(circle at top right, rgba(67, 214, 117, 0.07), transparent 60%),
          var(--panel);

        &:hover { border-color: rgba(67, 214, 117, 0.6); }
      }

      header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 22px;

        .icon {
          font-family: var(--font-mono);
          color: var(--pass);
          font-size: 1.1rem;
        }

        h3 {
          font-size: 1.05rem;
          font-weight: 600;
        }

        .badge {
          margin-left: auto;
          font-family: var(--font-mono);
          font-size: 0.66rem;
          color: var(--pass);
          border: 1px solid rgba(67, 214, 117, 0.4);
          border-radius: 999px;
          padding: 3px 10px;
          background: var(--pass-dim);
        }
      }

      ul { list-style: none; }

      li { margin-bottom: 16px; &:last-child { margin-bottom: 0; } }

      .row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 7px;

        .name { font-size: 0.9rem; color: #c4d1de; }

        .pct {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--muted);
        }
      }

      .meter {
        height: 6px;
        background: var(--line);
        border-radius: 4px;
        overflow: hidden;
      }

      .fill {
        height: 100%;
        border-radius: 4px;
        background: linear-gradient(90deg, var(--accent), #6ecbff);
        transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .featured-fill {
        background: linear-gradient(90deg, var(--pass), #7ceba3);
        box-shadow: 0 0 12px rgba(67, 214, 117, 0.4);
      }
    }

    @media (max-width: 800px) {
      .groups { grid-template-columns: 1fr; }
    }
  `,
})
export class SkillsComponent implements AfterViewInit, OnDestroy {
  groups = SKILL_GROUPS;
  armed = signal(false);

  private el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.armed.set(true);
      return;
    }
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.armed.set(true);
          this.observer?.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
