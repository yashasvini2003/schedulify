'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTimetableStore } from '@/hooks/use-timetable-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Book, Building, Trash2, Users, Wand2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import type { ScheduleEntry } from '@/types';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';

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
  const router = useRouter();
  const store = useTimetableStore();
  const { toast } = useToast();
  
  const [localTeachers, setLocalTeachers] = useState(store.teachers.join('\n'));
  const [localClasses, setLocalClasses] = useState(store.classes.join('\n'));
  const [localSubjects, setLocalSubjects] = useState(store.subjects.join('\n'));

  useEffect(() => {
    setLocalTeachers(store.teachers.join('\n'));
  }, [store.teachers]);
  
  useEffect(() => {
    setLocalClasses(store.classes.join('\n'));
  }, [store.classes]);

  useEffect(() => {
    setLocalSubjects(store.subjects.join('\n'));
  }, [store.subjects]);

  const handleUpdateLists = () => {
    const processList = (text: string, name: string): string[] => {
      const items = text.split('\n').map(item => item.trim()).filter(Boolean);
      const uniqueItems = [...new Set(items)];
      if (items.length > uniqueItems.length) {
          toast({
              variant: "default",
              title: `Duplicate ${name} removed`,
              description: `Duplicate entries in the ${name} list were automatically removed.`,
          });
      }
      return uniqueItems;
    };
    
    store.setTeachers(processList(localTeachers, 'teacher'));
    store.setClasses(processList(localClasses, 'class'));
    store.setSubjects(processList(localSubjects, 'subject'));

    toast({
        title: "Lists Updated",
        description: "The timetable editor has been updated with the new lists."
    });
  };
  
  const handleGenerateAndNavigate = () => {
    store.generateClassSchedules();
    router.push('/class-schedule');
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
          <CardDescription>Enter one item per line. Click 'Update Lists' to apply changes to the timetable editor below.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
           <div className="space-y-2">
            <Label htmlFor="teachers-list">
              <Users className="inline-block mr-2 h-4 w-4" />
              Teachers
            </Label>
            <Textarea id="teachers-list" value={localTeachers} onChange={(e) => setLocalTeachers(e.target.value)} rows={5} placeholder="Enter one teacher per line..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="classes-list">
              <Building className="inline-block mr-2 h-4 w-4" />
              Classes
            </Label>
             <Textarea id="classes-list" value={localClasses} onChange={(e) => setLocalClasses(e.target.value)} rows={5} placeholder="Enter one class per line..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjects-list">
              <Book className="inline-block mr-2 h-4 w-4" />
              Subjects
            </Label>
            <Textarea id="subjects-list" value={localSubjects} onChange={(e) => setLocalSubjects(e.target.value)} rows={5} placeholder="Enter one subject per line..." />
          </div>
        </CardContent>
        <CardFooter>
            <Button onClick={handleUpdateLists}>Update Lists</Button>
        </CardFooter>
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
            <Button onClick={handleGenerateAndNavigate}>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Class Timetable
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
