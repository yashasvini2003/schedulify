import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TeacherSchedule, ClassSchedule, ScheduleEntry } from '@/types';
import { INITIAL_TEACHERS, INITIAL_CLASSES, SUBJECTS, DAYS_OF_WEEK, PERIODS } from '@/lib/data';
import { toast } from './use-toast';

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
  setTeacherSchedule: (teacherId: string, day: string, period: string, entry: ScheduleEntry) => void;
  generateClassSchedules: () => void;
  setOptimizedSchedules: (
    optimizedTeacherSchedules: TeacherSchedule,
    optimizedClassSchedules: ClassSchedule
  ) => void;
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
      periods: PERIODS,
      teacherSchedules: createEmptySchedules(INITIAL_TEACHERS, DAYS_OF_WEEK, PERIODS),
      classSchedules: {},

      setTeachers: (newTeachers) => {
        const { days, periods } = get();
        set({
          teachers: newTeachers,
          teacherSchedules: createEmptySchedules(newTeachers, days, periods),
          classSchedules: {},
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
          Object.entries(schedule).forEach(([day, daySchedule]) => {
            Object.entries(daySchedule).forEach(([period, entry]) => {
              if (entry && newClassSchedules[entry.classId]) {
                if (newClassSchedules[entry.classId][day][period]) {
                   console.warn(`Conflict detected for class ${entry.classId} on ${day} at ${period}. Overwriting.`);
                }
                newClassSchedules[entry.classId][day][period] = { teacherId, subject: entry.subject };
              }
            });
          });
        });
        
        // Check for classes with more than 8 periods a day
        Object.entries(newClassSchedules).forEach(([classId, schedule]) => {
            Object.entries(schedule).forEach(([day, daySchedule]) => {
                const periodCount = Object.values(daySchedule).filter(p => p !== null).length;
                if (periodCount > 8) {
                    toast({ variant: 'destructive', title: 'Scheduling Warning', description: `Class ${classId} has more than 8 periods on ${day}.` });
                }
            });
        });

        set({ classSchedules: newClassSchedules });
        toast({ title: 'Success', description: 'Class timetables generated.' });
      },

      setOptimizedSchedules: (optimizedTeacherSchedules, optimizedClassSchedules) => {
        set({
          teacherSchedules: optimizedTeacherSchedules,
          classSchedules: optimizedClassSchedules,
        });
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
