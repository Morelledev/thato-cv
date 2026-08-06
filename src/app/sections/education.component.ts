import { Component } from '@angular/core';
import { QUALIFICATIONS } from '../data/resume.data';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [RevealDirective],
  template: `
    <section id="education">
      <div class="container">
        <div class="section-head" appReveal>
          <span class="eyebrow">
            describe<span class="punct">(</span><span class="str">'credentials, verified'</span><span class="punct">)</span>
          </span>
          <h2>Certifications & education</h2>
        </div>

        <div class="cards">
          @for (q of quals; track q.title; let i = $index) {
            <article class="card" appReveal [revealDelay]="i * 100">
              <span class="kind" [class.degree]="q.kind === 'degree'">
                {{ q.kind === 'degree' ? '🎓 degree' : '✓ certified' }}
              </span>
              <h3>{{ q.title }}</h3>
              <p>{{ q.institution }}</p>
              <span class="year">{{ q.year }}</span>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 22px;
    }

    .card {
      position: relative;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 26px 24px 22px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: transform 0.3s ease, border-color 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        border-color: rgba(67, 214, 117, 0.4);
      }

      .kind {
        font-family: var(--font-mono);
        font-size: 0.68rem;
        color: var(--pass);
        margin-bottom: 6px;

        &.degree { color: var(--accent); }
      }

      h3 {
        font-size: 0.98rem;
        font-weight: 600;
        line-height: 1.35;
      }

      p {
        font-size: 0.8rem;
        color: var(--muted);
        flex: 1;
      }

      .year {
        font-family: var(--font-mono);
        font-size: 0.74rem;
        color: var(--muted);
        border-top: 1px dashed var(--line);
        padding-top: 12px;
        margin-top: 6px;
      }
    }

    @media (max-width: 960px) {
      .cards { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 560px) {
      .cards { grid-template-columns: 1fr; }
    }
  `,
})
export class EducationComponent {
  quals = QUALIFICATIONS;
}
