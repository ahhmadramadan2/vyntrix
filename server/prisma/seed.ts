// ================================================================
// Vyntrix — Database Seed
// Run: npm run db:seed (from inside /server)
// ================================================================

import { PrismaClient, ProficiencyLevel, JobType, SkillCategory } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Vyntrix database...");

  // ------------------------------------------------------------
  // 1. UNIVERSITIES
  // ------------------------------------------------------------
  const [lau, aub, usj, liu] = await Promise.all([
    prisma.university.upsert({
      where: { emailDomain: "lau.edu.lb" },
      update: {},
      create: {
        name: "Lebanese American University",
        location: "Beirut, Lebanon",
        emailDomain: "lau.edu.lb",
      },
    }),
    prisma.university.upsert({
      where: { emailDomain: "aub.edu.lb" },
      update: {},
      create: {
        name: "American University of Beirut",
        location: "Beirut, Lebanon",
        emailDomain: "aub.edu.lb",
      },
    }),
    prisma.university.upsert({
      where: { emailDomain: "usj.edu.lb" },
      update: {},
      create: {
        name: "Université Saint-Joseph",
        location: "Beirut, Lebanon",
        emailDomain: "usj.edu.lb",
      },
    }),
    prisma.university.upsert({
      where: { emailDomain: "liu.edu.lb" },
      update: {},
      create: {
        name: "Lebanese International University",
        location: "Beirut, Lebanon",
        emailDomain: "liu.edu.lb",
      },
    }),
  ]);
  console.log("✅ Universities seeded");

  // ------------------------------------------------------------
  // 2. SKILLS CATALOGUE
  // ------------------------------------------------------------
  const skillDefs = [
    { name: "JavaScript",      category: SkillCategory.PROGRAMMING },
    { name: "TypeScript",      category: SkillCategory.PROGRAMMING },
    { name: "Python",          category: SkillCategory.PROGRAMMING },
    { name: "Java",            category: SkillCategory.PROGRAMMING },
    { name: "C++",             category: SkillCategory.PROGRAMMING },
    { name: "Go",              category: SkillCategory.PROGRAMMING },
    { name: "React",           category: SkillCategory.FRAMEWORK   },
    { name: "Node.js",         category: SkillCategory.FRAMEWORK   },
    { name: "Express",         category: SkillCategory.FRAMEWORK   },
    { name: "Next.js",         category: SkillCategory.FRAMEWORK   },
    { name: "Django",          category: SkillCategory.FRAMEWORK   },
    { name: "Spring Boot",     category: SkillCategory.FRAMEWORK   },
    { name: "PostgreSQL",      category: SkillCategory.DATABASE    },
    { name: "MySQL",           category: SkillCategory.DATABASE    },
    { name: "MongoDB",         category: SkillCategory.DATABASE    },
    { name: "Redis",           category: SkillCategory.DATABASE    },
    { name: "Docker",          category: SkillCategory.DEVOPS      },
    { name: "Git",             category: SkillCategory.DEVOPS      },
    { name: "AWS",             category: SkillCategory.DEVOPS      },
    { name: "Linux",           category: SkillCategory.DEVOPS      },
    { name: "Communication",   category: SkillCategory.SOFT_SKILL  },
    { name: "Teamwork",        category: SkillCategory.SOFT_SKILL  },
    { name: "Problem Solving", category: SkillCategory.SOFT_SKILL  },
  ];

  const skills: Record<string, number> = {};
  for (const def of skillDefs) {
    const skill = await prisma.skill.upsert({
      where: { name: def.name },
      update: {},
      create: def,
    });
    skills[def.name] = skill.id;
  }
  console.log(`✅ ${skillDefs.length} skills seeded`);

  // ------------------------------------------------------------
  // 3. COMPANY + HR USER
  // ------------------------------------------------------------
  const company = await prisma.company.upsert({
    where: { email: "hr@techcorp.com" },
    update: {},
    create: {
      companyName: "TechCorp Lebanon",
      industry: "Software Development",
      location: "Beirut, Lebanon",
      website: "https://techcorp.example.com",
      email: "hr@techcorp.com",
    },
  });

  const hrPassword = await bcrypt.hash("Hr@123456", 10);
  const hrUser = await prisma.hrUser.upsert({
    where: { email: "recruiter@techcorp.com" },
    update: {},
    create: {
      companyId: company.id,
      fullName: "Sara Khalil",
      email: "recruiter@techcorp.com",
      passwordHash: hrPassword,
      role: "RECRUITER",
    },
  });
  console.log("✅ Company + HR user seeded");

  // ------------------------------------------------------------
  // 4. STUDENTS
  // ------------------------------------------------------------
  const s1Pass = await bcrypt.hash("Student@123", 10);
  const s2Pass = await bcrypt.hash("Student@456", 10);

  const student1 = await prisma.student.upsert({
    where: { email: "ahmad.ramadan@lau.edu.lb" },
    update: {},
    create: {
      universityId: lau.id,
      firstName: "Ahmad",
      lastName: "Ramadan",
      email: "ahmad.ramadan@lau.edu.lb",
      passwordHash: s1Pass,
      department: "Computer Science",
      degree: "B.Sc. Computer Science",
      gpa: 3.7,
      status: "STUDENT",
      graduationDate: new Date("2026-06-01"),
    },
  });

  await prisma.studentProfile.upsert({
    where: { studentId: student1.id },
    update: {},
    create: {
      studentId: student1.id,
      githubUrl: "https://github.com/ahmad-ramadan",
      linkedinUrl: "https://linkedin.com/in/ahmad-ramadan",
      cvUrl: "https://example.com/cv/ahmad.pdf",
      bio: "Final-year CS student passionate about full-stack development.",
    },
  });

  const s1Skills = [
    { name: "JavaScript", level: ProficiencyLevel.EXPERT       },
    { name: "TypeScript", level: ProficiencyLevel.INTERMEDIATE },
    { name: "React",      level: ProficiencyLevel.EXPERT       },
    { name: "Node.js",    level: ProficiencyLevel.INTERMEDIATE },
    { name: "PostgreSQL", level: ProficiencyLevel.INTERMEDIATE },
    { name: "Git",        level: ProficiencyLevel.EXPERT       },
    { name: "Docker",     level: ProficiencyLevel.BEGINNER     },
  ];

  for (const s of s1Skills) {
    await prisma.studentSkill.upsert({
      where: {
        studentId_skillId: { studentId: student1.id, skillId: skills[s.name] },
      },
      update: {},
      create: {
        studentId: student1.id,
        skillId: skills[s.name],
        proficiencyLevel: s.level,
      },
    });
  }

  await prisma.project.create({
    data: {
      studentId: student1.id,
      title: "Vyntrix — Job Matching Platform",
      description:
        "Full-stack SaaS platform connecting university students with employers.",
      techStack: "React, Node.js, PostgreSQL, Prisma, Tailwind CSS",
      projectUrl: "https://github.com/ahmad-ramadan/vyntrix",
    },
  });

  // Student 2 — graduate
  const student2 = await prisma.student.upsert({
    where: { email: "lara.nassar@aub.edu.lb" },
    update: {},
    create: {
      universityId: aub.id,
      firstName: "Lara",
      lastName: "Nassar",
      email: "lara.nassar@aub.edu.lb",
      passwordHash: s2Pass,
      department: "Computer Engineering",
      degree: "B.E. Computer Engineering",
      gpa: 3.9,
      status: "GRADUATE",
      graduationDate: new Date("2024-06-01"),
      graduationYear: 2024,
    },
  });

  await prisma.studentProfile.upsert({
    where: { studentId: student2.id },
    update: {},
    create: {
      studentId: student2.id,
      githubUrl: "https://github.com/lara-nassar",
      linkedinUrl: "https://linkedin.com/in/lara-nassar",
      cvUrl: "https://example.com/cv/lara.pdf",
      bio: "AUB graduate focused on backend engineering and cloud architecture.",
    },
  });

  const s2Skills = [
    { name: "Python",     level: ProficiencyLevel.EXPERT       },
    { name: "Django",     level: ProficiencyLevel.EXPERT       },
    { name: "PostgreSQL", level: ProficiencyLevel.INTERMEDIATE },
    { name: "Docker",     level: ProficiencyLevel.INTERMEDIATE },
    { name: "AWS",        level: ProficiencyLevel.INTERMEDIATE },
    { name: "Git",        level: ProficiencyLevel.EXPERT       },
  ];

  for (const s of s2Skills) {
    await prisma.studentSkill.upsert({
      where: {
        studentId_skillId: { studentId: student2.id, skillId: skills[s.name] },
      },
      update: {},
      create: {
        studentId: student2.id,
        skillId: skills[s.name],
        proficiencyLevel: s.level,
      },
    });
  }
  console.log("✅ 2 students seeded");

  // ------------------------------------------------------------
  // 5. JOB POSTINGS
  // ------------------------------------------------------------
  const job1 = await prisma.jobPosting.create({
    data: {
      companyId: company.id,
      hrUserId: hrUser.id,
      title: "Junior Full-Stack Developer",
      description:
        "Join our product team building React + Node.js systems.",
      jobType: JobType.FULL_TIME,
      location: "Beirut, Lebanon",
      minGpa: 3.0,
      deadline: new Date("2025-12-31"),
      status: "OPEN",
    },
  });

  for (const [name, level] of [
    ["JavaScript", ProficiencyLevel.INTERMEDIATE],
    ["React",      ProficiencyLevel.BEGINNER     ],
    ["Node.js",    ProficiencyLevel.BEGINNER     ],
    ["Git",        ProficiencyLevel.BEGINNER     ],
  ] as [string, ProficiencyLevel][]) {
    await prisma.jobSkill.create({
      data: { jobId: job1.id, skillId: skills[name], requiredLevel: level },
    });
  }

  const job2 = await prisma.jobPosting.create({
    data: {
      companyId: company.id,
      hrUserId: hrUser.id,
      title: "Python Backend Engineer",
      description:
        "Build scalable APIs and data pipelines with Python and Django.",
      jobType: JobType.FULL_TIME,
      location: "Remote",
      minGpa: 3.2,
      deadline: new Date("2025-11-30"),
      status: "OPEN",
    },
  });

  for (const [name, level] of [
    ["Python",     ProficiencyLevel.INTERMEDIATE],
    ["Django",     ProficiencyLevel.INTERMEDIATE],
    ["PostgreSQL", ProficiencyLevel.BEGINNER    ],
    ["Docker",     ProficiencyLevel.BEGINNER    ],
    ["Git",        ProficiencyLevel.BEGINNER    ],
  ] as [string, ProficiencyLevel][]) {
    await prisma.jobSkill.create({
      data: { jobId: job2.id, skillId: skills[name], requiredLevel: level },
    });
  }

  const job3 = await prisma.jobPosting.create({
    data: {
      companyId: company.id,
      hrUserId: hrUser.id,
      title: "Frontend Intern",
      description:
        "Hands-on experience building modern UIs with React and TypeScript.",
      jobType: JobType.INTERNSHIP,
      location: "Beirut, Lebanon",
      minGpa: 2.8,
      deadline: new Date("2025-10-01"),
      status: "OPEN",
    },
  });

  for (const [name, level] of [
    ["JavaScript", ProficiencyLevel.BEGINNER],
    ["React",      ProficiencyLevel.BEGINNER],
    ["TypeScript", ProficiencyLevel.BEGINNER],
  ] as [string, ProficiencyLevel][]) {
    await prisma.jobSkill.create({
      data: { jobId: job3.id, skillId: skills[name], requiredLevel: level },
    });
  }
  console.log("✅ 3 job postings seeded");

  // ------------------------------------------------------------
  // Summary
  // ------------------------------------------------------------
  console.log("\n🎉 Vyntrix seed complete!");
  console.log("─────────────────────────────────────────────");
  console.log("📚 Universities : LAU, AUB, USJ");
  console.log("🛠️  Skills       : 23 across 6 categories");
  console.log("🏢 Company      : TechCorp Lebanon");
  console.log("👤 HR User      : recruiter@techcorp.com  /  Hr@123456");
  console.log("🎓 Student 1    : ahmad.ramadan@lau.edu.lb  /  Student@123");
  console.log("🎓 Student 2    : lara.nassar@aub.edu.lb   /  Student@456");
  console.log("💼 Jobs         : 3 open postings");
  console.log("─────────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });