import { useState } from 'react'

const skills = {
  'Front-end': { color: 'var(--mustard)', items: ['JavaScript', 'React', 'Angular', 'HTML', 'CSS', 'Bootstrap', 'Redux'] },
  'Back-end':  { color: 'var(--cyan-vivid)', items: ['SQL', 'Python', '.NET/C#', 'Java', 'Express.js', 'Node.js', 'GraphQL', 'MongoDB', 'Kafka'] },
  'DevOps / CI/CD': { color: 'var(--hot-pink)', items: ['Azure DevOps', 'Jenkins/Cloudbees', 'Docker', 'Kubernetes', 'Rancher', 'ArgoCD', 'GitLab', 'Artifactory'] },
  'Concepts & Tools': { color: 'var(--parrot-green)', items: ['AI', 'GitHub Copilot', 'OOP', 'REST APIs', 'MVC', 'TDD', 'Git', 'Containerization'] },
}

const experience = [
  {
    company: 'Turnberry Solutions',
    client: 'consulting at Optum',
    location: 'Eden Prairie, MN',
    title: 'Software Engineering Consultant',
    period: 'Jan 2025 – Present',
    color: 'var(--mustard)',
    bullets: [
      'Work closely with a scrum team to implement new features in sprints for a large-scale government contract; everyday coding in .NET/C#, JavaScript, and Angular.',
      'Plan features with team and stakeholders weekly to satisfy contract requirements and ensure alignment on vision, fixes, and updates.',
      'Navigate complex technologies: podman containers, frontend portals with auth, Kafka eventing across multiple systems, and technical diagramming.',
      'Artfully use AI via GitHub Copilot and a company-specific Azure OpenAI instance — embedded deeply in team workflows for code creation, PR reviews, and story analysis.',
    ],
  },
  {
    company: 'Turnberry Solutions',
    client: 'consulting at U.S. Bank',
    location: 'Richfield, MN',
    title: 'Software Engineering Senior Associate',
    period: 'June 2022 – Dec 2024',
    color: 'var(--cyan-vivid)',
    bullets: [
      'Led cloud migration — one of the first 30 U.S. Bank apps to move from on-prem to Azure; main developer handling code changes, Azure configuration, and testing across 60k lines of code and ~50 system connections.',
      'Daily use of Docker, Kubernetes, Jenkins/Cloudbees, GitLab, and Artifactory for continuous feature releases.',
      'Full stack daily: React, Python, Java, SQL, REST APIs.',
      'Primary contact for 600 monthly internal users — communicating issues, delivering tutorials, and shipping functional, satisfying features.',
      'Advanced Git skills; code review for self and team; Jira and Agile experience.',
    ],
  },
  {
    company: 'Thrivent',
    client: null,
    location: 'Minneapolis, MN',
    title: 'Accounting Technician',
    period: 'June 2020 – June 2022',
    color: 'var(--parrot-green)',
    bullets: [
      'Analyzed bank account statements; classified transactions and identified errors using bank and accounting software.',
      'Built Excel macros, vlookups, data tables, and power queries that increased process speed and accuracy.',
      'Led UAT team through a 4-month software migration for private equity accounting — zero breakages, enabling private equity earnings of $1.7B above 2021 plan (390% actual vs plan).',
    ],
  },
]

const education = [
  {
    school: 'University of Minnesota Full Stack Coding Bootcamp',
    location: 'Minneapolis, MN',
    credential: 'Full Stack Web Development Certificate',
    date: 'March 2022',
    color: 'var(--hot-pink)',
  },
  {
    school: 'St. Olaf College',
    location: 'Northfield, MN',
    credential: 'B.A. — Double Major in Economics & Music',
    date: 'May 2018',
    coursework: 'CS Principles (Python), Calculus, Statistics for Economics, Econometrics, Money & Banking',
    color: 'var(--sky-blue)',
  },
]

export default function Resume() {
  const [activeSkill, setActiveSkill] = useState(null)

  return (
    <div className="resume-page">

      {/* ── HEADER BAND ─────────────────────────── */}
      <div className="resume-header-band">
        <div className="resume-header-color-block">
          <span className="resume-section-eyebrow" style={{ color: 'rgba(0,0,0,0.45)' }}>CV</span>
          <h1 className="resume-name">Michael<br />Wegter<span style={{ color: 'rgba(0,0,0,0.3)' }}>.</span></h1>
          <div className="resume-header-tagline">Software Engineer · Twin Cities, MN</div>
        </div>

        <div className="resume-header-meta">
          <div className="resume-meta-grid">
            <div className="resume-meta-item">
              <span className="resume-meta-label">Email</span>
              <a href="mailto:mwegter95@gmail.com" className="resume-meta-value resume-meta-link">mwegter95@gmail.com</a>
            </div>
            <div className="resume-meta-item">
              <span className="resume-meta-label">Web</span>
              <a href="https://michaelwegter.com" target="_blank" rel="noopener noreferrer" className="resume-meta-value resume-meta-link">michaelwegter.com</a>
            </div>
            <div className="resume-meta-item">
              <span className="resume-meta-label">LinkedIn</span>
              <a href="https://linkedin.com/in/michaelwegter" target="_blank" rel="noopener noreferrer" className="resume-meta-value resume-meta-link">linkedin.com/in/michaelwegter</a>
            </div>
            <div className="resume-meta-item">
              <span className="resume-meta-label">GitHub</span>
              <a href="https://github.com/mwegter95" target="_blank" rel="noopener noreferrer" className="resume-meta-value resume-meta-link">github.com/mwegter95</a>
            </div>
          </div>

          <div className="resume-summary">
            <span className="resume-section-eyebrow" style={{ color: 'var(--mustard)', marginBottom: '14px', display: 'block' }}>Summary</span>
            <p className="resume-summary-text">
              Technical and thoughtful programmer driven by providing value and solving complex problems.
              Quick learner — I develop deep, holistic understanding and communicate issues or improvements
              effectively with stakeholders and teammates.
            </p>
          </div>
        </div>
      </div>

      {/* ── SKILLS ─────────────────────────────── */}
      <section className="resume-section">
        <div className="resume-section-header">
          <span className="resume-section-eyebrow">Technical Skills</span>
          <div className="resume-section-rule" />
        </div>

        <div className="resume-skills-grid">
          {Object.entries(skills).map(([category, { color, items }]) => (
            <div key={category} className="resume-skill-group">
              <div className="resume-skill-category-bar" style={{ background: color }} />
              <span className="resume-skill-category-label" style={{ color }}>{category}</span>
              <div className="resume-skill-chips">
                {items.map(skill => (
                  <span
                    key={skill}
                    className={`resume-skill-chip ${activeSkill === skill ? 'active' : ''}`}
                    style={{ '--chip-color': color }}
                    onMouseEnter={() => setActiveSkill(skill)}
                    onMouseLeave={() => setActiveSkill(null)}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── EXPERIENCE ─────────────────────────── */}
      <section className="resume-section">
        <div className="resume-section-header">
          <span className="resume-section-eyebrow">Work Experience</span>
          <div className="resume-section-rule" />
        </div>

        <div className="resume-experience-list">
          {experience.map((job, i) => (
            <div key={i} className="resume-job-card">
              <div className="resume-job-accent-bar" style={{ background: job.color }} />

              <div className="resume-job-header">
                <div className="resume-job-title-block">
                  <h3 className="resume-job-company">{job.company}</h3>
                  {job.client && <span className="resume-job-client" style={{ color: job.color }}>{job.client}</span>}
                  <span className="resume-job-title">{job.title}</span>
                </div>
                <div className="resume-job-meta">
                  <span className="resume-job-period" style={{ color: job.color }}>{job.period}</span>
                  <span className="resume-job-location">{job.location}</span>
                </div>
              </div>

              <ul className="resume-job-bullets">
                {job.bullets.map((b, j) => (
                  <li key={j} className="resume-job-bullet">
                    <span className="resume-bullet-dot" style={{ background: job.color }} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── EDUCATION ──────────────────────────── */}
      <section className="resume-section">
        <div className="resume-section-header">
          <span className="resume-section-eyebrow">Education</span>
          <div className="resume-section-rule" />
        </div>

        <div className="resume-education-list">
          {education.map((edu, i) => (
            <div key={i} className="resume-edu-card">
              <div className="resume-edu-stripe" style={{ background: edu.color }} />
              <div className="resume-edu-body">
                <div className="resume-edu-top">
                  <div>
                    <h3 className="resume-edu-school">{edu.school}</h3>
                    <p className="resume-edu-credential" style={{ color: edu.color }}>{edu.credential}</p>
                    {edu.coursework && (
                      <p className="resume-edu-coursework">
                        <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Coursework: </span>
                        {edu.coursework}
                      </p>
                    )}
                  </div>
                  <div className="resume-edu-meta">
                    <span className="resume-edu-date" style={{ color: edu.color }}>{edu.date}</span>
                    <span className="resume-edu-location">{edu.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRINT / DOWNLOAD CTA ───────────────── */}
      <div className="resume-print-bar">
        <span className="resume-section-eyebrow" style={{ color: 'var(--text-muted)' }}>— End of CV —</span>
        <button className="btn btn-ghost resume-print-btn" onClick={() => window.print()}>
          Print / Save PDF
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
            <path d="M3 11v2h10v-2M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

    </div>
  )
}
