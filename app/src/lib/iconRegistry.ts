import {
  Activity,
  Atom,
  Baby,
  Bone,
  BookOpen,
  Brain,
  Cpu,
  Dna,
  Dumbbell,
  FlaskConical,
  Globe2,
  HeartPulse,
  Landmark,
  Languages,
  Microscope,
  Palette,
  Pill,
  Scale,
  Scissors,
  Sigma,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

export interface IconEntry {
  key: string;
  label: string;
  Icon: LucideIcon;
}

/** Curated catalog: the only icons a subject can be explicitly assigned via the IconPicker. */
export const ICON_REGISTRY: IconEntry[] = [
  { key: "bone", label: "Anatomia", Icon: Bone },
  { key: "activity", label: "Fisiologia", Icon: Activity },
  { key: "flask-conical", label: "Química", Icon: FlaskConical },
  { key: "atom", label: "Física", Icon: Atom },
  { key: "dna", label: "Biologia", Icon: Dna },
  { key: "pill", label: "Farmacologia", Icon: Pill },
  { key: "microscope", label: "Patologia", Icon: Microscope },
  { key: "stethoscope", label: "Semiologia / Clínica", Icon: Stethoscope },
  { key: "scissors", label: "Cirurgia", Icon: Scissors },
  { key: "baby", label: "Pediatria", Icon: Baby },
  { key: "heart-pulse", label: "Cardiologia", Icon: HeartPulse },
  { key: "brain", label: "Filosofia / Psicologia", Icon: Brain },
  { key: "sigma", label: "Matemática", Icon: Sigma },
  { key: "book-open", label: "Português / Leitura", Icon: BookOpen },
  { key: "landmark", label: "História", Icon: Landmark },
  { key: "globe", label: "Geografia", Icon: Globe2 },
  { key: "languages", label: "Idiomas", Icon: Languages },
  { key: "scale", label: "Direito", Icon: Scale },
  { key: "cpu", label: "Informática", Icon: Cpu },
  { key: "dumbbell", label: "Educação física", Icon: Dumbbell },
  { key: "palette", label: "Artes", Icon: Palette },
];

const BY_KEY = new Map(ICON_REGISTRY.map((entry) => [entry.key, entry.Icon]));

export function iconByKey(key: string): LucideIcon | undefined {
  return BY_KEY.get(key);
}
