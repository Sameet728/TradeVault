// ============================================================
// Strategy Types
// ============================================================

export type ParameterType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'rating'
  | 'image';

export interface StrategyParameter {
  key: string;
  label: string;
  type: ParameterType;
  options?: string[];   // for select / multiselect
  required: boolean;
  defaultValue?: unknown;
  description?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  description?: string;
}

export interface Strategy {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  parameters: StrategyParameter[];
  checklist: ChecklistItem[];
  isActive: boolean;
  tradeCount?: number;
  winRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StrategyFormData {
  name: string;
  description?: string;
  parameters: StrategyParameter[];
  checklist: ChecklistItem[];
  isActive: boolean;
}
