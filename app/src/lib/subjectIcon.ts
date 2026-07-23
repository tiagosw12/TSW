import { BookOpen, type LucideIcon } from "lucide-react";
import { iconByKey } from "./iconRegistry";

const KEYWORD_RULES: Array<{ keywords: string[]; key: string }> = [
  { keywords: ["anatomia"], key: "bone" },
  { keywords: ["fisiologia"], key: "activity" },
  { keywords: ["matemática", "matematica", "álgebra", "algebra", "cálculo", "calculo", "geometria"], key: "sigma" },
  { keywords: ["português", "portugues", "gramática", "gramatica", "literatura", "redação", "redacao"], key: "book-open" },
  { keywords: ["química", "quimica"], key: "flask-conical" },
  { keywords: ["física", "fisica"], key: "atom" },
  { keywords: ["biologia"], key: "dna" },
  { keywords: ["história", "historia"], key: "landmark" },
  { keywords: ["geografia"], key: "globe" },
  { keywords: ["inglês", "ingles", "espanhol", "língua", "lingua", "idioma"], key: "languages" },
  { keywords: ["direito", "jurídic", "juridic", "legislação", "legislacao"], key: "scale" },
  { keywords: ["filosofia", "sociologia", "psicologia", "psiquiatria"], key: "brain" },
  { keywords: ["informática", "informatica", "programação", "programacao", "computação", "computacao"], key: "cpu" },
  { keywords: ["educação física", "educacao fisica", "esporte"], key: "dumbbell" },
  { keywords: ["arte", "música", "musica"], key: "palette" },
  { keywords: ["farmacologia"], key: "pill" },
  { keywords: ["patologia"], key: "microscope" },
  { keywords: ["semiologia", "clínica médica", "clinica medica", "propedêutica", "propedeutica"], key: "stethoscope" },
  { keywords: ["cirurgia"], key: "scissors" },
  { keywords: ["pediatria"], key: "baby" },
  { keywords: ["cardiologia"], key: "heart-pulse" },
];

/** Best-effort guess from the subject's name, used when it has no explicitly chosen icon. */
function guessIconByName(subjectName: string): LucideIcon {
  const normalized = subjectName.toLowerCase();
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return iconByKey(rule.key) ?? BookOpen;
    }
  }
  return BookOpen;
}

/** Explicit icon (chosen via IconPicker) wins; falls back to a name-based guess, then a generic book. */
export function resolveSubjectIcon(subjectName: string, iconKey?: string | null): LucideIcon {
  if (iconKey) {
    const explicit = iconByKey(iconKey);
    if (explicit) return explicit;
  }
  return guessIconByName(subjectName);
}
