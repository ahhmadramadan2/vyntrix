import { prisma } from "../../config/db";
import { SkillCategory } from "@prisma/client";

export const getAllSkills = async (category?: SkillCategory) => {
  return prisma.skill.findMany({
    where: category ? { category } : undefined,
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
};

export const createSkill = async (name: string, category: SkillCategory) => {
  return prisma.skill.create({ data: { name, category } });
};