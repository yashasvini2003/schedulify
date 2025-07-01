'use client';

import { useTimetableStore } from '@/hooks/use-timetable-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Download, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ClassScheduleViewer() {
  const { classSchedules, days, periods, classes } = useTimetableStore();
  const { toast } = useToast();

  const handleExport = (format: 'PDF' | 'Excel') => {
    toast({
        title: "Export Initiated (Demo)",
        description: `This is a placeholder. In a real app, the timetables would be exported to ${format}.`,
    });
    console.log(`Exporting all class timetables as ${format}...`);
    console.log(classSchedules);
  };

  const hasSchedules = Object.keys(classSchedules).length > 0;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Class Schedules</h1>
          <p className="text-muted-foreground">View and export timetables for each class.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('PDF')} disabled={!hasSchedules}>
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
                                            <TableCell key={period} className="h-16 w-32 border text-center">
                                                {entry ? (
                                                    <div className="text-xs">
                                                        <p className="font-bold text-primary">{entry.teacherId}</p>
                                                        <p className="text-muted-foreground">{entry.subject}</p>
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
                    <AlertTitle>No Class Schedules Generated</AlertTitle>
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
