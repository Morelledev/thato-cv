import { Component } from '@angular/core';
import { PROFILE } from '../data/resume.data';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RevealDirective],
  template: `
    <section id="about">
      <div class="container">
        <div class="section-head" appReveal>
          <span class="eyebrow">
            describe<span class="punct">(</span><span class="str">'the engineer behind the green checkmarks'</span><span class="punct">)</span>
          </span>
          <h2>About me</h2>
        </div>

        <div class="grid">
          <figure class="portrait" appReveal>
            <div class="frame">
              <img [src]="photo" alt="Portrait of Thato Morelle Kekana" width="250" height="250" />
              <span class="corner tl"></span>
              <span class="corner br"></span>
            </div>
            <figcaption>
              <span class="status"><span class="dot"></span> status: shipping quality</span>
            </figcaption>
          </figure>

          <div class="copy">
            @for (para of summary; track $index) {
              <p appReveal [revealDelay]="$index * 120">{{ para }}</p>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 56px;
      align-items: start;
    }

    .portrait {
      position: sticky;
      top: calc(var(--nav-h) + 32px);
    }

    .frame {
      position: relative;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      padding: 14px;
      background: var(--panel);
      box-shadow: inset 0 1px 0 rgba(232, 240, 247, 0.05), var(--shadow-soft);
      transition: transform 0.6s var(--ease-spring), box-shadow 0.6s var(--ease-spring);

      img {
        display: block;
        width: 100%;
        height: auto;
        border-radius: 8px;
        filter: grayscale(1) contrast(1.05);
        transition: filter 0.5s var(--ease-out), transform 0.8s var(--ease-spring);
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow:
          inset 0 1px 0 rgba(232, 240, 247, 0.05),
          0 30px 70px rgba(2, 6, 12, 0.55),
          0 0 40px rgba(67, 214, 117, 0.08);

        img {
          filter: grayscale(0.35) contrast(1.05);
          transform: scale(1.03);
        }
      }

      .corner {
        position: absolute;
        width: 26px;
        height: 26px;
        border-color: var(--pass);
        border-style: solid;
        border-width: 0;
      }

      .tl {
        top: -1px;
        left: -1px;
        border-top-width: 2px;
        border-left-width: 2px;
        border-top-left-radius: var(--radius-lg);
      }

      .br {
        bottom: -1px;
        right: -1px;
        border-bottom-width: 2px;
        border-right-width: 2px;
        border-bottom-right-radius: var(--radius-lg);
      }
    }

    figcaption {
      margin-top: 14px;
      text-align: center;

      .status {
        font-family: var(--font-mono);
        font-size: 0.75rem;
        color: var(--muted);
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--pass);
        box-shadow: 0 0 10px var(--pass);
        animation: pulse 2s ease-in-out infinite;
      }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.35); opacity: 0.6; }
    }

    .copy p {
      color: #b9c6d4;
      margin-bottom: 20px;
      max-width: 640px;
    }

    @media (max-width: 800px) {
      .grid { grid-template-columns: 1fr; gap: 36px; }
      .portrait {
        position: static;
        max-width: 260px;
        margin-inline: auto;
      }
    }
  `,
})
export class AboutComponent {
  photo = PROFILE.photo;
  summary = PROFILE.summary;
}
