export interface IntakeEntry {
  id: string;
  time: string;
  description: string;
  grams: number;
  multiplier?: number;
}

export interface DayDocument {
  _id: string;
  date: string;
  intakes: IntakeEntry[];
  goalGrams?: number;
}

export interface Preset {
  id: string;
  description: string;
  grams: number;
}

export interface PresetsDocument {
  _id: "settings:presets";
  presets: Preset[];
}

export interface AppSettingsDocument {
  _id: "settings:app";
  proteinGoalGrams: number | null;
}

export type PouchDoc = DayDocument | PresetsDocument | AppSettingsDocument;
