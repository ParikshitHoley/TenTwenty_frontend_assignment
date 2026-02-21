export interface Week {
  id: number;
  week_number: number;
  start_date: string;
  end_date: string;
  status: 'Completed' | 'Incomplete' | 'Missing';
  total_hours: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface TimesheetEntry {
  id: number;
  week_id: number;
  date: string;
  project_name: string;
  type_of_work: string;
  description?: string;
  hours: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  created_at: string;
}

export interface DailyEntries {
  [date: string]: TimesheetEntry[];
}
