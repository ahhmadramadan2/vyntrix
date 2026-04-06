-- ================================================================
-- Vyntrix — Raw PostgreSQL Schema (reference only)
-- Prisma handles actual migrations via db push
-- ================================================================

CREATE TYPE "StudentStatus"     AS ENUM ('STUDENT', 'GRADUATE');
CREATE TYPE "ProficiencyLevel"  AS ENUM ('BEGINNER', 'INTERMEDIATE', 'EXPERT');
CREATE TYPE "JobType"           AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'REMOTE');
CREATE TYPE "JobStatus"         AS ENUM ('OPEN', 'CLOSED', 'DRAFT');
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED');
CREATE TYPE "HrRole"            AS ENUM ('HR_MANAGER', 'RECRUITER', 'ADMIN');
CREATE TYPE "SkillCategory"     AS ENUM ('PROGRAMMING', 'FRAMEWORK', 'DATABASE', 'DEVOPS', 'DESIGN', 'SOFT_SKILL', 'LANGUAGE', 'OTHER');

CREATE TABLE universities (
  id           SERIAL        PRIMARY KEY,
  name         VARCHAR(255)  NOT NULL UNIQUE,
  location     VARCHAR(255)  NOT NULL,
  email_domain VARCHAR(100)  NOT NULL UNIQUE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE students (
  id              SERIAL          PRIMARY KEY,
  university_id   INT             NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
  first_name      VARCHAR(100)    NOT NULL,
  last_name       VARCHAR(100)    NOT NULL,
  email           VARCHAR(255)    NOT NULL UNIQUE,
  password_hash   VARCHAR(255)    NOT NULL,
  department      VARCHAR(150)    NOT NULL,
  degree          VARCHAR(150)    NOT NULL,
  gpa             DECIMAL(3,2),
  graduation_date TIMESTAMPTZ,
  graduation_year INT,
  status          "StudentStatus" NOT NULL DEFAULT 'STUDENT',
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE student_profiles (
  id           SERIAL       PRIMARY KEY,
  student_id   INT          NOT NULL UNIQUE REFERENCES students(id) ON DELETE CASCADE,
  cv_url       VARCHAR(500),
  linkedin_url VARCHAR(500),
  github_url   VARCHAR(500),
  phone        VARCHAR(30),
  bio          TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE projects (
  id          SERIAL        PRIMARY KEY,
  student_id  INT           NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title       VARCHAR(200)  NOT NULL,
  description TEXT,
  tech_stack  VARCHAR(500),
  project_url VARCHAR(500),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE skills (
  id         SERIAL          PRIMARY KEY,
  name       VARCHAR(100)    NOT NULL UNIQUE,
  category   "SkillCategory" NOT NULL DEFAULT 'OTHER',
  created_at TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE student_skills (
  id                SERIAL             PRIMARY KEY,
  student_id        INT                NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_id          INT                NOT NULL REFERENCES skills(id)   ON DELETE CASCADE,
  proficiency_level "ProficiencyLevel" NOT NULL DEFAULT 'BEGINNER',
  created_at        TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_student_skill UNIQUE (student_id, skill_id)
);

CREATE TABLE companies (
  id           SERIAL        PRIMARY KEY,
  company_name VARCHAR(200)  NOT NULL,
  industry     VARCHAR(150)  NOT NULL,
  location     VARCHAR(200)  NOT NULL,
  website      VARCHAR(500),
  email        VARCHAR(255)  NOT NULL UNIQUE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE hr_users (
  id            SERIAL       PRIMARY KEY,
  company_id    INT          NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          "HrRole"     NOT NULL DEFAULT 'RECRUITER',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE job_postings (
  id          SERIAL       PRIMARY KEY,
  company_id  INT          NOT NULL REFERENCES companies(id)  ON DELETE CASCADE,
  hr_user_id  INT          NOT NULL REFERENCES hr_users(id)   ON DELETE RESTRICT,
  title       VARCHAR(200) NOT NULL,
  description TEXT         NOT NULL,
  job_type    "JobType"    NOT NULL DEFAULT 'FULL_TIME',
  location    VARCHAR(200) NOT NULL,
  min_gpa     DECIMAL(3,2),
  posted_date TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deadline    TIMESTAMPTZ,
  status      "JobStatus"  NOT NULL DEFAULT 'OPEN',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE job_skills (
  id             SERIAL             PRIMARY KEY,
  job_id         INT                NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  skill_id       INT                NOT NULL REFERENCES skills(id)       ON DELETE CASCADE,
  required_level "ProficiencyLevel" NOT NULL DEFAULT 'BEGINNER',
  created_at     TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_job_skill UNIQUE (job_id, skill_id)
);

CREATE TABLE applications (
  id                 SERIAL              PRIMARY KEY,
  student_id         INT                 NOT NULL REFERENCES students(id)     ON DELETE CASCADE,
  job_id             INT                 NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  application_date   TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  application_status "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
  cover_letter       TEXT,
  created_at         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_application UNIQUE (student_id, job_id)
);

CREATE TABLE match_results (
  id           SERIAL       PRIMARY KEY,
  student_id   INT          NOT NULL REFERENCES students(id)     ON DELETE CASCADE,
  job_id       INT          NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  match_score  DECIMAL(5,2) NOT NULL,
  skill_score  DECIMAL(5,2) NOT NULL,
  gpa_score    DECIMAL(5,2) NOT NULL,
  extra_score  DECIMAL(5,2) NOT NULL,
  matched_on   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_match_result UNIQUE (student_id, job_id)
);