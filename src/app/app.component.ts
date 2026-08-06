import { Component } from '@angular/core';
import { NavComponent } from './sections/nav.component';
import { HeroComponent } from './sections/hero.component';
import { StatsComponent } from './sections/stats.component';
import { AboutComponent } from './sections/about.component';
import { SkillsComponent } from './sections/skills.component';
import { AiLabComponent } from './sections/ai-lab.component';
import { ExperienceComponent } from './sections/experience.component';
import { EducationComponent } from './sections/education.component';
import { FooterComponent } from './sections/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavComponent,
    HeroComponent,
    StatsComponent,
    AboutComponent,
    SkillsComponent,
    AiLabComponent,
    ExperienceComponent,
    EducationComponent,
    FooterComponent,
  ],
  template: `
    <app-nav />
    <main>
      <app-hero />
      <app-stats />
      <app-about />
      <app-skills />
      <app-ai-lab />
      <app-experience />
      <app-education />
    </main>
    <app-footer />
  `,
})
export class AppComponent {}
