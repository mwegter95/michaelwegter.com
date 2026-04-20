/* ─────────────────────────────────────────────────────────────────
   EXPERIENCE — Software Engineering Story
   Editorial-style narrative chapters, gallery wall aesthetic.
───────────────────────────────────────────────────────────────── */

const chapters = [
  {
    num: 'I',
    company: 'Turnberry Solutions',
    client: 'U.S. Bank',
    title: 'Software Engineering Senior Associate',
    period: 'June 2022 – Dec 2024',
    location: 'Richfield, MN',
    color: 'var(--cyan-vivid)',
    colorRaw: '#12b4c8',
    stats: [
      { value: '600',    unit: '/mo',   label: 'Internal users served'      },
      { value: '2½',     unit: ' yrs',  label: 'On the project'             },
      { value: '60k+',   unit: ' loc',  label: 'Lines of code'              },
      { value: '6',      unit: ' mo',   label: 'Azure migration'            },
    ],
    stack: ['React', 'Python', 'SQL', 'Java', 'REST APIs', 'Docker', 'Kubernetes',
            'Jenkins', 'GitLab', 'Azure DevOps', 'Artifactory'],
    sections: [
      {
        heading: 'The Project',
        body: `My first role out of the U of M coding bootcamp landed me on a perfect fit — a project called Test Data as a Service, or TDAAS. The tech stack was exactly what I'd learned: React on the frontend, Python on the backend, and a heavily utilized SQL database where most of the app's behavior was configured in tables we could edit without running the CI/CD pipeline. That flexibility was a huge win for development speed.`,
      },
      {
        pullQuote: true,
        body: `TDAAS helped 600 internal users every month — employees who needed real lower-environment data to run their tests and business scenarios.`,
      },
      {
        heading: 'What It Did',
        body: `TDAAS was an internal web app that hooked into the bank's mainframe in lower environments and syndicated data from it and other systems. It showed that data in helpful tables with search and filtering tools, so employees could find and condition exactly the test data they needed. Before TDAAS, that process meant a flood of one-off requests. After it, users had self-service tools and the rate of ad-hoc asks dropped dramatically.`,
      },
      {
        heading: 'Becoming the SME',
        body: `Two months in, my senior developer left for another job. For someone fresh out of bootcamp, the prospect of leading an application solo was terrifying. But the team trained me well, and I rose to it. I took ownership of the entire codebase — every feature, every bug, every user question — and became a genuine SME. If something broke, I could diagnose and fix it, often within ten minutes. If a new feature was needed, I understood all the moving parts because I had become an expert in every corner of the system.`,
      },
      {
        pullQuote: true,
        body: `If something was broken, I could fix it — often within ten minutes. I had become an expert in every corner of the system.`,
      },
      {
        heading: 'Serving the Users',
        body: `The job was as much about people as it was about code. Users had requests, edge cases, and confusion. I learned how to really listen, how to translate a vague need into a precise technical solution, and how to build features that were intuitive enough to need almost no explanation. That felt meaningful — making other people's days easier by putting in the effort to understand what they actually needed.`,
      },
      {
        heading: 'The Azure Migration',
        body: `In 2023, U.S. Bank began moving its apps off on-prem infrastructure and into Azure Cloud. TDAAS was identified as a candidate for one of the first waves — a lower-environment app that could work out the kinks before the outward-facing products made the jump. Since we were among the first thirty apps to migrate, the path was far from paved. There were hurdles, brick walls, compatibility issues across 50+ system connections, and configuration puzzles that had no precedent. I was the main technical representative from the TDAAS side — point on everything.`,
      },
      {
        heading: 'Six Months Later',
        body: `After six months of daily migration work — debugging Azure configs, rewriting compatibility layers, navigating documentation that didn't exist yet — we crossed the finish line. It was one of the hardest projects I'd done, and one of the most rewarding. TDAAS kicked off my professional engineering career, and I'm grateful for every person I worked with and everything I learned there.`,
      },
    ],
  },
  {
    num: 'II',
    company: 'Turnberry Solutions',
    client: 'Optum',
    title: 'Software Engineering Consultant',
    period: 'Jan 2025 – Present',
    location: 'Eden Prairie, MN',
    color: 'var(--mustard)',
    colorRaw: '#e8b820',
    stats: [
      { value: '100+', unit: '',      label: 'Consultants on contract' },
      { value: '150+', unit: ' pts',  label: 'Story points delivered'  },
      { value: '4th',  unit: '',      label: 'Iteration of RHRP'       },
      { value: 'WON',  unit: '  ✓',   label: 'Contract — April 2026'   },
    ],
    stack: ['Angular', '.NET / C#', 'PostgreSQL', 'Kafka', 'Docker', 'Podman',
            'GitHub Copilot', 'Azure OpenAI', 'REST APIs', 'Onion Architecture'],
    sections: [
      {
        heading: 'The Mission',
        body: `I've been lucky to land on another meaningful project. RHRP 4 — the Readiness Healthcare Request Program, 4th iteration — is a large-scale government contract building an app for military service members and veterans to understand and request the healthcare they need. Optum didn't hold the 3rd iteration of this contract. We worked for over a year proving ourselves, and in April 2026 the news came: we won it. That moment hit differently.`,
      },
      {
        pullQuote: true,
        body: `We worked for over a year proving ourselves — and in April 2026, the word came: we won the contract. That moment hit differently.`,
      },
      {
        heading: 'The Work',
        body: `The codebase is large and modern — Angular on the frontend, .NET/C# on the backend, PostgreSQL for persistence, and Kafka threading events across multiple systems. We follow onion architecture with a full separation of concerns, and everyone works full stack. My domain, Readiness Request, is the part that directly handles what service members ask for in terms of healthcare readiness. I've contributed over 150 story points and counting.`,
      },
      {
        heading: 'The Team',
        body: `Teams are structured at roughly four developers per scrum team, with multiple teams sharing a scrum master. It's efficient and collaborative — we sound off on blockers, hash out design questions, refine future work with stakeholders, and then we code. There's nearly a hundred Turnberry consultants on the wider contract, but day to day it feels like a tight crew. The environment is non-prod: chill, focused, and good at getting things done without unnecessary friction.`,
      },
      {
        heading: 'AI on the Front Lines',
        body: `The part of this role I've enjoyed most — beyond the team and the mission — has been getting deep into AI-powered development. I got into GitHub Copilot earlier than most of my teammates, which gave me a head start in learning how to work with it effectively. A friend recently told me I was "ahead of the curve" when it comes to AI, and that felt accurate. I use it daily: for writing code, analyzing user stories, reviewing pull requests. Teammates come to me when their Copilot setup breaks or they need advice on prompting strategy.`,
      },
      {
        pullQuote: true,
        body: `I've developed a genuine skill in AI-powered software development — knowing how to coordinate and query AI to produce clean, purposeful code.`,
      },
      {
        heading: 'What I\u2019ve Built Here',
        body: `This role has crystallized something for me: I love being the person who figures things out and brings the team along. Whether it's deep expertise in a codebase, or being the go-to for AI tooling, or building features that serve people who genuinely need them — that's the work I want to do. I feel lucky to be doing it on a project for people who deserve this kind of care, with a team I genuinely like.`,
      },
    ],
  },
]

export default function Experience() {
  return (
    <div className="exp-page">

      {/* ── PAGE HEADER ─────────────────────────── */}
      <div className="exp-page-header">
        <div className="exp-page-header-inner">
          <span className="exp-eyebrow">Software Engineering</span>
          <h1 className="exp-page-title">Experience</h1>
          <p className="exp-page-sub">
            Two chapters. One trajectory. The full story behind the résumé lines.
          </p>
        </div>
      </div>

      {/* ── CHAPTERS ────────────────────────────── */}
      <div className="exp-chapters">
        {chapters.map((ch, ci) => (
          <article key={ci} className="exp-chapter">

            {/* Color band across the top */}
            <div className="exp-chapter-band" style={{ background: ch.color }} />

            <div className="exp-chapter-inner">

              {/* Chapter header */}
              <header className="exp-chapter-header">
                <div className="exp-chapter-num-block">
                  <span className="exp-chapter-num" style={{ color: ch.color }}>
                    {ch.num}.
                  </span>
                </div>
                <div className="exp-chapter-title-block">
                  <div className="exp-chapter-company-row">
                    <h2 className="exp-chapter-company">{ch.company}</h2>
                    <span className="exp-chapter-client" style={{ color: ch.color }}>
                      {ch.client}
                    </span>
                  </div>
                  <p className="exp-chapter-role">{ch.title}</p>
                  <div className="exp-chapter-meta-row">
                    <span className="exp-chapter-period" style={{ color: ch.color }}>{ch.period}</span>
                    <span className="exp-chapter-dot">·</span>
                    <span className="exp-chapter-location">{ch.location}</span>
                  </div>
                </div>
              </header>

              {/* Stats row */}
              <div className="exp-stats-row">
                {ch.stats.map((s, si) => (
                  <div key={si} className="exp-stat" style={{ '--stat-color': ch.color }}>
                    <div className="exp-stat-value">
                      {s.value}<span className="exp-stat-unit">{s.unit}</span>
                    </div>
                    <div className="exp-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Narrative sections */}
              <div className="exp-narrative">
                {ch.sections.map((sec, si) => (
                  sec.pullQuote
                    ? (
                      <blockquote key={si} className="exp-pull-quote"
                                  style={{ '--pq-color': ch.color, borderLeftColor: ch.color }}>
                        <span className="exp-pull-quote-mark" style={{ color: ch.color }}>"</span>
                        {sec.body}
                        <span className="exp-pull-quote-mark exp-pull-quote-close" style={{ color: ch.color }}>"</span>
                      </blockquote>
                    ) : (
                      <div key={si} className="exp-section">
                        {sec.heading && (
                          <h3 className="exp-section-heading" style={{ color: ch.color }}>
                            {sec.heading}
                          </h3>
                        )}
                        <p className="exp-section-body">{sec.body}</p>
                      </div>
                    )
                ))}
              </div>

              {/* Tech stack */}
              <div className="exp-stack">
                <span className="exp-stack-label">Stack</span>
                <div className="exp-stack-chips">
                  {ch.stack.map(s => (
                    <span key={s} className="exp-stack-chip" style={{ '--chip-color': ch.color }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Timeline connector between chapters */}
            {ci < chapters.length - 1 && (
              <div className="exp-connector">
                <div className="exp-connector-line" />
                <div className="exp-connector-node">
                  <span className="exp-connector-label">3 months later</span>
                </div>
                <div className="exp-connector-line" />
              </div>
            )}

          </article>
        ))}
      </div>

      {/* ── END MARK ────────────────────────────── */}
      <div className="exp-end-mark">
        <span className="resume-section-eyebrow" style={{ color: 'var(--text-muted)' }}>
          — Present —
        </span>
      </div>

    </div>
  )
}
