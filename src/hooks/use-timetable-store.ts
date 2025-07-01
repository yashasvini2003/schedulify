import { create } from 'zustand';
import type { TeacherSchedule, ClassSchedule, ScheduleEntry } from '@/types';
import { toast } from './use-toast';
import { getTimetable, updateTimetable } from '@/lib/database';

const createPeriods = (count: number) => Array.from({ length: count }, (_, i) => `P${i + 1}`);

export interface TimetableState {
  _id?: string;
  isInitialized: boolean;
  teachers: string[];
  classes: string[];
  subjects: string[];
  days: string[];
  periods: string[];
  teacherSchedules: TeacherSchedule;
  classSchedules: ClassSchedule;
  initializeFromDB: () => Promise<void>;
  setTeachers: (teachers: string[]) => void;
  setClasses: (classes: string[]) => void;
  setSubjects: (subjects: string[]) => void;
  setPeriods: (count: number) => void;
  setTeacherSchedule: (teacherId: string, day: string, period: string, entry: ScheduleEntry) => void;
  generateClassSchedules: () => void;
  resetSchedules: () => void;
}

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      clearTimeout(timeout);
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
}

const debouncedUpdateTimetable = debounce(updateTimetable, 1000);

const createEmptySchedules = (teachers: string[], days: string[], periods: string[]): TeacherSchedule => {
  const schedule: TeacherSchedule = {};
  teachers.forEach(teacher => {
    schedule[teacher] = {};
    days.forEach(day => {
      schedule[teacher][day] = {};
      periods.forEach(period => {
        schedule[teacher][day][period] = null;
      });
    });
  });
  return schedule;
};

export const useTimetableStore = create<TimetableState>()(
  (set, get) => ({
    _id: undefined,
    isInitialized: false,
    teachers: [],
    classes: [],
    subjects: [],
    days: [],
    periods: [],
    teacherSchedules: {},
    classSchedules: {},

    initializeFromDB: async () => {
      if (get().isInitialized) return;
      try {
        const data = await getTimetable();
        if (data) {
          set({ ...data, isInitialized: true });
        } else {
            throw new Error("No data returned from database");
        }
      } catch (error) {
        console.error("Failed to initialize from database:", error);
        toast({
          variant: 'destructive',
          title: 'Database Error',
          description: 'Could not load timetable data. Check console for details.',
        });
      }
    },

    setTeachers: (newTeachers) => {
      const { teacherSchedules, days, periods } = get();
      const oldSchedules = teacherSchedules;
      const newTeacherSchedules: TeacherSchedule = {};

      newTeachers.forEach(teacher => {
        newTeacherSchedules[teacher] = oldSchedules[teacher] || {};
        days.forEach(day => {
          newTeacherSchedules[teacher][day] = newTeacherSchedules[teacher][day] || {};
          periods.forEach(period => {
            if (newTeacherSchedules[teacher][day][period] === undefined) {
              newTeacherSchedules[teacher][day][period] = null;
            }
          });
        });
      });
      
      const updatedState = { ...get(), teachers: newTeachers, teacherSchedules: newTeacherSchedules, classSchedules: {} };
      set(updatedState);
      debouncedUpdateTimetable(updatedState);
    },

    setClasses: (newClasses) => {
      const updatedState = { ...get(), classes: newClasses, classSchedules: {} };
      set(updatedState);
      debouncedUpdateTimetable(updatedState);
    },

    setSubjects: (newSubjects) => {
      const updatedState = { ...get(), subjects: newSubjects };
      set(updatedState);
      debouncedUpdateTimetable(updatedState);
    },
    
    setPeriods: (count) => {
      if (count < 1 || count > 12) {
        toast({ variant: 'destructive', title: 'Invalid Input', description: 'Number of periods must be between 1 and 12.' });
        return;
      }
      const { teacherSchedules, teachers, days, periods: oldPeriods } = get();
      const newPeriods = createPeriods(count);
      if (JSON.stringify(oldPeriods) === JSON.stringify(newPeriods)) return;
      const newTeacherSchedules: TeacherSchedule = {};
      teachers.forEach(teacher => {
          newTeacherSchedules[teacher] = {};
          days.forEach(day => {
              const oldDaySchedule = teacherSchedules[teacher]?.[day] || {};
              const newDaySchedule: Record<string, ScheduleEntry> = {};
              newPeriods.forEach(period => {
                  newDaySchedule[period] = oldDaySchedule[period] || null;
              });
              newTeacherSchedules[teacher][day] = newDaySchedule;
          });
      });
      const updatedState = { ...get(), periods: newPeriods, teacherSchedules: newTeacherSchedules, classSchedules: {} };
      set(updatedState);
      debouncedUpdateTimetable(updatedState);
    },

    setTeacherSchedule: (teacherId, day, period, entry) => {
      const { teacherSchedules } = get();
      if (entry) {
        const teacherDaySchedule = teacherSchedules[teacherId]?.[day] || {};
        if (teacherDaySchedule[period]) {
          toast({ variant: 'destructive', title: 'Clash Detected', description: `${teacherId} is already assigned to a class in this slot.` });
          return;
        }
        for (const t of Object.keys(teacherSchedules)) {
          const existingEntry = teacherSchedules[t]?.[day]?.[period];
          if (existingEntry && existingEntry.classId === entry.classId) {
            toast({ variant: 'destructive', title: 'Clash Detected', description: `${entry.classId} is already assigned a teacher in this slot.` });
            return;
          }
        }
      }
      set(state => {
        const updatedSchedules = {
          ...state.teacherSchedules,
          [teacherId]: {
            ...state.teacherSchedules[teacherId],
            [day]: {
              ...state.teacherSchedules[teacherId]?.[day],
              [period]: entry,
            },
          },
        };
        const updatedState = { ...state, teacherSchedules: updatedSchedules };
        debouncedUpdateTimetable(updatedState);
        return { teacherSchedules: updatedSchedules };
      });
    },

    generateClassSchedules: () => {
      const { teacherSchedules, classes, days, periods } = get();
      const newClassSchedules: ClassSchedule = {};
      classes.forEach(classId => {
        newClassSchedules[classId] = {};
        days.forEach(day => {
          newClassSchedules[classId][day] = {};
          periods.forEach(period => {
            newClassSchedules[classId][day][period] = null;
          });
        });
      });
      Object.entries(teacherSchedules).forEach(([teacherId, schedule]) => {
        if (!schedule) return;
        Object.entries(schedule).forEach(([day, daySchedule]) => {
          if (!daySchedule) return;
          Object.entries(daySchedule).forEach(([period, entry]) => {
            if (entry && newClassSchedules[entry.classId]) {
              const newEntry: { teacherId: string, subject: string, note?: string } = { teacherId, subject: entry.subject };
              if (entry.note) {
                newEntry.note = entry.note;
              }
              if(newClassSchedules[entry.classId]?.[day]) {
                  newClassSchedules[entry.classId][day][period] = newEntry;
              }
            }
          });
        });
      });
      const updatedState = { ...get(), classSchedules: newClassSchedules };
      set(updatedState);
      debouncedUpdateTimetable(updatedState);
      toast({ title: 'Success', description: 'Class timetables generated.' });
    },

    resetSchedules: () => {
      const { teachers, days, periods } = get();
      const emptySchedules = createEmptySchedules(teachers, days, periods);
      const updatedState = { ...get(), teacherSchedules: emptySchedules, classSchedules: {} };
      set(updatedState);
      debouncedUpdateTimetable(updatedState);
      toast({ title: 'Schedules Reset', description: 'All timetable entries have been cleared.' });
    }
  })
);
