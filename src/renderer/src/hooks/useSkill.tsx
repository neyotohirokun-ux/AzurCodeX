import { useState, useEffect } from "react";
import skillData from "../data-meta/skill.json";
import type { Skill } from "../types/skill";

export const useSkill = () => {
  const [skills, setSkills] = useState<Record<number, Skill>>({});

  useEffect(() => {
    setSkills(skillData as Record<number, Skill>);
  }, []);

  const getSkillById = (id: number) => skills[id];

  return { skills, getSkillById };
};
