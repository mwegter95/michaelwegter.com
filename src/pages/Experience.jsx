/* ─────────────────────────────────────────────────────────────────
   EXPERIENCE — Software Engineering Story
   Editorial-style narrative chapters, gallery wall aesthetic.
───────────────────────────────────────────────────────────────── */

const chapters = [
  {
    num: 'I',
    company: 'Turnberry Solutions',
    client: 'consulting at U.S. Bank',
    title: 'Software Engineering Senior Associate',
    period: 'June 2022 – Dec 2024',
    location: 'Richfield, MN',
    color: 'var(--cyan-vivid)',
    colorRaw: '#12b4c8',
    stats: [
      { value: '600',  unit: '/mo',  label: 'Internal users served' },
      { value: '2½',   unit: ' yrs', label: 'On the project'        },
      { value: '60k+', unit: ' loc', label: 'Lines of code'         },
      { value: '6',    unit: ' mo',  label: 'Azure migration'       },
    ],
    stack: ['React', 'Python', 'SQL', 'Java', 'REST APIs', 'Docker', 'Kubernetes',
            'Jenkins', 'GitLab', 'Azure DevOps', 'Artifactory'],
    sections: [
      {
        heading: 'The Project',
        body: `Working for U.S. Bank was a great experience. I landed on a perfect project that matched my history and known technologies at the time. The project was called Test Data as a Service, or TDAAS (pronounced "tee-doss"). The tech stack matched perfectly what I learned from my University of Minnesota full stack coding bootcamp and what I'd learned in college; we had a React frontend, and a Python backend, with a heavily utilized SQL database, wherein the whole setup for the app hinged on tables of configuration which we would edit when making fixes or adding new features, enabling us to make changes without running the CI/CD every time.`,
      },
      {
        heading: 'What It Did',
        body: `TDAAS was an internal web app just for employee use, and it will never go to production. This was great for morale because we could deploy any time, create hotfixes super quickly, and just code and develop features without so many hoops to jump through. The point of TDAAS was to provide a place for employees to look up data that they could use for testing in their business scenarios and other applications. TDAAS hooked up to the mainframe of the bank in the lower environments, and syndicated data from it and other systems. Then in a web app, it showed the information in helpful tables with search and other features for conditioning the test data so that users could get real lower environment data (essentially faked data for testing), and they could search for and condition data to be exactly what they needed for their tests. This greatly reduced the rate of one-off emails or requests to make data a certain way, because it was easily findable and editable using TDAAS tools.`,
      },
      {
        pullQuote: true,
        body: `TDAAS helped 600 internal users every month, and it was no small task.`,
      },
      {
        heading: 'Serving the Users',
        body: `Of course, there were still many requests for how to find data, data that wasn't findable, and new features and new ways to search and edit the data reliably. So the job was a lot about being able to listen, communicate, and teach, and it was a matter of serving our users. I learned a lot about how to help people, how to create features that were easy to use, and how to hear people about their needs and then address them with code. I enjoyed this part of the job, because it's important to me to help people and make my environment better by putting in effort and doing what I can to make everyone's experience better.`,
      },
      {
        heading: 'Stepping Up',
        body: `The customer service piece, and really all the pieces of running and managing the app, did end up coming down to just me shortly after I arrived at U.S. Bank, when my senior developer left for another job after my being there for hardly two months. This was a scary concept, as I had just come out of coding bootcamp and this was my first job. Now I would be leading an application team and managing it with no peer teammates, just a manager who didn't really do the code. But despite my nerves, the team did a great job training me in and I was ready for the work. I took on the challenge and really thrived; as I mentioned I loved helping the users, and I became a SME with deep expertise on the app.`,
      },
      {
        pullQuote: true,
        body: `If something was broken, I could fix it, and often within 10 minutes. If we needed a new feature, I understood all the parts it would affect, because I was an expert in the codebase and its functionality.`,
      },
      {
        heading: 'The Migration',
        body: `And it's good I became a SME for the team, not only because I was managing TDAAS as the sole developer and they needed someone to be able to implement and run the app for its many users, but also because of what came next. In 2023 the bank decided to move all of its apps that it could to Azure Cloud instead of an on-prem cloud. So TDAAS was identified as one of the bunch that would go first, since it was a lower environment app and could navigate the changes before some of the outward facing apps got their chance.

Since we were among the first to migrate to Azure, it was a wild world without a lot of examples of what to do. We ran into a lot of hurdles, and sometimes brick walls, but we rolled up our sleeves and got out our track spikes and wrecking balls. I was appointed to be the main representative from TDAAS for the migration, which meant I was point on everything that had to do with it, from figuring out configuration and errors, to large-scale compatibility efforts we had to work through to get TDAAS migrated to Azure. It was a grueling but rewarding effort, and after 6 months of daily work on the migration, we were able to get everything across the finish line. I learned a lot, and I'm thankful for it even though it was a hard project.`,
      },
      {
        pullQuote: true,
        body: `TDAAS kicked off my professional software engineering journey, and I'm grateful for the people I met and the things I learned there.`,
      },
    ],
  },
  {
    num: 'II',
    company: 'Turnberry Solutions',
    client: 'consulting at Optum',
    title: 'Software Engineering Consultant',
    period: 'Jan 2025 – Present',
    location: 'Eden Prairie, MN',
    color: 'var(--mustard)',
    colorRaw: '#e8b820',
    stats: [
      { value: '100+', unit: '',     label: 'Consultants on contract' },
      { value: '150+', unit: ' pts', label: 'Story points delivered'  },
      { value: '4th',  unit: '',     label: 'Iteration of RHRP'       },
      { value: 'WON',  unit: ' ✓',   label: 'Contract, April 2026'    },
    ],
    stack: ['Angular', '.NET / C#', 'PostgreSQL', 'Kafka', 'Docker', 'Podman',
            'GitHub Copilot', 'Azure OpenAI', 'REST APIs', 'Onion Architecture'],
    sections: [
      {
        heading: 'Landing Here',
        body: `I've luckily landed in another great project with Optum, working on the RHRP 4 project. At Optum, I work with a team of developers in strict Agile and sprints style. It's a large-scale project, with nearly 100 Turnberry consultants working on the contract. We are making an app for military service members and veterans to easily understand and request the healthcare that they need to be ready for their next steps. This is the 4th iteration of the contract, and Optum did not win the 3rd. We worked for over a year. Then, finally, the word came that we won the contract April 2026!`,
      },
      {
        pullQuote: true,
        body: `We worked for over a year, then finally, the word came that we won the contract April 2026!`,
      },
      {
        heading: 'The Team & The Work',
        body: `On the RHRP 4 project, teams are split into roughly 4 developers and then multiple teams are assigned to a scrum master. We work efficiently to sound off on problems and bring up design questions. Then we code. 🙂 The RHRP 4 project, or at least my domain in it, called Readiness Request, is built on Angular, .NET/C#, and PostgreSQL. We have a huge code base, using onion architecture, and we all work full stack to get things done. I've contributed over 150 user story points. My team works quickly and works well together. We also integrate with stakeholders and communicate in refinement sessions to create our future work.`,
      },
      {
        heading: 'AI For the Win',
        body: `The part of this role and environment that has been my favorite, other than having a great team and a chill but efficient, non-prod environment, has been the integration of AI. Getting into GitHub Copilot earlier than my teammates allowed me to learn and augment my skills in coding, and do things faster and better. My friend recently lauded me as ahead of the curve when it comes to AI, saying it was impressive. I use it regularly in my code creation, story analysis, and pull request reviews. And my teammates often come to me for advice if their AI setup is broken, or they're needing advice on AI. It feels good to once again be a SME for a certain subject. I've developed skill in conducting AI-powered software development, and know how to coordinate and query the AI to get it to do what I want, and create clean code that completes the objective. This has become my favorite part of the job, and I love developing my chops in this area.`,
      },
      {
        pullQuote: true,
        body: `My friend recently lauded me as ahead of the curve when it comes to AI, saying it was impressive.`,
      },
      {
        heading: 'What Matters',
        body: `I'm glad I'm working on a project to help people get the healthcare they need, and I feel so lucky to have landed on this project with these great people and a well-built environment.`,
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
            The full story behind the résumé lines.
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
                        {sec.body.split('\n\n').map((para, pi) => (
                          <p key={pi} className="exp-section-body">{para}</p>
                        ))}
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
                  <span className="exp-connector-label">1 month later</span>
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
          · Present ·
        </span>
      </div>

    </div>
  )
}
