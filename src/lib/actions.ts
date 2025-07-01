'use server';

import { optimizeTimetable } from "@/ai/flows/optimize-timetable";
import type { TeacherSchedule, ClassSchedule } from "@/types";
import { z } from 'zod';

const ActionInputSchema = z.object({
  teachers: z.array(z.string()),
  classes: z.array(z.string()),
  teacherSchedules: z.any(),
  classSchedules: z.any(),
  teacherWorkloads: z.record(z.string(), z.number()),
});

function transformToAIFormat(schedule: TeacherSchedule) {
    const aiSchedule: Record<string, Record<string, Record<string, string>>> = {};
    for (const teacher in schedule) {
        aiSchedule[teacher] = {};
        for (const day in schedule[teacher]) {
            aiSchedule[teacher][day] = {};
            for (const period in schedule[teacher][day]) {
                const entry = schedule[teacher][day][period];
                aiSchedule[teacher][day][period] = entry ? `${entry.classId} (${entry.subject})` : "";
            }
        }
    }
    return aiSchedule;
}

function transformClassToAIFormat(schedule: ClassSchedule) {
  const aiSchedule: Record<string, Record<string, Record<string, string>>> = {};
  for (const classId in schedule) {
      aiSchedule[classId] = {};
      for (const day in schedule[classId]) {
          aiSchedule[classId][day] = {};
          for (const period in schedule[classId][day]) {
              const entry = schedule[classId][day][period];
              aiSchedule[classId][day][period] = entry ? `${entry.teacherId} (${entry.subject})` : "";
          }
      }
  }
  return aiSchedule;
}

function parseFromAIFormat(aiSchedule: Record<string, Record<string, Record<string, string>>>): TeacherSchedule {
    const schedule: TeacherSchedule = {};
    const classSubjectRegex = /(.+?)\s\((.+?)\)/;

    for (const teacher in aiSchedule) {
        schedule[teacher] = {};
        for (const day in aiSchedule[teacher]) {
            schedule[teacher][day] = {};
            for (const period in aiSchedule[teacher][day]) {
                const rawEntry = aiSchedule[teacher][day][period];
                if (rawEntry) {
                    const match = rawEntry.match(classSubjectRegex);
                    if(match) {
                        schedule[teacher][day][period] = { classId: match[1].trim(), subject: match[2].trim() };
                    } else {
                        schedule[teacher][day][period] = null;
                    }
                } else {
                    schedule[teacher][day][period] = null;
                }
            }
        }
    }
    return schedule;
}

function parseClassFromAIFormat(aiSchedule: Record<string, Record<string, Record<string, string>>>): ClassSchedule {
    const schedule: ClassSchedule = {};
    const teacherSubjectRegex = /(.+?)\s\((.+?)\)/;

    for (const classId in aiSchedule) {
        schedule[classId] = {};
        for (const day in aiSchedule[classId]) {
            schedule[classId][day] = {};
            for (const period in aiSchedule[classId][day]) {
                const rawEntry = aiSchedule[classId][day][period];
                 if (rawEntry) {
                    const match = rawEntry.match(teacherSubjectRegex);
                    if(match) {
                        schedule[classId][day][period] = { teacherId: match[1].trim(), subject: match[2].trim() };
                    } else {
                        schedule[classId][day][period] = null;
                    }
                } else {
                    schedule[classId][day][period] = null;
                }
            }
        }
    }
    return schedule;
}


export async function optimizeTimetableAction(input: unknown) {
    try {
        const parsedInput = ActionInputSchema.parse(input);

        const aiInput = {
            teachers: parsedInput.teachers,
            classes: parsedInput.classes,
            teacherTimetables: transformToAIFormat(parsedInput.teacherSchedules),
            classTimetables: transformClassToAIFormat(parsedInput.classSchedules),
            teacherWorkloads: parsedInput.teacherWorkloads,
        };

        const result = await optimizeTimetable(aiInput);

        const optimizedTeacherSchedules = parseFromAIFormat(result.optimizedTeacherTimetables);
        const optimizedClassSchedules = parseClassFromAIFormat(result.optimizedClassTimetables);
        
        return {
            success: true,
            data: {
                teacherSchedules: optimizedTeacherSchedules,
                classSchedules: optimizedClassSchedules,
                summary: result.optimizationSummary,
            },
        };
    } catch (error) {
        console.error("Error in optimizeTimetableAction:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: errorMessage };
    }
}
