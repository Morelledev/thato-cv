import { Component } from '@angular/core';
import { AI_CARDS } from '../data/resume.data';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-ai-lab',
  standalone: true,
  imports: [RevealDirective],
  template: `
    <section id="ai-lab">
      <div class="container">
        <div class="section-head" appReveal>
          <span class="eyebrow">
            describe<span class="punct">(</span><span class="str">'testing, augmented by AI'</span><span class="punct">)</span>
          </span>
          <h2>The AI testing lab</h2>
          <p class="lede">
            I treat AI as a force multiplier for quality engineering, not a
            shortcut. These are the practices I use in production today across
            banking, payments and loyalty platforms.
          </p>
        </div>

        <div class="cards">
          @for (card of cards; track card.title; let i = $index) {
            <article class="card" appReveal [revealDelay]="(i % 3) * 110">
              <span class="icon" aria-hidden="true">{{ card.icon }}</span>
              <h3>{{ card.title }}</h3>
              <p>{{ card.body }}</p>
              <span class="trace" aria-hidden="true"></span>
            </article>
          }
        </div>
      </div>
    </section>
  `,
  styles: `
    .cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 22px;
    }

    .card {
      position: relative;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      padding: 26px;
      overflow: hidden;
      transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        border-color: rgba(55, 182, 255, 0.45);
        box-shadow: 0 16px 44px rgba(0, 0, 0, 0.35);

        .trace { transform: scaleX(1); }
        .icon { color: var(--accent); }
      }

      .icon {
        font-family: var(--font-mono);
        font-size: 1.5rem;
        color: var(--pass);
        display: block;
        margin-bottom: 16px;
        transition: color 0.3s ease;
      }

      h3 {
        font-size: 1.02rem;
        font-weight: 600;
        margin-bottom: 10px;
      }

      p {
        font-size: 0.88rem;
        color: var(--muted);
        line-height: 1.7;
      }

      .trace {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 2px;
        background: linear-gradient(90deg, var(--pass), var(--accent));
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
      }
    }

    @media (max-width: 960px) {
      .cards { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 640px) {
      .cards { grid-template-columns: 1fr; }
    }
  `,
})
export class AiLabComponent {
  cards = AI_CARDS;
}
