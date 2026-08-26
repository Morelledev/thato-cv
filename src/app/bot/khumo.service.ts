import { Injectable, signal } from '@angular/core';

/**
 * Bridges the hero terminal and the mascot: Khumo stays unrendered until
 * the terminal's `npx render AI_Mascot_Khumo` command completes, then the
 * hero summons him into existence.
 */
@Injectable({ providedIn: 'root' })
export class KhumoService {
  private readonly summonedSignal = signal(false);
  readonly summoned = this.summonedSignal.asReadonly();

  private readonly announcementSignal = signal('');
  /** One-shot messages other parts of the site ask Khumo to say. */
  readonly announcement = this.announcementSignal.asReadonly();

  summon(): void {
    this.summonedSignal.set(true);
  }

  say(text: string): void {
    this.announcementSignal.set(text);
  }

  clearAnnouncement(): void {
    this.announcementSignal.set('');
  }
}
