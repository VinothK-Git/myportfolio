export type Project = { number: string; kind: string; title: string[]; tags: string; style: 'signal' | 'systems' | 'intelligence' }

export const profile = {
  name: 'Vinoth', initials: 'vK', email: 'vinothkrishnamoorthy73@gmail.com',
  // Put your PDF at public/resume.pdf, or replace this with a Google Drive / LinkedIn resume link.
  resumeUrl: 'public/resume.pdf',
  role: 'a curious builder exploring the space where artificial intelligence, design and real-world problems meet.',
  location: 'Based anywhere · Working globally',
  bio: 'I believe AI is most interesting when it makes people feel more capable, not less human.',
  about: 'I enjoy asking better questions, making complex things clear, and building small experiments that have a point of view.',
  skills: ['AI & automation', 'Product thinking', 'Creative direction', 'Learning in public'],
  socials: [{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/vinoth-krishnamoorthy-k/' }, { label: 'X / Twitter', url: 'https://x.com/Vinok02063487' }, { label: 'Instagram', url: 'https://www.instagram.com/_vinoth.___k?igsh=MXo2ZzBvcm44eTE3' }]
}

export const projects: Project[] = [
  { number: '01', kind: 'AI product concept', title: ['Signal', 'Studio'], tags: 'Strategy · Design · AI', style: 'signal' },
  { number: '02', kind: 'Personal experiment', title: ['Thinking', 'in Systems'], tags: 'Research · Writing', style: 'systems' },
  { number: '03', kind: 'Creative technology', title: ['Everyday', 'Intelligence'], tags: 'AI · Culture · People', style: 'intelligence' }
]
