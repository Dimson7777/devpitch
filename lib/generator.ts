import { ProjectInput, GeneratedPitch, TechnicalBreakdown } from './types';

function buildElevatorPitch(input: ProjectInput, stronger: boolean): string {
  const { name, description, techStack, projectType, tone } = input;

  const templates: Record<string, string> = {
    professional: `${stronger ? 'Led the build of' : 'Built'} ${name}, a ${projectType === 'ai-tool' ? 'AI-powered' : projectType} tool that ${description}. Runs on ${techStack}.`,
    senior: `${stronger ? 'Owned end-to-end delivery of' : 'Shipped'} ${name} — a ${projectType} product built to ${description}. The stack is ${techStack}, picked because the team already knew it and we needed to move fast. ${stronger ? 'Took this from a whiteboard sketch to something people use daily.' : ''}`,
    concise: `${name}: ${description}. Stack: ${techStack}.`,
    interview: `So ${name} is a ${projectType} I ${stronger ? 'owned from start to finish' : 'built'} that ${description}. I went with ${techStack} because ${stronger ? 'it matched the constraints — we needed something we could ship fast and keep iterating on' : 'it fit the problem'}. ${stronger ? 'I was the one making the calls on architecture, data model, and deployment.' : ''}`,
  };

  return templates[tone] || templates.professional;
}

function buildCvDescription(input: ProjectInput, stronger: boolean): string {
  const { name, description, techStack, projectType } = input;
  if (stronger) {
    return `Led development of ${name}, a ${projectType} application ${description}. Built on ${techStack}. Made the early calls on data model and API contracts, which turned out to matter a lot when requirements shifted three weeks in. Shipped to production with real users. Wrote tests, documented the decisions that didn't have obvious answers, and got two other engineers productive on the codebase within a week.`;
  }
  return `Built ${name}, a ${projectType} app ${description}. Used ${techStack} and handled everything from initial setup through deployment. Wrote tests, fixed bugs as they came up, and kept the codebase clean enough that others could jump in without a long onboarding.`;
}

function buildLinkedInDescription(input: ProjectInput, stronger: boolean): string {
  const { name, description, techStack, projectType } = input;
  if (stronger) {
    return `Just shipped ${name} — a ${projectType} tool I built from scratch.

The problem: ${description}

What I did: Designed the whole thing on ${techStack}. I didn't just write code — I made the calls on architecture, figured out what to build first, and dealt with the messy parts nobody warns you about (data migrations, edge cases, the stuff that breaks at 2am).

What I learned: Shipping is only half the job. The other half is making sure what you shipped doesn't fall apart when real people start using it differently than you expected.

Happy to talk about the technical details if you're curious.`;
  }
  return `Just shipped ${name} — a ${projectType} project I've been working on.

${description}

Built on ${techStack}. Learned a lot about building something people actually want to use, not just something that works on your machine.`;
}

function buildInterviewAnswer(input: ProjectInput, stronger: boolean): string {
  const { name, description, techStack, projectType } = input;
  if (stronger) {
    return `I'd walk you through ${name} — it's the project where I had the most ownership.

The situation: We needed a ${projectType} tool that could ${description}. This wasn't a nice-to-have — people were working around the problem with spreadsheets and Slack threads, and it was slowing everything down.

What I did: I designed the architecture, picked ${techStack} after looking at what we actually needed (not what was trending on Hacker News), and built the core system. I set up CI/CD, wrote the critical path tests, and got it into users' hands within the first month.

The hard part: The data model. The requirements kept shifting as we learned more about how people actually used it. I solved this by keeping the core schema stable and pushing variability into configuration instead of code changes — so adding a new use case meant a config update, not a migration.

The result: It's running in production, people use it daily, and the codebase is clean enough that new engineers can contribute without a week of hand-holding.`;
  }
  return `Sure — ${name} is a ${projectType} I built that ${description}.

I used ${techStack} and focused on getting something working fast, then improving it based on how people actually used it. The main challenge was figuring out the right data model — I went through a couple iterations before landing on something that handled the edge cases without getting overly complex.

It's running in production and I'm happy with where it ended up, though there are a few things I'd do differently if I started over.`;
}

function buildTechnicalBreakdown(input: ProjectInput, stronger: boolean): TechnicalBreakdown {
  const { techStack, projectType } = input;
  const techs = techStack.split(',').map(t => t.trim()).filter(Boolean);
  const primaryTech = techs[0] || 'the core framework';
  const secondaryTech = techs[1] || 'supporting tools';

  if (stronger) {
    return {
      architecture: `Three layers: data, logic, UI. ${primaryTech} handles the core, ${secondaryTech} covers the cross-cutting stuff. Each layer can be tested on its own. State flows one direction. Side effects live at the edges, not buried in the middle of components — that decision saved us a lot of debugging time.`,
      keyDecisions: `Went with ${primaryTech} because the team already knew it and it has good TypeScript support — fewer runtime surprises at 2am. Kept business logic framework-agnostic so we're not locked in if we need to swap something out. Chose ${secondaryTech} after testing it against real usage patterns, not benchmarks — the thing that benchmarks well isn't always the thing that handles your edge cases.`,
      problemsSolved: `Data consistency was the big one — solved it with a single source of truth for state and optimistic updates for the UI so it feels instant. Performance issues in long lists were fixed with virtualization. Error handling uses a boundary pattern so one broken component doesn't take down the whole page — learned that one the hard way.`,
      improvements: `I'd add structured logging and tracing earlier — debugging production issues without good logs is painful and slow. I'd also build a component library sooner to keep the UI consistent as more people contribute. And I'd set up canary deployments instead of shipping everything at once — we had one bad deploy that could have been caught with 5% traffic first.`,
    };
  }

  return {
    architecture: `Built on ${primaryTech} with ${secondaryTech} for the supporting pieces. Standard component-based setup — UI and data logic are separate, state is centralized, and components talk to each other through props and callbacks. Nothing fancy, but it works.`,
    keyDecisions: `Chose ${primaryTech} for the ecosystem and developer experience. Used ${secondaryTech} to avoid reinventing common patterns. Kept the architecture simple at first — no premature abstractions, just working features. Added structure when the patterns emerged naturally.`,
    problemsSolved: `Handled state sync across views by keeping data flow centralized. Fixed slow renders on big lists with virtualization. Added fallback UIs and retry logic for error states — the retry logic especially saved us from flaky API calls.`,
    improvements: `More test coverage, especially around edge cases we found in production. Some early components grew too big and need splitting. The build pipeline could be faster. And production monitoring needs work — right now we find out about issues from users, not from alerts.`,
  };
}

export function generatePitch(input: ProjectInput, stronger: boolean = false): GeneratedPitch {
  return {
    elevatorPitch: buildElevatorPitch(input, stronger),
    cvDescription: buildCvDescription(input, stronger),
    linkedInDescription: buildLinkedInDescription(input, stronger),
    interviewAnswer: buildInterviewAnswer(input, stronger),
    technicalBreakdown: buildTechnicalBreakdown(input, stronger),
  };
}
