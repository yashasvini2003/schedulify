export type ScheduleEntry = {
  classId: string;
  subject: string;
} | null;

export type TeacherSchedule = Record<string, Record<string, Record<string, ScheduleEntry>>>;
export type ClassSchedule = Record<string, Record<string, Record<string, { teacherId: string; subject: string } | null>>>;
