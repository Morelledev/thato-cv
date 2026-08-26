import { Component } from '@angular/core';
import { AI_CARDS } from '../data/resume.data';
import { BugHostDirective } from '../shared/bug-hunt.directive';
import { Card3dDirective } from '../shared/card3d.directive';
import { RevealDirective } from '../shared/reveal.directive';
import { SpotlightDirective } from '../shared/spotlight.directive';

@Component({
  selector: 'app-ai-lab',
  standalone: true,
  imports: [BugHostDirective, Card3dDirective, RevealDirective, SpotlightDirective],
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
            <article class="card" appReveal appSpotlight appCard3d appBugHost [revealDelay]="(i % 3) * 110">
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
      border-radius: var(--radius-lg);
      padding: 26px;
      overflow: hidden;
      box-shadow: inset 0 1px 0 rgba(232, 240, 247, 0.04);
      transition:
        transform 0.55s var(--ease-spring),
        border-color 0.4s var(--ease-out),
        box-shadow 0.55s var(--ease-spring);

      &:hover {
        border-color: rgba(55, 182, 255, 0.45);
        box-shadow: inset 0 1px 0 rgba(232, 240, 247, 0.04), 0 16px 44px rgba(2, 8, 16, 0.45);

        .trace { transform: scaleX(1); }
        .icon { color: var(--accent); transform: translateY(-2px); }
      }

      .icon {
        font-family: var(--font-mono);
        font-size: 1.5rem;
        color: var(--pass);
        display: block;
        margin-bottom: 16px;
        transition: color 0.3s var(--ease-out), transform 0.45s var(--ease-spring);
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
