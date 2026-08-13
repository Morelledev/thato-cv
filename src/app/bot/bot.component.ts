import {
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { PROFILE } from '../data/resume.data';
import { IDLE_FACTS, SUGGESTIONS, botAnswer } from './bot-brain';

interface ChatMsg {
  from: 'bot' | 'user';
  text: string;
}

/** One quip per section, shown at most once per visit while roaming. */
const QUIPS: Record<string, string> = {
  top: `psst — everything on this page passed on the first run. Honest.`,
  about: `that's the human I work for. 12+ years, zero flaky excuses.`,
  skills: `ask me about Playwright — it's the 95% one.`,
  'ai-lab': `AI agents drive the browser here. I approve, obviously.`,
  experience: `six companies, all green checkmarks. Click me to interrogate.`,
  education: `ISTQB Advanced — that's the deep test-design one.`,
};

/** Cycled while Khumo bounces at the contact section, for as long as the user stays. */
const CONTACT_HYPE = [
  `⚡ this is the part where you hire him.`,
  `📞 ${PROFILE.phone} — he actually answers. Try it!`,
  `✉ ${PROFILE.email} — replies faster than a CI pipeline.`,
  `expect(you.toCallThato()) — still pending…`,
  `the green button → one click → interview. Zero flakes.`,
  `12+ years of green checkmarks, one phone call away.`,
];

@Component({
  selector: 'app-bot',
  standalone: true,
  template: `
    <!-- Roaming mascot -->
    <div
      class="mascot-rail"
      [style.transform]="'translateX(' + tx() + 'px)'"
      [class.walking]="walking()"
      [class.flipped]="flipped()"
      [class.excited]="excited()"
      [class.hidden]="open()"
    >
      @if (quip(); as q) {
        <div class="bubble" (click)="quip.set('')">
          <span class="prompt">&gt;</span> {{ q }}
        </div>
      }

      <button
        class="mascot"
        type="button"
        aria-label="Chat with Khumo"
        (click)="toggle()"
      >
        <svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
          <!-- antenna -->
          <line class="antenna" x1="32" y1="10" x2="32" y2="18" />
          <circle class="antenna-tip" cx="32" cy="8" r="3" />
          <!-- head -->
          <rect class="head" x="10" y="18" width="44" height="34" rx="10" />
          <!-- screen face -->
          <rect class="screen" x="16" y="24" width="32" height="22" rx="6" />
          <!-- eyes: terminal cursor blocks -->
          <rect class="eye" x="23" y="30" width="5" height="9" rx="1" />
          <rect class="eye" x="36" y="30" width="5" height="9" rx="1" />
          <!-- smile -->
          <path class="smile" d="M27 42 q5 3.4 10 0" />
          <!-- feet -->
          <rect class="foot" x="19" y="52" width="9" height="5" rx="2.5" />
          <rect class="foot" x="36" y="52" width="9" height="5" rx="2.5" />
        </svg>
      </button>
    </div>

    <!-- Chat panel -->
    @if (open()) {
      <div class="chat" role="dialog" aria-label="Chat with Khumo">
        <div class="chat-bar">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
          <span class="chat-title">khumo · scripted · v1.0</span>
          <button class="close" type="button" aria-label="Close chat" (click)="toggle()">✕</button>
        </div>

        <div class="chat-body" #body>
          @for (msg of messages(); track $index) {
            <div class="msg" [class.user]="msg.from === 'user'">
              @if (msg.from === 'bot') {
                <span class="who">khumo&gt;</span>
              }
              <span class="text">{{ msg.text }}</span>
            </div>
          }
          @if (thinking()) {
            <div class="msg">
              <span class="who">khumo&gt;</span>
              <span class="dots"><i></i><i></i><i></i></span>
            </div>
          }
        </div>

        @if (showChips()) {
          <div class="chips">
            @for (s of suggestions; track s) {
              <button class="chip" type="button" (click)="send(s)">{{ s }}</button>
            }
          </div>
        }

        <form class="chat-input" (submit)="submit($event, input)">
          <span class="prompt">$</span>
          <input
            #input
            type="text"
            placeholder="ask about Thato or testing…"
            autocomplete="off"
            maxlength="200"
            (keydown.enter)="submit($event, input)"
          />
          <button class="send" type="submit" aria-label="Send message">↵</button>
        </form>
      </div>
    }
  `,
  styles: `
    :host {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 130;
    }

    /* ---------- Mascot ---------- */
    .mascot-rail {
      position: absolute;
      bottom: 14px;
      right: 18px;
      pointer-events: auto;
      transition: transform 2.6s var(--ease-spring), opacity 0.3s var(--ease-out);

      &.hidden { opacity: 0; pointer-events: none; }
    }

    .mascot {
      display: block;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      filter: drop-shadow(0 10px 24px rgba(2, 6, 12, 0.6));
      transition: transform 0.45s var(--ease-spring);
      animation: breathe 4.2s ease-in-out infinite;

      &:hover {
        transform: translateY(-4px) scale(1.06);
        animation-play-state: paused;
      }
      &:active { transform: scale(0.94); }
    }

    .walking .mascot {
      animation: bob 0.5s ease-in-out infinite;
    }

    .flipped .mascot svg { transform: scaleX(-1); }

    @keyframes breathe {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-2px) scale(1.015); }
    }

    @keyframes bob {
      0%, 100% { transform: translateY(0) rotate(-2deg); }
      50% { transform: translateY(-5px) rotate(2deg); }
    }

    /* Contact-section hype: a proper squash-and-stretch bounce */
    .excited .mascot {
      animation: excite 0.55s cubic-bezier(0.32, 0.72, 0, 1) infinite;
    }

    @keyframes excite {
      0%, 100% { transform: translateY(0) scale(1, 1); }
      30% { transform: translateY(-16px) scale(0.97, 1.05); }
      55% { transform: translateY(-2px) scale(1, 1); }
      70% { transform: translateY(0) scale(1.07, 0.9); }
      85% { transform: translateY(0) scale(0.99, 1.02); }
    }

    svg {
      display: block;
      transition: transform 0.3s var(--ease-out);
    }

    .head {
      fill: var(--panel-2);
      stroke: var(--line-bright);
      stroke-width: 1.5;
    }

    .screen {
      fill: #0a1017;
      stroke: var(--line);
      stroke-width: 1;
    }

    .eye {
      fill: var(--pass);
      animation: blink-eyes 4.6s infinite;
      transform-origin: center;
      transform-box: fill-box;
    }

    @keyframes blink-eyes {
      0%, 92%, 100% { transform: scaleY(1); }
      95%, 97% { transform: scaleY(0.12); }
    }

    .smile {
      fill: none;
      stroke: var(--pass);
      stroke-width: 1.6;
      stroke-linecap: round;
    }

    .antenna {
      stroke: var(--muted);
      stroke-width: 1.6;
    }

    .antenna-tip {
      fill: var(--pass);
      animation: tip-pulse 2.2s ease-in-out infinite;
    }

    @keyframes tip-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.35; }
    }

    .foot {
      fill: var(--line-bright);
    }

    /* ---------- Quip bubble ---------- */
    .bubble {
      position: absolute;
      bottom: calc(100% + 10px);
      right: 0;
      width: max-content;
      max-width: min(280px, 74vw);
      background: rgba(16, 24, 35, 0.95);
      border: 1px solid var(--line-bright);
      border-radius: 12px 12px 2px 12px;
      padding: 10px 14px;
      font-family: var(--font-mono);
      font-size: 0.74rem;
      line-height: 1.5;
      color: var(--ink);
      cursor: pointer;
      box-shadow: var(--shadow-soft);
      animation: bubble-in 0.5s var(--ease-spring) both;

      .prompt { color: var(--pass); }
    }

    @keyframes bubble-in {
      from { opacity: 0; transform: translateY(8px) scale(0.9); }
      to { opacity: 1; transform: none; }
    }

    /* ---------- Chat panel ---------- */
    .chat {
      position: absolute;
      bottom: 16px;
      right: 18px;
      width: min(370px, calc(100vw - 32px));
      max-height: min(560px, calc(100dvh - 96px));
      display: flex;
      flex-direction: column;
      pointer-events: auto;
      background: rgba(13, 20, 30, 0.97);
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-deep), 0 0 0 1px rgba(67, 214, 117, 0.06);
      overflow: hidden;
      animation: chat-in 0.55s var(--ease-spring) both;
    }

    @keyframes chat-in {
      from { opacity: 0; transform: translateY(24px) scale(0.96); }
      to { opacity: 1; transform: none; }
    }

    .chat-bar {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 12px 14px;
      background: var(--panel-2);
      border-bottom: 1px solid var(--line);
      flex-shrink: 0;

      .dot {
        width: 11px;
        height: 11px;
        border-radius: 50%;
        &.red { background: var(--fail); }
        &.yellow { background: var(--warn); }
        &.green { background: var(--pass); }
      }

      .chat-title {
        font-family: var(--font-mono);
        font-size: 0.72rem;
        color: var(--muted);
        margin-left: 8px;
      }

      .close {
        margin-left: auto;
        background: none;
        border: none;
        color: var(--muted);
        font-size: 0.9rem;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 6px;
        transition: color 0.2s var(--ease-out), background 0.2s var(--ease-out);

        &:hover { color: var(--ink); background: rgba(232, 240, 247, 0.06); }
      }
    }

    .chat-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 16px 8px;
      font-family: var(--font-mono);
      font-size: 0.8rem;
      line-height: 1.7;
      min-height: 180px;

      &::-webkit-scrollbar { width: 6px; }
      &::-webkit-scrollbar-thumb { background: var(--line); border-radius: 4px; }
    }

    .msg {
      margin-bottom: 12px;
      display: flex;
      gap: 8px;
      animation: msg-in 0.4s var(--ease-out) both;

      .who {
        color: var(--pass);
        flex-shrink: 0;
      }

      .text {
        color: #c4d1de;
        white-space: pre-wrap;
        word-break: break-word;
      }

      &.user {
        justify-content: flex-end;

        .text {
          background: rgba(55, 182, 255, 0.1);
          border: 1px solid rgba(55, 182, 255, 0.25);
          color: var(--ink);
          border-radius: 10px 10px 2px 10px;
          padding: 6px 12px;
          max-width: 85%;
        }
      }
    }

    @keyframes msg-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: none; }
    }

    .dots {
      display: inline-flex;
      gap: 4px;
      align-items: center;
      height: 1.2em;

      i {
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--muted);
        animation: dot-wave 1.1s ease-in-out infinite;

        &:nth-child(2) { animation-delay: 0.15s; }
        &:nth-child(3) { animation-delay: 0.3s; }
      }
    }

    @keyframes dot-wave {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-4px); opacity: 1; }
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      padding: 4px 14px 12px;
      flex-shrink: 0;
    }

    .chip {
      font-family: var(--font-mono);
      font-size: 0.68rem;
      color: var(--muted);
      background: rgba(16, 24, 35, 0.6);
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 5px 11px;
      cursor: pointer;
      transition:
        color 0.25s var(--ease-out),
        border-color 0.25s var(--ease-out),
        transform 0.4s var(--ease-spring);

      &:hover {
        color: var(--pass);
        border-color: rgba(67, 214, 117, 0.4);
        transform: translateY(-1px);
      }
    }

    .chat-input {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 11px 14px;
      border-top: 1px solid var(--line);
      background: var(--panel);
      flex-shrink: 0;

      .prompt {
        font-family: var(--font-mono);
        color: var(--pass);
        font-size: 0.85rem;
      }

      input {
        flex: 1;
        background: none;
        border: none;
        outline: none;
        color: var(--ink);
        font-family: var(--font-mono);
        font-size: 0.8rem;

        &::placeholder { color: var(--muted); opacity: 0.7; }
      }

      .send {
        background: var(--pass-dim);
        border: 1px solid rgba(67, 214, 117, 0.35);
        color: var(--pass);
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 0.85rem;
        flex-shrink: 0;
        transition: background 0.25s var(--ease-out), transform 0.4s var(--ease-spring);

        &:hover { background: rgba(67, 214, 117, 0.22); }
        &:active { transform: scale(0.9); }
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .mascot { animation: none; }
      .eye { animation: none; }
      .antenna-tip { animation: none; }
      .walking .mascot { animation: none; }
      .excited .mascot { animation: none; }
    }
  `,
})
export class BotComponent implements OnInit, OnDestroy {
  tx = signal(0);
  walking = signal(false);
  flipped = signal(false);
  excited = signal(false);
  quip = signal('');
  open = signal(false);
  messages = signal<ChatMsg[]>([]);
  thinking = signal(false);
  showChips = signal(true);
  suggestions = SUGGESTIONS;

  @ViewChild('body') private body?: ElementRef<HTMLElement>;

  private zone = inject(NgZone);
  private timers: ReturnType<typeof setTimeout>[] = [];
  private wanderTimer?: ReturnType<typeof setTimeout>;
  private quipTimer?: ReturnType<typeof setTimeout>;
  private chatterTimer?: ReturnType<typeof setTimeout>;
  private seenQuips = new Set<string>();
  private lastSection = '';
  private reduced = false;
  private greeted = false;
  private factOrder = [...IDLE_FACTS].sort(() => Math.random() - 0.5);
  private factIdx = 0;
  private hypeIdx = 0;

  ngOnInit(): void {
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!this.reduced) {
      this.zone.runOutsideAngular(() => this.scheduleWander());
    }
    this.zone.runOutsideAngular(() => this.scheduleChatter(9000));
  }

  ngOnDestroy(): void {
    this.timers.forEach(clearTimeout);
    clearTimeout(this.wanderTimer);
    clearTimeout(this.quipTimer);
    clearTimeout(this.chatterTimer);
  }

  /* ---------- Idle chatter ---------- */

  /** While nobody interacts with Khumo, he shares a random fact now and then. */
  private scheduleChatter(delay: number): void {
    this.chatterTimer = setTimeout(() => {
      const idle =
        !this.open() &&
        !this.walking() &&
        !this.quip() &&
        !document.hidden &&
        window.innerWidth > 640;

      if (idle) {
        const fact = this.factOrder[this.factIdx % this.factOrder.length];
        this.factIdx++;
        this.zone.run(() => this.quip.set(fact));
        clearTimeout(this.quipTimer);
        this.quipTimer = setTimeout(() => this.zone.run(() => this.quip.set('')), 9000);
      }
      this.scheduleChatter(17000 + Math.random() * 13000);
    }, delay);
  }

  /* ---------- Roaming ---------- */

  private scheduleWander(): void {
    this.wanderTimer = setTimeout(() => {
      if (!this.open() && !this.excited() && window.innerWidth > 880) {
        this.wander();
      }
      this.scheduleWander();
    }, 16000 + Math.random() * 18000);
  }

  private wander(): void {
    // 40% of trips head home; otherwise pick a random spot along the bottom.
    const goHome = Math.random() < 0.4 || this.tx() !== 0;
    const range = Math.min(window.innerWidth - 140, 900);
    const target = goHome ? 0 : -Math.round(80 + Math.random() * (range - 80));

    this.zone.run(() => {
      this.quip.set('');
      this.flipped.set(target < this.tx());
      this.walking.set(true);
      this.tx.set(target);
    });

    this.timers.push(
      setTimeout(() => {
        this.zone.run(() => {
          this.walking.set(false);
          this.flipped.set(false);
        });
      }, 2600),
    );
  }

  /* ---------- Section quips ---------- */

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.open()) {
      return;
    }
    const ids = [...Object.keys(QUIPS), 'contact'];
    let current = 'top';
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.5) {
        current = id;
      }
    }
    if (current !== this.lastSection) {
      const leftContact = this.lastSection === 'contact';
      this.lastSection = current;

      if (current === 'contact') {
        this.excite();
        return;
      }
      if (leftContact) {
        this.calm();
      }
      if (!this.seenQuips.has(current) && window.innerWidth > 640) {
        this.seenQuips.add(current);
        this.quip.set(QUIPS[current]);
        clearTimeout(this.quipTimer);
        this.quipTimer = setTimeout(() => this.zone.run(() => this.quip.set('')), 7000);
      }
    }
  }

  /**
   * Contact-section hype: Khumo bounces and cycles the hype messages for
   * as long as the user stays in the section. Calms on leaving or when
   * the chat opens.
   */
  private excite(): void {
    this.excited.set(true);
    this.hypeIdx = 0;
    this.cycleHype();
  }

  private cycleHype(): void {
    if (!this.excited()) {
      return;
    }
    this.quip.set(CONTACT_HYPE[this.hypeIdx % CONTACT_HYPE.length]);
    this.hypeIdx++;
    clearTimeout(this.quipTimer);
    this.quipTimer = setTimeout(() => this.zone.run(() => this.cycleHype()), 5200);
  }

  private calm(): void {
    this.excited.set(false);
    clearTimeout(this.quipTimer);
    if (CONTACT_HYPE.includes(this.quip())) {
      this.quip.set('');
    }
  }

  /* ---------- Chat ---------- */

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.open.set(false);
    }
  }

  toggle(): void {
    this.open.update((v) => !v);
    if (!this.open()) {
      // Re-arm section detection so hype/quips can re-trigger after closing.
      this.lastSection = '';
      return;
    }
    if (this.open()) {
      this.calm();
      this.quip.set('');
      this.tx.set(0);
      if (!this.greeted) {
        this.greeted = true;
        this.reply(
          `Hey, I'm Khumo — Thato's scripted QA sidekick. ` +
            `Ask me about his experience, skills or anything software-testing. ` +
            `Try a suggestion below, or type "help".`,
        );
      }
    }
  }

  submit(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    this.send(input.value);
    input.value = '';
    input.focus();
  }

  send(text: string): void {
    const clean = text.trim();
    if (!clean || this.thinking()) {
      return;
    }
    this.showChips.set(false);
    this.messages.update((m) => [...m, { from: 'user', text: clean }]);
    this.scrollDown();
    this.reply(botAnswer(clean));
  }

  /** Shows the typing indicator briefly, then types the answer out. */
  private reply(answer: string): void {
    this.thinking.set(true);
    this.scrollDown();

    const delay = this.reduced ? 60 : 500 + Math.random() * 400;
    this.timers.push(
      setTimeout(() => {
        this.thinking.set(false);
        let index = 0;
        this.messages.update((m) => {
          index = m.length;
          return [...m, { from: 'bot', text: this.reduced ? answer : '' }];
        });
        if (this.reduced) {
          this.scrollDown();
          return;
        }
        this.zone.runOutsideAngular(() => this.typeOut(answer, index));
      }, delay),
    );
  }

  /** Types the answer into the message at `index` in small chunks. */
  private typeOut(full: string, index: number): void {
    const step = Math.max(2, Math.round(full.length / 90));
    let shown = 0;
    const tick = () => {
      shown = Math.min(full.length, shown + step);
      const partial = full.slice(0, shown);
      this.zone.run(() => {
        this.messages.update((m) => {
          const copy = [...m];
          copy[index] = { from: 'bot', text: partial };
          return copy;
        });
      });
      this.scrollDown();
      if (shown < full.length) {
        this.timers.push(setTimeout(tick, 16));
      }
    };
    tick();
  }

  private scrollDown(): void {
    requestAnimationFrame(() => {
      const el = this.body?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }
}
