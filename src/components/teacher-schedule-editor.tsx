'use client';

import { useState } from 'react';
import { useTimetableStore } from '@/hooks/use-timetable-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { optimizeTimetableAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Book, Bot, Building, Loader2, Sparkles, Trash2, Users, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import type { ScheduleEntry } from '@/types';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

function ScheduleCell({ teacherId, day, period }: { teacherId: string; day: string; period: string }) {
  const { teacherSchedules, setTeacherSchedule, classes, subjects } = useTimetableStore();
  const entry = teacherSchedules[teacherId]?.[day]?.[period];

  const [isOpen, setIsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(entry?.classId || '');
  const [selectedSubject, setSelectedSubject] = useState(entry?.subject || '');

  const handleSave = () => {
    if (selectedClass && selectedSubject) {
      setTeacherSchedule(teacherId, day, period, { classId: selectedClass, subject: selectedSubject });
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setTeacherSchedule(teacherId, day, period, null);
    setSelectedClass('');
    setSelectedSubject('');
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <TableCell className="h-16 w-32 border cursor-pointer text-center hover:bg-secondary/50 transition-colors" data-testid={`cell-${teacherId}-${day}-${period}`}>
          {entry ? (
            <div className="text-xs">
              <p className="font-bold text-primary">{entry.classId}</p>
              <p className="text-muted-foreground">{entry.subject}</p>
            </div>
          ) : (
            <div className="text-gray-300 dark:text-gray-600">+</div>
          )}
        </TableCell>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Edit Slot</h4>
            <p className="text-sm text-muted-foreground">
              Assign a class and subject to {teacherId} for {day}, {period}.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="class">Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between">
            {entry && (
               <Button variant="ghost" size="icon" onClick={handleClear} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function TeacherScheduleEditor() {
  const store = useTimetableStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [teacherInput, setTeacherInput] = useState('');
  const [classInput, setClassInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');

  const handleAdd = (
    value: string,
    list: string[],
    setter: (newList: string[]) => void,
    inputSetter: (value: string) => void,
    listName: string
  ) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !list.map(i => i.toLowerCase()).includes(trimmedValue.toLowerCase())) {
        setter([...list, trimmedValue]);
        inputSetter('');
    } else if (list.map(i => i.toLowerCase()).includes(trimmedValue.toLowerCase())) {
        toast({
            variant: 'destructive',
            title: 'Duplicate Entry',
            description: `${trimmedValue} already exists in the ${listName} list.`,
        });
    }
  };

  const handleRemove = (
      itemToRemove: string,
      list: string[],
      setter: (newList: string[]) => void
  ) => {
      setter(list.filter((item) => item !== itemToRemove));
  };
  
  const handleOptimize = async () => {
    setIsLoading(true);
    store.generateClassSchedules(); // Ensure class schedules are up to date before optimizing
    const currentState = useTimetableStore.getState();

    const result = await optimizeTimetableAction({
        teachers: currentState.teachers,
        classes: currentState.classes,
        teacherSchedules: currentState.teacherSchedules,
        classSchedules: currentState.classSchedules,
    });
    
    if (result.success && result.data) {
        store.setOptimizedSchedules(result.data.teacherSchedules, result.data.classSchedules);
        toast({
            title: "AI Optimization Complete",
            description: (
              <div className="flex flex-col gap-2">
                <p>Timetables have been optimized.</p>
                <Alert>
                  <Bot className="h-4 w-4" />
                  <AlertTitle>Optimization Summary</AlertTitle>
                  <AlertDescription>{result.data.summary}</AlertDescription>
                </Alert>
              </div>
            )
        });
    } else {
        toast({
            variant: "destructive",
            title: "AI Optimization Failed",
            description: result.error || "An unknown error occurred.",
        });
    }

    setIsLoading(false);
  };


  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Teacher Schedules</h1>
        <p className="text-muted-foreground">Manage teachers, classes, and their weekly schedules.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Manage Teachers, Classes & Subjects</CardTitle>
          <CardDescription>Add or remove items. Type a name and press Enter to add. Click the 'x' on a badge to remove. Changes are saved automatically.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
           <div className="space-y-2">
            <Label htmlFor="teachers-input">
              <Users className="inline-block mr-2 h-4 w-4" />
              Teachers
            </Label>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[40px]">
                {store.teachers.map((teacher) => (
                  <Badge key={teacher} variant="secondary" className="flex items-center gap-1">
                    {teacher}
                    <button
                      onClick={() => handleRemove(teacher, store.teachers, store.setTeachers)}
                      className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                      aria-label={`Remove ${teacher}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                id="teachers-input"
                value={teacherInput}
                onChange={(e) => setTeacherInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd(teacherInput, store.teachers, store.setTeachers, setTeacherInput, 'teacher');
                  }
                }}
                placeholder="Add a teacher..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="classes-input">
              <Building className="inline-block mr-2 h-4 w-4" />
              Classes
            </Label>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[40px]">
                {store.classes.map((c) => (
                  <Badge key={c} variant="secondary" className="flex items-center gap-1">
                    {c}
                    <button
                      onClick={() => handleRemove(c, store.classes, store.setClasses)}
                      className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                      aria-label={`Remove ${c}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                id="classes-input"
                value={classInput}
                onChange={(e) => setClassInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd(classInput, store.classes, store.setClasses, setClassInput, 'class');
                  }
                }}
                placeholder="Add a class..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjects-input">
              <Book className="inline-block mr-2 h-4 w-4" />
              Subjects
            </Label>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1 p-2 border rounded-md min-h-[40px]">
                {store.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                    {subject}
                    <button
                      onClick={() => handleRemove(subject, store.subjects, store.setSubjects)}
                      className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                      aria-label={`Remove ${subject}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                id="subjects-input"
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd(subjectInput, store.subjects, store.setSubjects, setSubjectInput, 'subject');
                  }
                }}
                placeholder="Add a subject..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Timetable Editor</CardTitle>
            <CardDescription>Click a cell to assign a class and subject. Clashes will be automatically prevented.</CardDescription>
          </div>
          <div className="flex gap-2">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Reset
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will clear all current schedule entries. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => store.resetSchedules()}>
                            Yes, reset schedules
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button onClick={handleOptimize} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Optimize with AI
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {store.teachers.length > 0 ? (
            <div className="overflow-x-auto relative">
              <Table className="border-collapse border border-border">
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 border">Teacher</TableHead>
                    {store.days.map(day => (
                      <TableHead key={day} colSpan={store.periods.length} className="text-center border">{day}</TableHead>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 border"></TableHead>
                    {store.days.map(day => store.periods.map(period => (
                      <TableHead key={`${day}-${period}`} className="text-center border">{period}</TableHead>
                    )))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {store.teachers.map(teacher => (
                    <TableRow key={teacher}>
                      <TableHead className="sticky left-0 bg-background z-10 border font-semibold">{teacher}</TableHead>
                      {store.days.map(day => store.periods.map(period => (
                        <ScheduleCell key={`${teacher}-${day}-${period}`} teacherId={teacher} day={day} period={period} />
                      )))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No Teachers Found</AlertTitle>
              <AlertDescription>Please add teachers in the management section above to start building the timetable.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
