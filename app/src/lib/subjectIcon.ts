import {
  Atom,
  BookOpen,
  Brain,
  Cpu,
  Dna,
  Dumbbell,
  FlaskConical,
  Globe2,
  Landmark,
  Languages,
  Palette,
  Scale,
  Sigma,
  type LucideIcon,
} from "lucide-react";

const RULES: Array<{ keywords: string[]; icon: LucideIcon }> = [
  { keywords: ["matemática", "matematica", "álgebra", "algebra", "cálculo", "calculo", "geometria"], icon: Sigma },
  { keywords: ["português", "portugues", "gramática", "gramatica", "literatura", "redação", "redacao"], icon: BookOpen },
  { keywords: ["química", "quimica"], icon: FlaskConical },
  { keywords: ["física", "fisica"], icon: Atom },
  { keywords: ["biologia"], icon: Dna },
  { keywords: ["história", "historia"], icon: Landmark },
  { keywords: ["geografia"], icon: Globe2 },
  { keywords: ["inglês", "ingles", "espanhol", "língua", "lingua", "idioma"], icon: Languages },
  { keywords: ["direito", "jurídic", "juridic", "legislação", "legislacao"], icon: Scale },
  { keywords: ["filosofia", "sociologia", "psicologia"], icon: Brain },
  { keywords: ["informática", "informatica", "programação", "programacao", "computação", "computacao"], icon: Cpu },
  { keywords: ["educação física", "educacao fisica", "esporte"], icon: Dumbbell },
  { keywords: ["arte", "música", "musica"], icon: Palette },
];

export function subjectIcon(subjectName: string): LucideIcon {
  const normalized = subjectName.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.icon;
    }
  }
  return BookOpen;
}
