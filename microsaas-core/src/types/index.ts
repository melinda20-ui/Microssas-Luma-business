export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  response?: string;
  content?: string;
  report?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Campaign {
  id: number;
  clerk_id: string;
  title: string;
  description: string;
  platform: string;
  objective: string;
  budget: number;
  audience: string;
  creative: string;
  status: string;
  review_notes: string;
  approved_by: string | null;
  approved_at: string | null;
  executed_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface LeadMagnet {
  id: number;
  title: string;
  description: string;
  type: string;
  category: string;
  objective: string;
  funnel_stage: string;
  niche: string;
  content: string;
  cta: string;
  seo_score: number;
  download_count: number;
  conversion_count: number;
  status: string;
  tags: string;
  version: number;
  created_at: string;
}

export interface BlogQueueItem {
  id: number;
  clerk_id: string;
  title: string;
  content: string | null;
  excerpt: string;
  category: string;
  tags: string;
  seo_score: number;
  status: string;
  idea_id: number | null;
  lead_magnet: string;
  branding_applied: number;
  image_descriptions: string;
  approved_by: string | null;
  approved_at: string | null;
  scheduled_for: string | null;
  published_at: string | null;
  created_at: string;
}

export interface BrainTask {
  id: number;
  session_id: string;
  clerk_id: string;
  agent_id: string;
  title: string;
  description: string;
  payload: string;
  status: "PENDING" | "APPROVED" | "EXECUTING" | "COMPLETED" | "REJECTED";
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialMetrics {
  mrr: number;
  totalRevenue: number;
  totalUsers: number;
  payingUsers: number;
  freeUsers: number;
  conversionRate: number;
  planDistribution: Record<string, number>;
  fetchedAt: string;
}

export interface ContentIdea {
  id: number;
  clerk_id: string;
  title: string;
  description: string;
  category: string;
  financial_goal_id: number | null;
  goal_title: string | null;
  status: string;
  platform: string;
  seo_score: number;
  tags: string;
  keywords: string;
  created_at: string;
}

export interface FinancialGoal {
  id: number;
  clerk_id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  category: string;
  status: string;
  due_date: string | null;
  created_at: string;
}

export interface Referral {
  id: number;
  name: string;
  email: string;
  status: "active" | "converted" | "stalled" | "lost";
  daysSinceContact: number;
  lastContact: string;
  notes: string;
  created_at: string;
}

export interface MemoryEntry {
  id: number;
  category: string;
  title: string;
  content: string;
  tags: string;
  score: number;
  source: string;
  created_at: string;
}

export interface SentinelLog {
  id: number;
  check_type: string;
  status: string;
  metric: string;
  value: number;
  threshold: number;
  severity: string;
  message: string;
  created_at: string;
}

export interface SystemStatus {
  api: string;
  gemini: string;
  ollama: { online: boolean; models: string[] } | string;
  uptime: number;
  memory?: { heapUsed: number; heapTotal: number };
}

export interface UserProfile {
  credits: number;
  plan: string;
  role: string;
  last_reset: string;
}

export interface OnboardingProgress {
  totalSteps: number;
  completedSteps: number;
  currentStep: string;
  steps: OnboardingStep[];
  startedAt: string;
  daysSinceStart: number;
}

export interface OnboardingStep {
  id: string;
  label: string;
  description: string;
  status: "completed" | "current" | "pending" | "blocked";
  icon: string;
}

export interface AgentMeta {
  icon: string;
  label: string;
  color: string;
  desc: string;
}

export type TaskStatus = "PENDING" | "APPROVED" | "EXECUTING" | "COMPLETED" | "REJECTED";
