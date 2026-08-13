import { Component } from '@angular/core';
import { PROFILE } from '../data/resume.data';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RevealDirective],
  template: `
    <footer id="contact">
      <div class="container">
        <div class="cta" appReveal>
          <span class="eyebrow">// let's talk quality</span>
          <h2>Ready to raise your team's pass rate?</h2>
          <p>
            If you're looking for a senior automation engineer who builds
            frameworks that last, let's connect.
          </p>

          <div class="actions">
            <a class="btn btn-primary" [href]="'mailto:' + email">
              {{ email }} <span class="ico" aria-hidden="true">✉</span>
            </a>
            <a class="btn btn-ghost" [href]="'tel:' + phoneHref">
              {{ phone }} <span class="ico" aria-hidden="true">☏</span>
            </a>
            <a class="btn btn-ghost" [href]="cv" download>
              Download CV <span class="ico" aria-hidden="true">⇩</span>
            </a>
          </div>

          <p class="loc">
            <span class="dot"></span> {{ location }} · open to remote & hybrid
          </p>
        </div>

        <div class="baseline">
          <span>© {{ year }} {{ name }}</span>
          <span class="mono">// built with Angular and tested, of course</span>
        </div>
      </div>
    </footer>
  `,
  styles: `
    footer {
      border-top: 1px solid var(--line);
      background:
        radial-gradient(ellipse at 50% 0%, rgba(67, 214, 117, 0.06), transparent 55%),
        var(--bg-soft);
      padding: 96px 0 32px;
      position: relative;
      z-index: 1;
    }

    .cta {
      text-align: center;
      max-width: 640px;
      margin-inline: auto;

      .eyebrow {
        font-family: var(--font-mono);
        color: var(--pass);
        font-size: 0.85rem;
        display: block;
        margin-bottom: 12px;
      }

      h2 {
        font-size: clamp(1.7rem, 3.6vw, 2.5rem);
        letter-spacing: -0.02em;
        margin-bottom: 14px;
      }

      p { color: var(--muted); }
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 14px;
      margin-top: 30px;
    }

    .loc {
      margin-top: 28px;
      font-family: var(--font-mono);
      font-size: 0.78rem;
      color: var(--muted);
      display: inline-flex;
      align-items: center;
      gap: 8px;

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--pass);
        box-shadow: 0 0 10px var(--pass);
      }
    }

    .baseline {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      border-top: 1px solid var(--line);
      margin-top: 72px;
      padding-top: 22px;
      font-size: 0.78rem;
      color: var(--muted);

      .mono { font-family: var(--font-mono); }
    }
  `,
})
export class FooterComponent {
  name = PROFILE.name;
  email = PROFILE.email;
  phone = PROFILE.phone;
  phoneHref = '+27' + PROFILE.phone.replace(/\s/g, '').slice(1);
  location = PROFILE.location;
  cv = PROFILE.cvFile;
  year = new Date().getFullYear();
}
