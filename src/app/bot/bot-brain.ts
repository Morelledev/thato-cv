import { JOBS, PROFILE, QUALIFICATIONS, SKILL_GROUPS, STATS } from '../data/resume.data';

/**
 * Scripted brain for thato-bot. Pure keyword/intent matching over the
 * resume data plus a curated bank of software-testing answers — no
 * network calls, works on any static host.
 */

interface Intent {
  /** Keywords/phrases. Multi-word phrases score double when matched. */
  keys: string[];
  answer: () => string;
}

const YEARS = STATS[0].value;
const CURRENT = JOBS[0];
const COMPANIES = [...new Set(JOBS.map((j) => j.company))];

const topSkills = (title: string, take = 4): string =>
  SKILL_GROUPS.find((g) => g.title === title)!
    .skills.slice(0, take)
    .map((s) => `${s.name} (${s.level}%)`)
    .join(', ');

const INTENTS: Intent[] = [
  {
    keys: ['hello', 'hi', 'hey', 'howzit', 'morning', 'afternoon', 'greetings', 'yo'],
    answer: () =>
      `Hey! I'm Khumo — Thato's little QA sidekick. Ask me about his experience, his Playwright framework, AI testing, certifications, or anything software-testing. Type "help" to see what I know.`,
  },
  {
    keys: ['khumo', 'your name', 'who are you', 'what are you'],
    answer: () =>
      `I'm Khumo — Thato's scripted QA sidekick. I live on this site, wander around the bottom of your screen, and answer questions about Thato and software testing. No AI, no cloud, no API bill — just honest if-statements doing their best.`,
  },
  {
    keys: ['help', 'what can you', 'topics', 'menu'],
    answer: () =>
      `I can tell you about:\n· Thato's experience and career\n· Skills — Playwright, Selenium, Appium, API testing\n· AI-assisted testing and the Playwright MCP server\n· Certifications and education\n· How to contact or hire him\n\nI also answer general testing questions — try "how do you fix flaky tests?"`,
  },
  {
    keys: ['who is thato', 'about thato', 'tell me about', 'about him', 'who is'],
    answer: () =>
      `Thato Morelle Kekana is a ${PROFILE.title} from ${PROFILE.location} with ${YEARS}+ years in software testing. He builds automation frameworks that catch bugs before users do — web, API and mobile — and he's deep into AI-assisted testing. Currently at ${CURRENT.company}.`,
  },
  {
    keys: ['experience', 'career', 'work history', 'background', 'journey', 'worked'],
    answer: () =>
      `${YEARS}+ years across banking, payments and insurance: ${COMPANIES.join(', ')}. He's built ${STATS[1].value} automation frameworks from scratch. Right now he's ${CURRENT.role} at ${CURRENT.company} (${CURRENT.period}). Scroll to the Experience section for the full timeline — every entry passes. ✓`,
  },
  {
    keys: ['discovery', 'current role', 'current job', 'right now', 'these days'],
    answer: () =>
      `At ${CURRENT.company} since Jun 2024, Thato develops a scalable Playwright + TypeScript framework reused across teams — end-to-end web journeys with role-based locators, API checks in the same repo, and pipelines in Azure DevOps that run on every pull request. He also tracks pass-rate and flakiness metrics, and coaches junior engineers.`,
  },
  {
    keys: ['playwright vs selenium', 'selenium vs playwright', 'better than selenium', 'compare playwright'],
    answer: () =>
      `Thato has shipped with both — Playwright at 95%, Selenium at 85%. His take: Playwright's auto-waiting, web-first assertions and trace viewer make suites faster and far less flaky, while Selenium still earns its keep on legacy grids and older browser matrices. For greenfield work he reaches for Playwright + TypeScript every time.`,
  },
  {
    keys: ['playwright', 'framework'],
    answer: () =>
      `Playwright is Thato's daily driver (95%). He led development of a Playwright framework focused on clean architecture: token-based auth, data-driven testing, parallel execution, cross-device coverage and visual checks. It runs in Azure DevOps on every PR, publishing HTML reports as pipeline artifacts.`,
  },
  {
    keys: ['selenium', 'webdriver'],
    answer: () =>
      `Solid Selenium WebDriver experience (85%) from years in banking — mostly Java-based frameworks with Cucumber/BDD on top. These days he mainly uses it where an existing estate demands it, and migrates teams toward Playwright where it makes sense.`,
  },
  {
    keys: ['appium', 'mobile testing', 'mobile'],
    answer: () =>
      `Mobile runs deep: at Nedbank he tested WAP, USSD and app suites across Android, iOS, BlackBerry and Windows devices (yes, BlackBerry — ${YEARS}+ years will do that). Today it's Appium (82%) plus device-emulated mobile coverage inside Playwright for responsive web.`,
  },
  {
    keys: ['api testing', 'rest assured', 'karate', 'soapui', 'postman', 'api'],
    answer: () =>
      `API testing is a core layer of his pyramid: REST Assured and Karate (80%), SoapUI and Postman (85%). At BankservAfrica — Africa's largest payments clearing house — API testing was daily bread. In his Playwright framework, API checks live in the same repo as the UI tests.`,
  },
  {
    keys: ['mcp', 'model context protocol', 'agentic', 'ai agent'],
    answer: () =>
      `Thato uses the Playwright MCP server to let AI agents drive real user journeys through a live browser — the agent explores flows, validates behaviour and captures evidence before a single line of test code is committed. It's the "Agentic test execution" card in the AI lab section.`,
  },
  {
    keys: ['ai testing', 'ai assisted', 'ai powered', 'artificial intelligence', 'llm', 'ai'],
    answer: () =>
      `AI is his force multiplier, not a shortcut: AI-assisted test design (92%), failure analysis where traces, screenshots and logs go into AI tooling to separate flaky from broken in minutes, and AI-driven refactoring to keep suites healthy. The AI testing lab section shows all six practices he runs in production.`,
  },
  {
    keys: ['skills', 'stack', 'tools', 'tooling', 'technologies', 'tech'],
    answer: () =>
      `Headline numbers: ${topSkills('Automation & Frameworks', 3)}; ${topSkills('Languages & Data', 2)}; Azure DevOps pipelines (90%). Featured group: AI-powered testing — ${topSkills('AI Powered Testing', 2)}. The Skills section has every meter.`,
  },
  {
    keys: ['typescript', 'java', 'python', 'languages', 'sql'],
    answer: () =>
      `TypeScript (90%) is home base — it's what the Playwright framework is written in. Also SQL (85%) for test-data work, Java (80%) from the Selenium years, Python (75%), and Great Expectations for ETL data testing, which he introduced at RMB.`,
  },
  {
    keys: ['certification', 'certified', 'istqb', 'iseb', 'qualifications'],
    answer: () =>
      QUALIFICATIONS.filter((q) => q.kind === 'certification')
        .map((q) => `✓ ${q.title} — ${q.institution}, ${q.year}`)
        .join('\n') + `\n\nThe ISTQB Advanced Test Analyst is the flagship — it's the deep test-design one.`,
  },
  {
    keys: ['education', 'degree', 'study', 'studied', 'university'],
    answer: () =>
      `BSc Computer Systems from CTI (2014), plus three testing certifications: ISTQB Foundation, ISEB Intermediate and ISTQB Advanced Test Analyst.`,
  },
  {
    keys: ['contact', 'email', 'phone', 'reach', 'hire', 'hiring', 'get in touch', 'talk to'],
    answer: () =>
      `Easiest ways:\n· Email: ${PROFILE.email}\n· Phone: ${PROFILE.phone}\n\nOr hit the big green button in the footer — it opens a mail draft for you. He responds like a well-tuned pipeline: quickly and without flaking.`,
  },
  {
    keys: ['location', 'where', 'based', 'johannesburg', 'south africa', 'remote', 'relocate'],
    answer: () =>
      `${PROFILE.location}, South Africa — and open to remote and hybrid roles.`,
  },
  {
    keys: ['cv', 'resume', 'download', 'pdf'],
    answer: () =>
      `The Download CV button in the hero (or footer) grabs the PDF — same content as this site, minus me. I'd say the site version is better company.`,
  },
  {
    keys: ['available', 'availability', 'open to work', 'looking', 'notice period'],
    answer: () =>
      `He's open to senior test automation roles — remote, hybrid or Johannesburg-based. For specifics like start dates, email ${PROFILE.email} directly.`,
  },
  {
    keys: ['salary', 'rate', 'cost', 'charge', 'pay'],
    answer: () =>
      `That negotiation is above my pay grade (I work for free). Email ${PROFILE.email} and talk to the human.`,
  },
  {
    keys: ['flaky', 'flakiness', 'intermittent', 'unstable tests'],
    answer: () =>
      `Thato's flaky-test playbook: kill hard waits and use web-first assertions with auto-waiting; prefer stable role-based locators over brittle CSS/XPath; isolate test data so runs never share state; run tests in parallel early so ordering bugs surface fast; and track a flakiness metric so regressions in stability are treated like defects. If a test can't be trusted, it's worse than no test.`,
  },
  {
    keys: ['visual regression', 'screenshot testing', 'pixel'],
    answer: () =>
      `He maintains pixel-diff baselines across devices and viewports so UI drift is caught the moment it appears — including device-emulated mobile coverage. The trick is keeping baselines fresh and masking genuinely dynamic regions instead of raising the diff threshold until the test is blind.`,
  },
  {
    keys: ['bdd', 'cucumber', 'gherkin'],
    answer: () =>
      `He built a BDD framework from scratch at Stellr with Cucumber (85%). His view: BDD shines when the Gherkin is a real conversation with the business — and turns into expensive wallpaper when it's just test scripts wearing a costume. Use it where collaboration actually happens.`,
  },
  {
    keys: ['ci', 'cd', 'pipeline', 'azure devops', 'devops', 'continuous'],
    answer: () =>
      `Azure DevOps pipelines (90%): tests run on every pull request plus a daily schedule, with Playwright HTML reports published as artifacts. His rule — if the suite isn't in the pipeline, it doesn't exist. Fast feedback beats big nightly bangs.`,
  },
  {
    keys: ['what is istqb', 'istqb worth', 'should i get istqb'],
    answer: () =>
      `ISTQB is the international software testing certification scheme — Foundation covers the vocabulary and fundamentals, Advanced goes deep on test design and analysis. Thato holds Foundation and Advanced Test Analyst. Worth it? The credential opens doors; the test-design techniques are the part you actually use.`,
  },
  {
    keys: ['start automation', 'learn testing', 'become a tester', 'get into testing', 'advice', 'junior'],
    answer: () =>
      `Thato mentors juniors on exactly this. Short version: learn one language properly (TypeScript is a great pick), automate a real app not a demo, put your tests in a CI pipeline from day one, and learn to debug — reading a trace beats re-running and praying. Testing is engineering; treat it that way.`,
  },
  {
    keys: ['etl', 'data testing', 'great expectations'],
    answer: () =>
      `At RMB he identified and implemented Great Expectations as the ETL data-testing tool — declarative expectations over data-heavy platforms, so bad data gets caught at the pipeline, not in production dashboards.`,
  },
  {
    keys: ['joke', 'funny', 'laugh'],
    answer: () =>
      `A QA engineer walks into a bar. Orders a beer. Orders 0 beers. Orders 99999999 beers. Orders a lizard. Orders -1 beers. Orders a "'; DROP TABLE beers;--".\n\nFirst real customer walks in and asks where the bathroom is. The bar bursts into flames.`,
  },
  {
    keys: ['thanks', 'thank you', 'cheers', 'great', 'awesome', 'cool'],
    answer: () => `Anytime. ✓ 1 passed — that's how I like my conversations.`,
  },
  {
    keys: ['bye', 'goodbye', 'later', 'see you'],
    answer: () =>
      `Cheers! If anything else comes up, I'll be here — idling at 0% CPU. And if you want the human: ${PROFILE.email}.`,
  },
];

const FALLBACKS = [
  `Hmm, that one's outside my test coverage. Try "help" for what I know, or email the human directly: ${PROFILE.email}.`,
  `✗ 1 failed — no matching answer found. I'm a scripted bot, not a mind reader (yet). Type "help" to see my topics, or ask Thato himself: ${PROFILE.email}.`,
  `That question threw a TimeoutError in my tiny brain. I'm best on Thato's experience, skills and testing topics — or email ${PROFILE.email} for anything deeper.`,
];

let fallbackIdx = 0;

/**
 * Idle chatter: shown one at a time in Khumo's speech bubble when nobody
 * is interacting with him. Mix of testing lore, site trivia and Thato facts.
 */
export const IDLE_FACTS: string[] = [
  `psst — the first computer "bug" was a real moth. Grace Hopper's team taped it into the logbook in 1947.`,
  `the hero terminal up top replays Thato's career as a Playwright run. 6 passed, 0 flaky.`,
  `Thato has tested apps on BlackBerry AND Windows phones. He has seen things.`,
  `NASA's Space Shuttle software shipped with roughly one bug per 420,000 lines. Testing works.`,
  `Thato helped build the automation framework for Africa's largest payments clearing house.`,
  `"it works on my machine" is an incident report, not a defence.`,
  `one integer overflow blew up the Ariane 5 rocket — a $370 million bug. Test your edge cases.`,
  `my eyes are terminal cursors. Blink twice if you've ever trusted a sleep(5000).`,
  `the Y2K bug cost about $300 billion to fix. Testers saw it coming decades early.`,
  `every meter in the Skills section is real production experience. No vibes-based percentages.`,
  `a good test fails for exactly one reason. A great tester knows which one.`,
  `Playwright auto-waits, so nobody has to write hard waits ever again. Thato enforces this.`,
  `12+ years, 7 companies, 3 frameworks built from scratch. The man collects green checkmarks.`,
  `this site is hand-built Angular and CSS. No template. I checked — I live here.`,
  `100% pass rate with zero assertions is 100% useless. Assert something.`,
  `Thato introduced Great Expectations at RMB — yes, even the data gets tested.`,
  `I'm scripted, not AI. Cheaper, faster, and I never hallucinate. Mostly.`,
  `AI agents drive real browsers in Thato's testing lab. I supervise. From down here.`,
  `Johannesburg-based, remote-friendly. Quality ships in every timezone.`,
  `click me — I answer questions. It's literally my whole job.`,
];

/** Suggested questions surfaced as chips in the chat UI. */
export const SUGGESTIONS = [
  'What does Thato do at Discovery?',
  'How does he use AI in testing?',
  'How do you fix flaky tests?',
  'How do I contact him?',
];

export function botAnswer(raw: string): string {
  const input = ` ${raw.toLowerCase().replace(/[^a-z0-9\s/+-]/g, ' ').replace(/\s+/g, ' ').trim()} `;
  if (input.trim().length === 0) {
    return `Silence… the one input I have no assertion for. Ask me something!`;
  }

  let best: Intent | undefined;
  let bestScore = 0;

  for (const intent of INTENTS) {
    let score = 0;
    for (const key of intent.keys) {
      // Short keys (hi, ai, cv, api…) need word boundaries so "chair"
      // doesn't match "ai"; longer keys match as prefixes, which covers
      // plurals and stems ("certifications" → "certification").
      const hit =
        key.length < 4 && !key.includes(' ')
          ? input.includes(` ${key} `)
          : input.includes(key);
      if (hit) {
        score += key.includes(' ') ? 2 : 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  if (best) {
    return best.answer();
  }
  const fb = FALLBACKS[fallbackIdx % FALLBACKS.length];
  fallbackIdx++;
  return fb;
}
