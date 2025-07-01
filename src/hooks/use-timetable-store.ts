import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TeacherSchedule, ClassSchedule, ScheduleEntry } from '@/types';
import { INITIAL_TEACHERS, INITIAL_CLASSES, SUBJECTS, DAYS_OF_WEEK } from '@/lib/data';
import { toast } from './use-toast';

const createPeriods = (count: number) => Array.from({ length: count }, (_, i) => `P${i + 1}`);
const INITIAL_PERIOD_COUNT = 8;

interface TimetableState {
  teachers: string[];
  classes: string[];
  subjects: string[];
  days: string[];
  periods: string[];
  teacherSchedules: TeacherSchedule;
  classSchedules: ClassSchedule;
  setTeachers: (teachers: string[]) => void;
  setClasses: (classes: string[]) => void;
  setSubjects: (subjects: string[]) => void;
  setPeriods: (count: number) => void;
  setTeacherSchedule: (teacherId: string, day: string, period: string, entry: ScheduleEntry) => void;
  generateClassSchedules: () => void;
  resetSchedules: () => void;
}

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
  persist(
    (set, get) => ({
      teachers: INITIAL_TEACHERS,
      classes: INITIAL_CLASSES,
      subjects: SUBJECTS,
      days: DAYS_OF_WEEK,
      periods: createPeriods(INITIAL_PERIOD_COUNT),
      teacherSchedules: createEmptySchedules(INITIAL_TEACHERS, DAYS_OF_WEEK, createPeriods(INITIAL_PERIOD_COUNT)),
      classSchedules: {},

      setTeachers: (newTeachers) => {
        const { teacherSchedules, days, periods } = get();
        const oldSchedules = teacherSchedules;
        const newTeacherSchedules: TeacherSchedule = {};

        // Add existing and new teachers, preserving their schedules
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

        set({
          teachers: newTeachers,
          teacherSchedules: newTeacherSchedules,
          classSchedules: {}, // Reset class schedules as they are derived
        });
      },

      setClasses: (newClasses) => {
        set({
          classes: newClasses,
          classSchedules: {},
        });
      },

      setSubjects: (newSubjects) => {
        set({ subjects: newSubjects });
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

        set({
          periods: newPeriods,
          teacherSchedules: newTeacherSchedules,
          classSchedules: {}
        });
      },

      setTeacherSchedule: (teacherId, day, period, entry) => {
        const { teacherSchedules } = get();
        
        // Clash detection
        if (entry) {
          // Check if teacher is already assigned
          const teacherDaySchedule = teacherSchedules[teacherId]?.[day] || {};
          if (teacherDaySchedule[period]) {
            toast({ variant: 'destructive', title: 'Clash Detected', description: `${teacherId} is already assigned to a class in this slot.` });
            return;
          }

          // Check if class is already occupied
          for (const t of Object.keys(teacherSchedules)) {
            const existingEntry = teacherSchedules[t]?.[day]?.[period];
            if (existingEntry && existingEntry.classId === entry.classId) {
              toast({ variant: 'destructive', title: 'Clash Detected', description: `${entry.classId} is already assigned a teacher in this slot.` });
              return;
            }
          }
        }

        set(state => ({
          teacherSchedules: {
            ...state.teacherSchedules,
            [teacherId]: {
              ...state.teacherSchedules[teacherId],
              [day]: {
                ...state.teacherSchedules[teacherId]?.[day],
                [period]: entry,
              },
            },
          },
        }));
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
                if (newClassSchedules[entry.classId]?.[day]?.[period]) {
                   console.warn(`Conflict detected for class ${entry.classId} on ${day} at ${period}. Overwriting.`);
                }
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
        
        set({ classSchedules: newClassSchedules });
        toast({ title: 'Success', description: 'Class timetables generated.' });
      },

      resetSchedules: () => {
        const { teachers, days, periods } = get();
        set({
            teacherSchedules: createEmptySchedules(teachers, days, periods),
            classSchedules: {}
        });
        toast({ title: 'Schedules Reset', description: 'All timetable entries have been cleared.' });
      }
    }),
    {
      name: 'chronoflow-timetable-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
