// Optimize Timetable Flow

'use server';
/**
 * @fileOverview An AI agent that optimizes timetables to ensure even workload distribution among teachers.
 *
 * - optimizeTimetable - A function that handles the timetable optimization process.
 * - OptimizeTimetableInput - The input type for the optimizeTimetable function.
 * - OptimizeTimetableOutput - The return type for the optimizeTimetable function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizeTimetableInputSchema = z.object({
  teacherTimetables: z.record(z.string(), z.record(z.string(), z.record(z.string(), z.string()))).describe('A record of teacher timetables, with teacher IDs as keys, days of the week as keys, periods as keys, and assigned class/subject as values.'),
  classTimetables: z.record(z.string(), z.record(z.string(), z.record(z.string(), z.string()))).describe('A record of class timetables, with class IDs as keys, days of the week as keys, periods as keys, and assigned teacher/subject as values.'),
  teachers: z.array(z.string()).describe('An array of teacher names.'),
  classes: z.array(z.string()).describe('An array of class names.'),
});

export type OptimizeTimetableInput = z.infer<typeof OptimizeTimetableInputSchema>;

const OptimizeTimetableOutputSchema = z.object({
  optimizedTeacherTimetables: z.record(z.string(), z.record(z.string(), z.record(z.string(), z.string()))).describe('The optimized teacher timetables.'),
  optimizedClassTimetables: z.record(z.string(), z.record(z.string(), z.record(z.string(), z.string()))).describe('The optimized class timetables.'),
  optimizationSummary: z.string().describe('A summary of the optimizations made.'),
});

export type OptimizeTimetableOutput = z.infer<typeof OptimizeTimetableOutputSchema>;

export async function optimizeTimetable(input: OptimizeTimetableInput): Promise<OptimizeTimetableOutput> {
  return optimizeTimetableFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizeTimetablePrompt',
  input: {schema: OptimizeTimetableInputSchema},
  output: {schema: OptimizeTimetableOutputSchema},
  prompt: `You are an AI timetable optimizer. Given the following teacher and class timetables, optimize the timetables to ensure an even distribution of workload among teachers, and avoid teacher/class conflicts or duplicate entries.  Try to make as few changes as possible.

  Teachers: {{{teachers}}}
  Classes: {{{classes}}}

  Teacher Timetables: {{{teacherTimetables}}}
  Class Timetables: {{{classTimetables}}}

  Return the optimized timetables and a summary of the optimizations made.

  Consider a maximum of 8 periods per day for each class or teacher.
  `, 
});

const optimizeTimetableFlow = ai.defineFlow(
  {
    name: 'optimizeTimetableFlow',
    inputSchema: OptimizeTimetableInputSchema,
    outputSchema: OptimizeTimetableOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
