// ================================================================
// Vyntrix — Shared TypeScript Types
// ================================================================

export type UserRole = "STUDENT" | "HR";
export type StudentStatus = "STUDENT" | "GRADUATE";
export type ProficiencyLevel = "BEGINNER" | "INTERMEDIATE" | "EXPERT";
export type JobType = "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "REMOTE";
export type JobStatus = "OPEN" | "CLOSED" | "DRAFT";
export type ApplicationStatus = "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED";
export type SkillCategory = "PROGRAMMING" | "FRAMEWORK" | "DATABASE" | "DEVOPS" | "DESIGN" | "SOFT_SKILL" | "LANGUAGE" | "OTHER";

export interface University {
  id: number;
  name: string;
  location: string;
  emailDomain: string;
}

export interface Skill {
  id: number;
  name: string;
  category: SkillCategory;
}

export interface StudentSkill {
  id: number;
  skillId: number;
  proficiencyLevel: ProficiencyLevel;
  skill: Skill;
}

export interface StudentProfile {
  id: number;
  avatarUrl?: string | null;
  cvUrl?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  phone?: string | null;
  bio?: string | null;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  techStack?: string;
  projectUrl?: string;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  degree: string;
  gpa?: number;
  status: StudentStatus;
  graduationYear?: number;
  university?: University;
  profile?: StudentProfile;
  skills?: StudentSkill[];
  projects?: Project[];
}

export interface Company {
  id: number;
  companyName: string;
  industry: string;
  location: string;
  website?: string;
  email: string;
}

export interface HrUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  company?: Company;
}

export interface JobSkill {
  id: number;
  skillId: number;
  requiredLevel: ProficiencyLevel;
  skill: Skill;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  jobType: JobType;
  location: string;
  minGpa?: number;
  deadline?: string;
  status: JobStatus;
  postedDate: string;
  company: Company;
  requiredSkills: JobSkill[];
}

export interface Application {
  id: number;
  jobId: number;
  studentId: number;
  applicationDate: string;
  applicationStatus: ApplicationStatus;
  coverLetter?: string;
  job?: Job;
  student?: Student;
}

export interface MatchResult {
  id: number;
  studentId: number;
  jobId: number;
  matchScore: number;
  skillScore: number;
  gpaScore: number;
  extraScore: number;
  job?: Job;
  student?: Student;
}

export interface AuthState {
  user: Student | HrUser | null;
  token: string | null;
  role: UserRole | null;
}