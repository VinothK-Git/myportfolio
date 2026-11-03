import ProjectCard from './components/ProjectCard'
import LunchAgent from './components/LunchAgent'
import { profile, projects } from './data'

const Line = () => <span className="line"/>

export default function App() {
  const year = new Date().getFullYear()
  return <><div className="noise"/>
    <header className="nav wrap"><a className="brand" href="#top">{profile.initials}<b>·</b></a><nav><a href="#work">Work</a><a href="#lunch">Lunch</a><a href="#about">About</a><a href={profile.resumeUrl} target="_blank" rel="noreferrer">Resume ↗</a><a href="#contact">Contact</a></nav><a className="availability" href={`mailto:${profile.email}`}><i/>Available for select work</a></header>
    <main id="top">
      <section className="hero wrap"><p className="eyebrow"><Line/> AI portfolio / {year}</p><div className="hero-grid"><h1>I turn <em>curiosity</em><br/>into useful things.</h1><div className="intro"><p>I’m <strong>{profile.name}</strong> — {profile.role}</p><a className="arrow-link" href="#work">Explore my work <b>↓</b></a></div></div><div className="hero-footer"><span>{profile.location}</span><span>Scroll to discover ↓</span></div></section>
      <section className="work wrap" id="work"><div className="section-head"><span>(01)</span><h2>Selected work</h2><span>Ideas in motion</span></div><div className="projects">{projects.map(project => <ProjectCard key={project.number} project={project}/>)}</div></section>
      <LunchAgent/>
      <section className="about wrap" id="about"><div className="section-head"><span>(03)</span><h2>A little about me</h2></div><div className="about-body"><p className="big-copy">{profile.bio.split('more').map((part, index) => index ? <span key={index}><em>more</em>{part}</span> : part)}</p><div className="about-side"><p>{profile.about}</p><div className="skills">{profile.skills.map(skill => <span key={skill}>{skill}</span>)}</div></div></div></section>
      <section className="now wrap"><b>✦</b><p className="eyebrow"><Line/>Right now</p><p>Learning, building, and looking for the next interesting problem.</p></section>
      <section className="contact wrap" id="contact"><p className="eyebrow"><Line/>Get in touch</p><h2>Have an idea?<br/><em>Let’s talk.</em></h2><div className="contact-actions"><a className="email" href={`mailto:${profile.email}`}>{profile.email} <span>↗</span></a><a className="resume-button" href={profile.resumeUrl} target="_blank" rel="noreferrer">View résumé <span>↗</span></a></div><div className="socials">{profile.socials.map(social => <a key={social.label} href={social.url}>{social.label} ↗</a>)}</div></section>
    </main><footer className="wrap"><span>© {year} {profile.name}</span><span>Designed with intention</span></footer>
  </>
}
