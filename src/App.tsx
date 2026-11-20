import ProjectCard from './components/ProjectCard'
import LunchAgent from './components/LunchAgent'
import VisitorCount from './components/VisitorCount'
import { profile, projects } from './data'

const Line = () => <span className="line"/>

export default function App() {
  const year = new Date().getFullYear()
  return <><div className="noise"/>
    <header className="nav wrap"><a className="brand" href="#top">{profile.initials}<b>·</b></a><nav><a href="#work">Work</a><a href="#lunch">Lunch</a><a href="#about">About</a><a href={profile.resumeUrl} target="_blank" rel="noreferrer">Resume ↗</a><a href="#contact">Contact</a></nav><a className="availability" href={`mailto:${profile.email}`}><i/>Available for select work</a></header>
    <main id="top">
      <section className="hero wrap"><p className="eyebrow"><Line/> AI portfolio / {year}</p><svg className="hero-art" viewBox="0 0 240 240" aria-hidden="true" focusable="false"><ellipse className="hero-art-orbit" cx="120" cy="120" rx="104" ry="49" transform="rotate(-28 120 120)"/><circle className="hero-art-sun" cx="119" cy="119" r="69"/><circle className="hero-art-moon" cx="151" cy="143" r="33"/><circle className="hero-art-spark" cx="193" cy="49" r="8"/><circle className="hero-art-dot" cx="32" cy="166" r="4"/><path className="hero-art-ray" d="M190 28v-9m0 60v-9m30-21h-9m-42 0h-9"/></svg><span className="hero-art-label" aria-hidden="true">Ideas in motion</span><div className="hero-grid"><h1>I turn <em>curiosity</em><br/>into useful things.</h1><div className="intro"><p>I’m <strong>{profile.name}</strong> — {profile.role}</p><a className="arrow-link" href="#work">Explore my work <b>↓</b></a></div></div><div className="hero-footer"><span>{profile.location}</span><span>Scroll to discover ↓</span></div></section>
      <section className="work wrap" id="work"><div className="section-head"><span>(01)</span><h2>Selected work</h2><span>Ideas in motion</span></div><div className="projects">{projects.map(project => <ProjectCard key={project.number} project={project}/>)}</div></section>
      <LunchAgent/>
      <section className="about wrap" id="about"><div className="section-head"><span>(03)</span><h2>A little about me</h2></div><div className="about-body"><p className="big-copy">{profile.bio.split('more').map((part, index) => index ? <span key={index}><em>more</em>{part}</span> : part)}</p><div className="about-side"><p>{profile.about}</p><div className="skills">{profile.skills.map(skill => <span key={skill}>{skill}</span>)}</div></div></div></section>
      <section className="now wrap"><b>✦</b><p className="eyebrow"><Line/>Right now</p><p>Learning, building, and looking for the next interesting problem.</p></section>
      <section className="contact wrap" id="contact"><div className="contact-copy"><p className="eyebrow"><Line/>Get in touch</p><h2>Have an idea?<br/><em>Let’s talk.</em></h2><div className="contact-actions"><a className="email" href={`mailto:${profile.email}`}>{profile.email} <span>↗</span></a><a className="resume-button" href={profile.resumeUrl} target="_blank" rel="noreferrer">View résumé <span>↗</span></a></div><div className="socials">{profile.socials.map(social => <a key={social.label} href={social.url}>{social.label} ↗</a>)}</div></div><div className="contact-portrait-wrap"><span className="portrait-accent"/><img className="contact-portrait" src="/assets/vinoth-profile-cutout.png" alt="Portrait of Vinoth"/></div></section>
    </main><footer className="wrap"><span>© {year} {profile.name}</span><div className="footer-meta"><VisitorCount/><span>Designed with intention</span></div></footer>
  </>
}
