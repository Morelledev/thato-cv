import { Component } from '@angular/core';
import { JOBS } from '../data/resume.data';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [RevealDirective],
  template: `
    <section id="experience">
      <div class="container">
        <div class="section-head" appReveal>
          <span class="eyebrow">
            describe<span class="punct">(</span><span class="str">'12 years of shipping quality'</span><span class="punct">)</span>
          </span>
          <h2>Experience</h2>
        </div>

        <div class="timeline">
          @for (job of jobs; track job.company + job.period; let i = $index) {
            <article class="entry" appReveal [revealDelay]="60">
              <div class="node" [class.current]="job.current"></div>

              <div class="card">
                <header>
                  <div>
                    <h3>{{ job.role }}</h3>
                    <span class="company">{{ job.company }}</span>
                  </div>
                  <span class="period" [class.current]="job.current">{{ job.period }}</span>
                </header>

                <ul class="bullets">
                  @for (bullet of job.bullets; track $index) {
                    <li><span class="check" aria-hidden="true">✓</span>{{ bullet }}</li>
                  }
                </ul>

                <div class="tags">
                  @for (tag of job.tags; track tag) {
                    <span class="tag">{{ tag }}</span>
                  }
                </div>
              </div>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    section { background: var(--bg-soft); }

    .timeline {
      position: relative;
      padding-left: 34px;

      &::before {
        content: '';
        position: absolute;
        left: 8px;
        top: 8px;
        bottom: 8px;
        width: 2px;
        background: linear-gradient(180deg, var(--pass), var(--line) 55%);
      }
    }

    .entry {
      position: relative;
      margin-bottom: 26px;
      &:last-child { margin-bottom: 0; }
    }

    .node {
      position: absolute;
      left: -34px;
      top: 26px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--bg);
      border: 2px solid var(--muted);
      transform: translateX(2px);

      &.current {
        border-color: var(--pass);
        box-shadow: 0 0 14px rgba(67, 214, 117, 0.6);
        animation: node-pulse 2.4s ease-in-out infinite;
      }
    }

    @keyframes node-pulse {
      0%, 100% { box-shadow: 0 0 6px rgba(67, 214, 117, 0.4); }
      50% { box-shadow: 0 0 18px rgba(67, 214, 117, 0.8); }
    }

    .card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 26px 28px;
      transition: border-color 0.3s ease, transform 0.3s ease;

      &:hover {
        border-color: #2b3c52;
        transform: translateX(6px);
      }
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 16px;

      h3 {
        font-size: 1.08rem;
        font-weight: 600;
      }

      .company {
        font-family: var(--font-mono);
        font-size: 0.8rem;
        color: var(--accent);
      }

      .period {
        font-family: var(--font-mono);
        font-size: 0.74rem;
        color: var(--muted);
        border: 1px solid var(--line);
        padding: 5px 12px;
        border-radius: 999px;
        white-space: nowrap;

        &.current {
          color: var(--pass);
          border-color: rgba(67, 214, 117, 0.4);
          background: var(--pass-dim);
        }
      }
    }

    .bullets {
      list-style: none;
      margin-bottom: 18px;

      li {
        display: flex;
        gap: 10px;
        font-size: 0.9rem;
        color: #b9c6d4;
        margin-bottom: 8px;
        &:last-child { margin-bottom: 0; }
      }

      .check {
        color: var(--pass);
        font-family: var(--font-mono);
        flex-shrink: 0;
      }
    }

    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag {
      font-family: var(--font-mono);
      font-size: 0.68rem;
      color: var(--muted);
      background: var(--panel-2);
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 4px 10px;
    }

    @media (max-width: 640px) {
      .timeline { padding-left: 26px; }
      .node { left: -26px; }
      .card { padding: 20px; }
    }
  `,
})
export class ExperienceComponent {
  jobs = JOBS;
}
