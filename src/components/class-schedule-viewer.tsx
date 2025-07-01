'use client';

import { useEffect } from 'react';
import { useTimetableStore } from '@/hooks/use-timetable-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Download, AlertTriangle } from 'lucide-react';
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

export default function ClassScheduleViewer() {
  const store = useTimetableStore();
  const { classSchedules, days, periods, classes, isInitialized, initialize } = store;
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleExport = () => {
    const doc = new jsPDF();
    
    classes.forEach((classId, index) => {
        if (index > 0) {
            doc.addPage();
        }

        doc.setFontSize(18);
        doc.text(`Timetable for Class: ${classId}`, 14, 22);

        const tableHead = [['Day', ...periods]];
        const tableBody = days.map(day => {
            const row = [day];
            periods.forEach(period => {
                const entry = classSchedules[classId]?.[day]?.[period];
                if (entry) {
                    let cellText = `${entry.teacherId}\n${entry.subject}`;
                     if(entry.note) {
                        cellText += `\n(${entry.note})`;
                    }
                    row.push(cellText);
                } else {
                    row.push('');
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

    doc.save('class-timetables.pdf');
    toast({
        title: "Export Successful",
        description: "Class timetables have been exported as a PDF.",
    });
  };

  if (!isInitialized) {
    return <LoadingSkeleton />;
  }
  
  const hasSchedules = Object.keys(classSchedules).length > 0;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Class Timetable</h1>
          <p className="text-muted-foreground">View and export timetables for each class.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/teacher-schedule')}>
            Go to Timetable Editor
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={!hasSchedules}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </header>
      
      {hasSchedules ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {classes.map(classId => (
            <Card key={classId}>
              <CardHeader>
                <CardTitle>{`Class: ${classId}`}</CardTitle>
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
                                        const entry = classSchedules[classId]?.[day]?.[period];
                                        return (
                                            <TableCell key={period} className="h-24 w-32 border text-center">
                                                {entry ? (
                                                    <div className="text-xs space-y-1">
                                                        <p className="font-bold text-primary">{entry.teacherId}</p>
                                                        <p className="text-muted-foreground">{entry.subject}</p>
                                                        {entry.note && <p className="text-muted-foreground italic truncate mt-1 text-left border-l-2 pl-2">{entry.note}</p>}
                                                    </div>
                                                ) : null}
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
                    <AlertTitle>No Class Timetables Generated</AlertTitle>
                    <AlertDescription>
                        Go to the Teacher Schedules page to assign teachers to classes and then generate the class timetables.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
