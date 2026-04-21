export interface WorkExperience {
  id: string
  company: string
  title: string
  startDate: string
  endDate: string
  current: boolean
  responsibilities: string
}

export interface Education {
  id: string
  school: string
  degree: string
  field: string
  graduationYear: string
  gpa: string
}

export interface ResumeFormData {
  name: string
  email: string
  phone: string
  location: string
  linkedin: string
  portfolio: string
  targetJob: string
  targetCompany: string
  jobDescription: string
  experience: WorkExperience[]
  education: Education[]
  technicalSkills: string
  softSkills: string
  certifications: string
  languages: string
}

export interface GeneratedContent {
  resume: string
  coverLetter: string
  linkedinSummary: string
}
