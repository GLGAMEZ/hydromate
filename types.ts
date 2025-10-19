
export type Unit = 'ml' | 'oz' | 'cups';

export interface Settings {
    dailyGoal: number; // Stored in ml
    unit: Unit;
    reminderInterval: number; // in minutes
    glassSize: number; // Stored in ml
}

export interface IntakeRecord {
    id: number;
    amount: number; // Stored in ml
    date: string; // YYYY-MM-DD
    timestamp: string; // ISO string
}
