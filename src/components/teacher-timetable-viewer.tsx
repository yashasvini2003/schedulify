'use client';

import { useEffect } from 'react';
import { useTimetableStore } from '@/hooks/use-timetable-store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Download, AlertTriangle, Users, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Skeleton } from './ui/skeleton';

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-64 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-44" />
          <Skeleton className="h-10 w-32" />
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card><CardContent className="p-6"><Skeleton className="h-96 w-full" /></CardContent></Card>
        <Card><CardContent className="p-6"><Skeleton className="h-96 w-full" /></CardContent></Card>
      </div>
    </div>
  );
}

export default function TeacherTimetableViewer() {
  const store = useTimetableStore();
  const { teacherSchedules, days, periods, teachers, isInitialized, initialize } = store;
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleExport = () => {
    const doc = new jsPDF();
    
    teachers.forEach((teacherId, index) => {
        if (index > 0) {
            doc.addPage();
        }

        doc.setFontSize(18);
        doc.text(`Timetable for: ${teacherId}`, 14, 22);

        const tableHead = [['Day', ...periods]];
        const tableBody = days.map(day => {
            const row: string[] = [day];
            periods.forEach(period => {
                const entry = teacherSchedules[teacherId]?.[day]?.[period];
                if (entry) {
                    let cellText = `${entry.classId}\n${entry.subject}`;
                    if(entry.note) {
                        cellText += `\n(${entry.note})`;
                    }
                    row.push(cellText);
                } else {
                    row.push('Free Period');
                }
            });
            return row;
        });

        autoTable(doc, {
            head: tableHead,
            body: tableBody,
            startY: 30,
            styles: { cellPadding: 2, fontSize: 8, valign: 'middle', halign: 'center' },
            headStyles: { fillColor: [166, 96, 58] },
        });
    });

    doc.save('teacher-timetables.pdf');
    toast({
        title: "Export Successful",
        description: "Teacher timetables have been exported as a PDF.",
    });
  };

  if (!isInitialized) {
    return <LoadingSkeleton />;
  }

  const hasSchedules = Object.keys(teacherSchedules).some(teacherId => 
    Object.values(teacherSchedules[teacherId]).some(daySchedule => 
      Object.values(daySchedule).some(period => period !== null)
    )
  );

  return (
    <div className="flex flex-col gap-8">
       <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-grow">
          <h1 className="text-3xl font-bold tracking-tight text-primary">Teacher Timetables</h1>
          <p className="text-muted-foreground mt-1">
            View and export timetables for each teacher.
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
            <Button onClick={() => router.push('/teacher-schedule')}>
              Go to Timetable Editor
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={!hasSchedules}>
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
