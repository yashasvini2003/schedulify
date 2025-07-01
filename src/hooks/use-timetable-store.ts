import { create } from 'zustand';
import type { TeacherSchedule, ClassSchedule, ScheduleEntry } from '@/types';
import { toast } from './use-toast';
import { INITIAL_TEACHERS, INITIAL_CLASSES, SUBJECTS, DAYS_OF_WEEK } from '@/lib/data';

const LOCAL_STORAGE_KEY = 'chronoflow_timetable_data';

const createPeriods = (count: number) => Array.from({ length: count }, (_, i) => `P${i + 1}`);

export interface TimetableState {
  isInitialized: boolean;
  teachers: string[];
  classes: string[];
  subjects: string[];
  days: string[];
  periods: string[];
  teacherSchedules: TeacherSchedule;
  classSchedules: ClassSchedule;
  initialize: () => void;
  setTeachers: (teachers: string[]) => void;
  setClasses: (classes: string[]) => void;
  setSubjects: (subjects: string[]) => void;
  setPeriods: (count: number) => void;
  setTeacherSchedule: (teacherId: string, day: string, period: string, entry: ScheduleEntry) => void;
  generateClassSchedules: () => void;
  resetSchedules: () => void;
}

const getInitialData = (): Omit<TimetableState, 'isInitialized' | 'initialize' | 'setTeachers' | 'setClasses' | 'setSubjects' | 'setPeriods' | 'setTeacherSchedule' | 'generateClassSchedules' | 'resetSchedules'> => {
  const INITIAL_PERIOD_COUNT = 8;
  const periods = createPeriods(INITIAL_PERIOD_COUNT);
  const teachers = INITIAL_TEACHERS;
  const days = DAYS_OF_WEEK;

  const createEmptySchedules = () => {
    const schedule: any = {};
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
  
  return {
    teachers: INITIAL_TEACHERS,
    classes: INITIAL_CLASSES,
    subjects: SUBJECTS,
    days: DAYS_OF_WEEK,
    periods,
    teacherSchedules: createEmptySchedules(),
    classSchedules: {},
  }
};

const saveStateToLocalStorage = (state: TimetableState) => {
    try {
        const stateToSave = {
            teachers: state.teachers,
            classes: state.classes,
            subjects: state.subjects,
            days: state.days,
            periods: state.periods,
            teacherSchedules: state.teacherSchedules,
            classSchedules: state.classSchedules,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
        console.error("Could not save state to local storage", error);
    }
};

export const useTimetableStore = create<TimetableState>()(
  (set, get) => ({
    ...getInitialData(),
    isInitialized: false,

    initialize: () => {
      if (typeof window === 'undefined' || get().isInitialized) return;
      try {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
          set({ ...JSON.parse(storedData), isInitialized: true });
        } else {
          set({ ...getInitialData(), isInitialized: true });
        }
      } catch (error) {
        console.error("Failed to initialize from local storage:", error);
        toast({
            variant: 'destructive',
            title: 'Storage Error',
            description: 'Could not load timetable data from your browser.',
        });
        set({ ...getInitialData(), isInitialized: true });
      }
    },
    
    setTeachers: (newTeachers) => set(state => {
      const { teacherSchedules, days, periods } = state;
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
      
      const updatedState = { ...state, teachers: newTeachers, teacherSchedules: newTeacherSchedules, classSchedules: {} };
      saveStateToLocalStorage(updatedState);
      return updatedState;
    }),

    setClasses: (newClasses) => set(state => {
      const updatedState = { ...state, classes: newClasses, classSchedules: {} };
      saveStateToLocalStorage(updatedState);
      return updatedState;
    }),

    setSubjects: (newSubjects) => set(state => {
      const updatedState = { ...state, subjects: newSubjects };
      saveStateToLocalStorage(updatedState);
      return updatedState;
    }),
    
    setPeriods: (count) => {
      if (count < 1 || count > 12) {
        toast({ variant: 'destructive', title: 'Invalid Input', description: 'Number of periods must be between 1 and 12.' });
        return;
      }
      const newPeriods = createPeriods(count);
      if (JSON.stringify(get().periods) === JSON.stringify(newPeriods)) return;
      
      set(state => {
        const { teacherSchedules, teachers, days } = state;
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
        const updatedState = { ...state, periods: newPeriods, teacherSchedules: newTeacherSchedules, classSchedules: {} };
        saveStateToLocalStorage(updatedState);
        return updatedState;
      })
    },

    setTeacherSchedule: (teacherId, day, period, entry) => set(state => {
      if (entry) {
        const teacherDaySchedule = state.teacherSchedules[teacherId]?.[day] || {};
        if (teacherDaySchedule[period]) {
          toast({ variant: 'destructive', title: 'Clash Detected', description: `${teacherId} is already assigned to a class in this slot.` });
          return state;
        }
        for (const t of Object.keys(state.teacherSchedules)) {
          const existingEntry = state.teacherSchedules[t]?.[day]?.[period];
          if (existingEntry && existingEntry.classId === entry.classId) {
            toast({ variant: 'destructive', title: 'Clash Detected', description: `${entry.classId} is already assigned a teacher in this slot.` });
            return state;
          }
        }
      }
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
      saveStateToLocalStorage(updatedState);
      return updatedState;
    }),

    generateClassSchedules: () => set(state => {
      const { teacherSchedules, classes, days, periods } = state;
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
      const updatedState = { ...state, classSchedules: newClassSchedules };
      saveStateToLocalStorage(updatedState);
      toast({ title: 'Success', description: 'Class timetables generated.' });
      return updatedState;
    }),

    resetSchedules: () => set(state => {
      const { teachers, days, periods } = state;
      const emptySchedules = createEmptySchedules(teachers, days, periods);
      const updatedState = { ...state, teacherSchedules: emptySchedules, classSchedules: {} };
      saveStateToLocalStorage(updatedState);
      toast({ title: 'Schedules Reset', description: 'All timetable entries have been cleared.' });
      return updatedState;
    })
  })
);

function createEmptySchedules(teachers: string[], days: string[], periods: string[]): TeacherSchedule {
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
