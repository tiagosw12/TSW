import {
  Ambulance,
  Baby,
  Bone,
  Brain,
  Dna,
  FlaskConical,
  HeartPulse,
  Microscope,
  Pill,
  Radiation,
  Stethoscope,
  Syringe,
  type LucideIcon,
} from "lucide-react";

export const SUBJECT_ICONS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "stethoscope", label: "Semiologia", Icon: Stethoscope },
  { key: "heart-pulse", label: "Fisiologia", Icon: HeartPulse },
  { key: "brain", label: "Neurologia", Icon: Brain },
  { key: "bone", label: "Anatomia", Icon: Bone },
  { key: "microscope", label: "Patologia", Icon: Microscope },
  { key: "flask-conical", label: "Bioquímica", Icon: FlaskConical },
  { key: "pill", label: "Farmacologia", Icon: Pill },
  { key: "syringe", label: "Imunologia", Icon: Syringe },
  { key: "baby", label: "Pediatria", Icon: Baby },
  { key: "dna", label: "Genética", Icon: Dna },
  { key: "radiation", label: "Radiologia", Icon: Radiation },
  { key: "ambulance", label: "Saúde Coletiva", Icon: Ambulance },
];

const ICON_MAP = new Map(SUBJECT_ICONS.map((entry) => [entry.key, entry.Icon]));
const DEFAULT_ICON = SUBJECT_ICONS[0].Icon;

export function iconForKey(key: string | null | undefined): LucideIcon {
  return (key && ICON_MAP.get(key)) || DEFAULT_ICON;
}
