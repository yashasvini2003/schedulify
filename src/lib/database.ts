'use server';

import clientPromise from './mongodb';
import { INITIAL_TEACHERS, INITIAL_CLASSES, SUBJECTS, DAYS_OF_WEEK } from './data';
import type { TimetableState } from '@/hooks/use-timetable-store';

const DB_NAME = process.env.MONGODB_DB_NAME || 'chronoflowDB';
const COLLECTION_NAME = 'timetables';
const TIMETABLE_ID = 'main_timetable';

type TimetableDocument = Omit<TimetableState, 
  'initializeFromDB' | 
  'setTeachers' | 
  'setClasses' | 
  'setSubjects' | 
  'setPeriods' | 
  'setTeacherSchedule' | 
  'generateClassSchedules' | 
  'resetSchedules' | 
  'isInitialized'
>;

async function getCollection() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection<TimetableDocument>(COLLECTION_NAME);
}

const createInitialData = (): TimetableDocument => {
  const createPeriods = (count: number) => Array.from({ length: count }, (_, i) => `P${i + 1}`);
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
    _id: TIMETABLE_ID,
    teachers: INITIAL_TEACHERS,
    classes: INITIAL_CLASSES,
    subjects: SUBJECTS,
    days: DAYS_OF_WEEK,
    periods: createPeriods(INITIAL_PERIOD_COUNT),
    teacherSchedules: createEmptySchedules(),
    classSchedules: {},
  }
};

export async function getTimetable() {
  const collection = await getCollection();
  let timetable = await collection.findOne({ _id: TIMETABLE_ID });
  
  if (!timetable) {
    console.log('No timetable found, creating initial data...');
    const initialData = createInitialData();
    await collection.insertOne(initialData);
    timetable = initialData;
  }
  
  return JSON.parse(JSON.stringify(timetable));
}

export async function updateTimetable(data: Partial<TimetableState>) {
  const collection = await getCollection();
  
  const dataToStore = { ...data };
  
  // Remove functions and client-side state before storing
  const fieldsToRemove: (keyof TimetableState)[] = [
    'initializeFromDB', 'setTeachers', 'setClasses', 'setSubjects', 
    'setPeriods', 'setTeacherSchedule', 'generateClassSchedules', 
    'resetSchedules', 'isInitialized'
  ];
  fieldsToRemove.forEach(field => delete (dataToStore as any)[field]);
  
  const {_id, ...updateData} = dataToStore;

  const result = await collection.updateOne(
    { _id: TIMETABLE_ID },
    { $set: updateData },
    { upsert: true }
  );
  
  return result;
}
