export type ActivityType = "leitura" | "resumo" | "esquema" | "questao";

export interface Database {
  public: {
    Tables: {
      subjects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string | null;
          icon: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string | null;
          icon?: string | null;
        };
        Update: {
          name?: string;
          color?: string | null;
          icon?: string | null;
        };
        Relationships: [];
      };
      topics: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          name: string;
          manual_importance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          name: string;
          manual_importance?: number;
        };
        Update: {
          name?: string;
          manual_importance?: number;
        };
        Relationships: [];
      };
      exams: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          exam_date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          exam_date: string;
          notes?: string | null;
        };
        Update: {
          name?: string;
          exam_date?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      exam_subjects: {
        Row: {
          id: string;
          user_id: string;
          exam_id: string;
          subject_id: string;
          weight: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_id: string;
          subject_id: string;
          weight?: number;
        };
        Update: {
          weight?: number;
        };
        Relationships: [];
      };
      exam_topics: {
        Row: {
          id: string;
          user_id: string;
          exam_id: string;
          topic_id: string;
          weight: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_id: string;
          topic_id: string;
          weight?: number;
        };
        Update: {
          weight?: number;
        };
        Relationships: [];
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          topic_id: string;
          activity_type: ActivityType;
          duration_minutes: number;
          performed_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          topic_id: string;
          activity_type: ActivityType;
          duration_minutes: number;
          performed_at?: string;
          notes?: string | null;
        };
        Update: {
          notes?: string | null;
        };
        Relationships: [];
      };
      quiz_results: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          topic_id: string | null;
          correct_percentage: number;
          questions_count: number;
          performed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          topic_id?: string | null;
          correct_percentage: number;
          questions_count: number;
          performed_at?: string;
        };
        Update: {
          correct_percentage?: number;
        };
        Relationships: [];
      };
      topic_memory_state: {
        Row: {
          topic_id: string;
          user_id: string;
          stability_days: number;
          last_reviewed_at: string;
          updated_at: string;
        };
        Insert: {
          topic_id: string;
          user_id: string;
          stability_days?: number;
          last_reviewed_at?: string;
        };
        Update: {
          stability_days?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      topic_retention: {
        Row: {
          topic_id: string;
          subject_id: string;
          user_id: string;
          last_reviewed_at: string;
          stability_days: number;
          days_since_review: number;
          estimated_retention: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_topic_priorities: {
        Args: {
          p_user_id?: string;
          p_urgency_k?: number;
          p_urgency_boost?: number;
        };
        Returns: {
          topic_id: string;
          topic_name: string;
          subject_id: string;
          subject_name: string;
          subject_icon: string | null;
          manual_importance: number;
          exam_weight_component: number;
          importance: number;
          estimated_retention: number;
          forgetting: number;
          nearest_exam_id: string | null;
          nearest_exam_name: string | null;
          days_to_nearest_exam: number | null;
          urgency: number;
          priority: number;
        }[];
      };
      get_topic_priorities_by_date_range: {
        Args: {
          p_start_date: string;
          p_end_date: string;
          p_user_id?: string;
          p_urgency_k?: number;
          p_urgency_boost?: number;
        };
        Returns: {
          day: string;
          day_rank: number;
          topic_id: string;
          topic_name: string;
          subject_id: string;
          subject_name: string;
          subject_icon: string | null;
          manual_importance: number;
          exam_weight_component: number;
          importance: number;
          estimated_retention: number;
          forgetting: number;
          nearest_exam_id: string | null;
          nearest_exam_name: string | null;
          days_to_nearest_exam: number | null;
          urgency: number;
          priority: number;
        }[];
      };
    };
  };
}

export type Subject = Database["public"]["Tables"]["subjects"]["Row"];
export type Topic = Database["public"]["Tables"]["topics"]["Row"];
export type Exam = Database["public"]["Tables"]["exams"]["Row"];
export type ExamSubject = Database["public"]["Tables"]["exam_subjects"]["Row"];
export type ExamTopic = Database["public"]["Tables"]["exam_topics"]["Row"];
export type StudySession = Database["public"]["Tables"]["study_sessions"]["Row"];
export type QuizResult = Database["public"]["Tables"]["quiz_results"]["Row"];
export type TopicRetention = Database["public"]["Views"]["topic_retention"]["Row"];
export type TopicPriority = Database["public"]["Functions"]["get_topic_priorities"]["Returns"][number];
export type TopicPriorityByDay =
  Database["public"]["Functions"]["get_topic_priorities_by_date_range"]["Returns"][number];

export const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "leitura", label: "Leitura" },
  { value: "resumo", label: "Resumo" },
  { value: "esquema", label: "Esquema" },
  { value: "questao", label: "Questões" },
];
