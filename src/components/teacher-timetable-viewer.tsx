'use client';

import { useTimetableStore } from '@/hooks/use-timetable-store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Download, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function TeacherTimetableViewer() {
  const { teacherSchedules, days, periods, teachers } = useTimetableStore();
  const { toast } = useToast();
  const router = useRouter();

  const handleExport = (format: 'PDF') => {
    toast({
        title: "Export Initiated (Demo)",
        description: `This is a placeholder. In a real app, the timetables would be exported to ${format}.`,
    });
    console.log(`Exporting all teacher timetables as ${format}...`);
    console.log(teacherSchedules);
  };

  const hasSchedules = Object.keys(teacherSchedules).some(teacherId => 
    Object.values(teacherSchedules[teacherId]).some(daySchedule => 
      Object.values(daySchedule).some(period => period !== null)
    )
  );

  return (
    <div className="flex flex-col gap-8">
       <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Teacher Timetables</h1>
          <p className="text-muted-foreground mt-1">
            View and export timetables for each teacher.
          </p>
        </div>
        <div className="flex gap-2">
            <Button onClick={() => router.push('/teacher-schedule')}>
              Go to Timetable Editor
            </Button>
            <Button variant="outline" onClick={() => handleExport('PDF')} disabled={!hasSchedules}>
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>
        </div>
      </header>
      
      {hasSchedules ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teachers.map(teacherId => (
            <Card key={teacherId}>
              <CardHeader>
                <CardTitle>{`Teacher: ${teacherId}`}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto relative">
                    <Table className="border">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="border">Day</TableHead>
                                {periods.map(period => (
                                    <TableHead key={period} className="text-center border">{period}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {days.map(day => (
                                <TableRow key={day}>
                                    <TableHead className="font-semibold border">{day}</TableHead>
                                    {periods.map(period => {
                                        const entry = teacherSchedules[teacherId]?.[day]?.[period];
                                        return (
                                            <TableCell key={period} className="h-24 w-32 border text-center">
                                                {entry ? (
                                                    <div className="text-xs space-y-1">
                                                        <p className="font-bold text-primary">{entry.classId}</p>
                                                        <p className="text-muted-foreground">{entry.subject}</p>
                                                        {entry.note && <p className="text-muted-foreground italic truncate mt-1 text-left border-l-2 pl-2">{entry.note}</p>}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground">Free Period</p>
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-8">
            <CardContent className="pt-6">
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No Teacher Schedules Found</AlertTitle>
                    <AlertDescription>
                        Go to the Timetable Editor page to create timetables for teachers.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
