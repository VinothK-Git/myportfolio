export type Project = { number: string; kind: string; title: string[]; tags: string; style: 'signal' | 'systems' | 'intelligence' }

export const profile = {
  name: 'Vinoth', initials: 'vK', email: 'vinothkrishnamoorthy73@gmail.com',
  
  resumeUrl: 'https://drive.google.com/file/d/1YZjbBY4HIY7URgYZGkZzsU2G_XWR9rwL/view?usp=sharing',
  role: 'Turning ideas into intelligent solutions through AI and modern technology.',
  location: 'Ready to Explore Worldwide · Working globally',
  bio: 'I believe AI is most interesting when it makes people feel more capable, not less human.',
  about: 'I believe the best technology is simple, useful, and created with real people and real problems in mind.',
  skills: ['AI & automation', 'Product thinking', 'Creative direction', 'Learning in public'],
  socials: [{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/vinoth-krishnamoorthy-k/' }, { label: 'X / Twitter', url: 'https://x.com/Vinok02063487' }, { label: 'Instagram', url: 'https://www.instagram.com/_vinoth.___k?igsh=MXo2ZzBvcm44eTE3' }]
}

export const projects: Project[] = [
  { number: '01', kind: 'AI-Safety integrated', title: ['Safety', 'Chatbot'], tags: 'Question · Think · Ensure Safety', style: 'signal' },
  { number: '02', kind: 'OpenCV Image Processing', title: ['Fire', 'Detection'], tags: 'Detect · Indicate · Report', style: 'systems' },
  { number: '03', kind: 'What really did you write?', title: ['Handwriting', 'Identification'], tags: 'AI · Thoughts · Pssst.I got it', style: 'intelligence' }
]
