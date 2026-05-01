export type ProjectType = 'saas' | 'portfolio' | 'ecommerce' | 'ai-tool' | 'dashboard' | 'other';

export type OutputTone = 'professional' | 'senior' | 'concise' | 'interview';

export interface ProjectInput {
  name: string;
  description: string;
  techStack: string;
  projectType: ProjectType;
  tone: OutputTone;
}

export interface TechnicalBreakdown {
  architecture: string;
  keyDecisions: string;
  problemsSolved: string;
  improvements: string;
}

export interface GeneratedPitch {
  elevatorPitch: string;
  cvDescription: string;
  linkedInDescription: string;
  interviewAnswer: string;
  technicalBreakdown: TechnicalBreakdown;
}

export interface SavedExample {
  id: string;
  name: string;
  type: ProjectType;
  pitch: GeneratedPitch;
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  saas: 'SaaS',
  portfolio: 'Portfolio',
  ecommerce: 'E-commerce',
  'ai-tool': 'AI Tool',
  dashboard: 'Dashboard',
  other: 'Other',
};

export const TONE_LABELS: Record<OutputTone, string> = {
  professional: 'Professional',
  senior: 'Senior',
  concise: 'Concise',
  interview: 'Interview Style',
};
