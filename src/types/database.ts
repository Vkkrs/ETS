export interface Exercise {
  id: string;
  user_id: string | null;
  name: string;
  category: "calisthenics" | "strength" | "mobility";
  muscle_primary: string[];
  muscle_secondary: string[];
  equipment: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  intensity: "low" | "moderate" | "high" | "maximal";
  description: string | null;
  steps: string[] | null;
  sets_default: number | null;
  reps_default: string | null;
  duration_default: number | null;
  video_url: string | null;
  ai_generated: boolean;
  created_at: string;
}

export interface OperatorProfile {
  id: string;
  user_id: string;
  mission: "selection" | "veteran" | "milsim" | "lifestyle" | null;
  module_range: boolean;
  module_chow: boolean;
  time_to_event_weeks: number | null;
  training_days_per_week: number;
  primary_equipment: string;
  calorie_target: number | null;
  updated_at: string;
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  session_date: string;
  duration_min: number | null;
  rpe: number | null;
  workout_name: string | null;
  notes: string | null;
  created_at: string;
}

export interface TrainingPlan {
  id: string;
  user_id: string;
  name: string;
  week_start: string;
  intensity: string | null;
  equipment: string | null;
  ai_generated: boolean;
  created_at: string;
}

export interface TrainingPlanDay {
  id: string;
  plan_id: string;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  type: "train" | "rest" | "recovery";
  workout_name: string | null;
  exercise_ids: string[];
}

export interface MealPlan {
  id: string;
  user_id: string;
  week_start: string;
  calorie_target: number | null;
  ai_generated: boolean;
  created_at: string;
}

export interface MealPlanEntry {
  id: string;
  plan_id: string;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  meal_type: "breakfast" | "pre_wo" | "lunch" | "post_wo" | "dinner" | "snack";
  recipe_id: string | null;
  servings: number;
}

export interface Recipe {
  id: string;
  user_id: string | null;
  name: string;
  tags: string[];
  prep_time: number | null;
  servings: number | null;
  calories_per_serving: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  ingredients: unknown;
  steps: string[] | null;
  storage_notes: string | null;
  ai_generated: boolean;
  created_at: string;
}
