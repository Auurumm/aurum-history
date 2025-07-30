// types/announcement.ts
export interface Announcement {
  id: string
  title: string
  content: string
  excerpt: string
  image: string
  category: 'Media' | 'Service' | 'Cooperation' | 'Recruit' | 'Social' | 'Others'
  date: string
  published: boolean
  createdAt: Date
  updatedAt: Date
}
