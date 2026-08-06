export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export interface Skill {
  name: string;
  level: number; // 0 to 100
}

export interface SkillGroup {
  title: string;
  icon: string;
  featured?: boolean;
  skills: Skill[];
}

export interface AiCard {
  icon: string;
  title: string;
  body: string;
}

export interface Job {
  company: string;
  role: string;
  period: string;
  current?: boolean;
  tags: string[];
  bullets: string[];
}

export interface Qualification {
  year: string;
  title: string;
  institution: string;
  kind: 'certification' | 'degree';
}

export const PROFILE = {
  name: 'Thato Morelle Kekana',
  title: 'Senior Test Automation Engineer',
  location: 'Johannesburg, Gauteng',
  phone: '081 455 0345',
  email: 'thato.kekana@yahoo.com',
  cvFile: 'Thato-Morelle-Kekana-CV.pdf',
  photo: 'thato-photo.jpeg',
  summary: [
    `I am a Senior Test Automation Engineer with strong experience building and evolving
     automation frameworks for web, API and mobile applications. I led the development of a
     Playwright based test framework focused on clean test architecture, reuse and long term
     maintainability. That work covers token based authentication, data driven testing,
     parallel execution, cross device coverage and advanced UI and visual checks.`,
    `I build stable, scalable tests that run reliably in CI/CD pipelines on Azure DevOps,
     helping teams release faster with more confidence. Alongside Playwright I have solid
     hands on experience with Selenium, Cucumber, REST Assured and Appium.`,
    `I actively use modern approaches such as the Playwright MCP test server and AI assisted
     testing to improve coverage, speed up test creation and keep automation reliable. I am
     detail focused, analytical, and I enjoy hard testing problems.`,
  ],
};

export const TERMINAL_SCRIPT = [
  { type: 'cmd', text: 'npx playwright test career.spec.ts --project=chromium' },
  { type: 'info', text: 'Running 6 tests using 4 workers' },
  { type: 'blank', text: '' },
  { type: 'pass', text: 'builds scalable Playwright frameworks in TypeScript', time: '1.2s' },
  { type: 'pass', text: 'automates web, API and mobile user journeys', time: '0.9s' },
  { type: 'pass', text: 'ships reliable CI/CD pipelines in Azure DevOps', time: '1.1s' },
  { type: 'pass', text: 'designs tests with AI, MCP and agentic workflows', time: '0.8s' },
  { type: 'pass', text: 'mentors engineers on automation best practice', time: '0.7s' },
  { type: 'pass', text: 'delivers 12+ years of quality across banking and fintech', time: '1.4s' },
  { type: 'blank', text: '' },
  { type: 'summary', text: '6 passed (12.0s)' },
] as const;

export const STATS: Stat[] = [
  { value: 12, suffix: '+', label: 'years in software testing' },
  { value: 3, suffix: '', label: 'automation frameworks built from scratch' },
  { value: 3, suffix: '', label: 'ISTQB and ISEB testing certifications' },
  { value: 7, suffix: '', label: 'companies across banking, payments and insurance' },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    title: 'AI Powered Testing',
    icon: '◈',
    featured: true,
    skills: [
      { name: 'AI assisted test design', level: 92 },
      { name: 'Playwright MCP server', level: 90 },
      { name: 'AI powered failure analysis', level: 88 },
      { name: 'AI driven test improvement', level: 87 },
      { name: 'Agentic test workflows', level: 85 },
    ],
  },
  {
    title: 'Automation & Frameworks',
    icon: '▶',
    skills: [
      { name: 'Playwright', level: 95 },
      { name: 'Selenium WebDriver', level: 85 },
      { name: 'Cucumber / BDD', level: 85 },
      { name: 'Appium (mobile)', level: 82 },
      { name: 'REST Assured / Karate', level: 80 },
      { name: 'SoapUI / Postman', level: 85 },
    ],
  },
  {
    title: 'Languages & Data',
    icon: '{}',
    skills: [
      { name: 'TypeScript', level: 90 },
      { name: 'SQL', level: 85 },
      { name: 'Java', level: 80 },
      { name: 'Python', level: 75 },
      { name: 'Great Expectations (ETL testing)', level: 72 },
    ],
  },
  {
    title: 'CI/CD & Tooling',
    icon: '⚙',
    skills: [
      { name: 'Azure DevOps pipelines', level: 90 },
      { name: 'Git', level: 90 },
      { name: 'Jira & Xray', level: 88 },
      { name: 'Kibana', level: 75 },
      { name: 'Maven / TestNG', level: 74 },
    ],
  },
];

export const AI_CARDS: AiCard[] = [
  {
    icon: '⌁',
    title: 'Agentic test execution',
    body: `I use the Playwright MCP server to let AI agents drive real user journeys through a live
           browser. The agent explores flows, validates behaviour and captures evidence before a
           single line of test code is committed.`,
  },
  {
    icon: '✎',
    title: 'AI assisted test design',
    body: `I turn acceptance criteria into structured specs, page objects and data driven scenarios
           with AI in the loop. Coverage grows faster and the architecture stays consistent and
           maintainable.`,
  },
  {
    icon: '⌕',
    title: 'AI powered failure analysis',
    body: `I feed traces, screenshots, console logs and network activity into AI tooling to separate
           flaky tests from real defects and pinpoint the root cause in minutes instead of hours.`,
  },
  {
    icon: '▤',
    title: 'Automated evidence and reporting',
    body: `I build pipelines that turn raw execution results into test completion reports that are
           ready for stakeholders. Pass rates, defects, coverage and sign off evidence come out
           automatically, with no manual compilation.`,
  },
  {
    icon: '◫',
    title: 'Visual regression at scale',
    body: `I maintain pixel diff baselines across devices and viewports so UI drift is caught the
           moment it appears. This includes device emulated mobile coverage of responsive web
           widgets.`,
  },
  {
    icon: '↻',
    title: 'Self improving frameworks',
    body: `I apply AI driven refactoring to keep suites healthy. That means stable role based
           locators, web first assertions, no hard waits, and flaky tests hunted down relentlessly
           release after release.`,
  },
];

export const JOBS: Job[] = [
  {
    company: 'Discovery',
    role: 'Senior Test Automation Engineer',
    period: 'Jun 2024 to Present',
    current: true,
    tags: ['Playwright', 'TypeScript', 'Azure DevOps', 'AI testing'],
    bullets: [
      'I develop and maintain a scalable Playwright and TypeScript test framework that is reused across teams.',
      'I automate end to end web journeys with stable role based locators, plus API checks in the same repo.',
      'Tests run continuously in Azure DevOps on every pull request and on a daily schedule, and Playwright HTML reports are published as pipeline artifacts.',
      'I track quality with pass rate, flakiness and time to detect metrics, and coach junior engineers on clean TypeScript tests and Playwright best practice.',
    ],
  },
  {
    company: 'RMB',
    role: 'Senior Test Automation Engineer',
    period: 'Sep 2022 to Jun 2024',
    tags: ['Great Expectations', 'ETL testing', 'API testing'],
    bullets: [
      'I identified and implemented Great Expectations as the ETL data testing tool.',
      'I owned test planning, requirement analysis and test data generation for data heavy platforms.',
      'I automated regression packs and ran API testing with SoapUI and Postman.',
    ],
  },
  {
    company: 'BankservAfrica',
    role: 'Test Automation Engineer',
    period: 'Sep 2021 to Aug 2022',
    tags: ['Framework build', 'API testing', 'UAT'],
    bullets: [
      'I helped create the automation framework from scratch for the largest payments clearing house in Africa.',
      'I built the regression test pack and automated the priority test cases.',
      'I ran UAT with external testing partners and API testing through SoapUI and Postman.',
    ],
  },
  {
    company: 'Stellr',
    role: 'QA Engineer',
    period: 'Jul 2019 to Aug 2021',
    tags: ['BDD', 'SQL & NoSQL', 'Integration testing'],
    bullets: [
      'I created a BDD automation framework from scratch.',
      'I tested end to end card and voucher platform flows, including integration testing with SoapUI and Postman.',
      'I worked across SQL and NoSQL data stores for test data manipulation and validation.',
    ],
  },
  {
    company: 'BankservAfrica',
    role: 'Test Analyst',
    period: 'Nov 2016 to May 2019',
    tags: ['Regression', 'SQL', 'Defect management'],
    bullets: [
      'I designed, prioritised and executed test cases for national payment systems.',
      'I manipulated and validated data with SQL, and supported UAT and end to end testing.',
      'I tracked defects through to closure and helped developers reproduce incidents.',
    ],
  },
  {
    company: 'Nedbank',
    role: 'Tester, then Test Analyst (Enterprise Testing)',
    period: 'Jan 2014 to Oct 2016',
    tags: ['Mobile testing', 'Agile', 'Mentoring'],
    bullets: [
      'I tested WAP, USSD and app suites across Android, iOS, BlackBerry and Windows devices.',
      'I contributed to agile ceremonies including backlog grooming, sprint planning and retrospectives.',
      'I mentored and upskilled new and junior staff.',
    ],
  },
  {
    company: 'First National Bank',
    role: 'Test Analyst',
    period: 'Jan 2014 to Aug 2014',
    tags: ['HP Quality Center', 'Mobile apps'],
    bullets: [
      'I executed manual functional tests from HP Quality Center.',
      'I tested apps on tablets and phones across iOS, BlackBerry and Android.',
    ],
  },
];

export const QUALIFICATIONS: Qualification[] = [
  {
    year: '2017',
    title: 'ISTQB Advanced Test Analyst',
    institution: 'SASTQB',
    kind: 'certification',
  },
  {
    year: '2016',
    title: 'ISEB Intermediate Certificate in Software Testing',
    institution: 'BCS, The Chartered Institute for IT',
    kind: 'certification',
  },
  {
    year: '2014',
    title: 'ISTQB Foundation Level',
    institution: 'BCS, The Chartered Institute for IT',
    kind: 'certification',
  },
  {
    year: '2014',
    title: 'BSc Computer Systems',
    institution: 'CTI',
    kind: 'degree',
  },
];

export const NAV_LINKS = [
  { id: 'about', label: 'about.spec.ts' },
  { id: 'skills', label: 'skills.spec.ts' },
  { id: 'ai-lab', label: 'ai-lab.spec.ts' },
  { id: 'experience', label: 'experience.spec.ts' },
  { id: 'education', label: 'education.spec.ts' },
];
