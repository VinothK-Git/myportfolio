import type { Project } from '../data'

export default function ProjectCard({ project }: { project: Project }) {
  return <a className={`project ${project.style}`} href="#contact" aria-label={`Talk about ${project.title.join(' ')}`}>
    <span className="project-number">{project.number}</span>
    {project.style === 'signal' && <><i className="orb orb-one"/><i className="orb orb-two"/></>}
    {project.style === 'systems' && <><i className="grid-lines"/><span className="scan-card">MAKE<br/>IT<br/><em>REAL</em></span></>}
    {project.style === 'intelligence' && <span className="type-shape">A<small>01</small></span>}
    <div className="project-copy"><p>{project.kind}</p><h3>{project.title.map(line => <span key={line}>{line}</span>)}</h3><small>{project.tags}</small></div>
    <span className="project-go">↗</span>
  </a>
}
