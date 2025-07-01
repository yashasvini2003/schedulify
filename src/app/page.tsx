'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, ArrowRight, LayoutDashboard, FileText, CalendarClock } from 'lucide-react';
import { useTimetableStore } from '@/hooks/use-timetable-store';

export default function Home() {
  const { teachers, classes, teacherSchedules } = useTimetableStore();

  const isGenerated = Object.values(teacherSchedules).some(teacherSchedule => 
    Object.values(teacherSchedule).some(daySchedule => 
      Object.values(daySchedule).some(entry => entry !== null)
    )
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <main className="flex-grow">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
            ChronoFlow Academy
          </h1>
          <p className="mt-3 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Welcome to your unified dashboard for intelligent timetable management.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Timetables Status</CardTitle>
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${isGenerated ? 'text-green-600' : 'text-amber-600'}`}>
                {isGenerated ? 'Generated' : 'Not Generated'}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
          <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <CalendarClock className="text-primary h-6 w-6" />
                </div>
                Manage Schedules
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                The central hub for all scheduling. Add teachers, classes, subjects, and assign periods in the master timetable editor.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/teacher-schedule">
                  Go to Editor <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <FileText className="text-primary h-6 w-6" />
                </div>
                Teacher Timetables
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                View individual timetables for all teachers. See their assigned classes, free periods, and export schedules.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/teacher-timetable">
                  View Timetables <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                 <div className="bg-primary/10 p-2 rounded-lg">
                  <BookOpen className="text-primary h-6 w-6" />
                </div>
                Class Schedules
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                Generate and view class-wise timetables based on teacher assignments. Perfect for sharing with students.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/class-schedule">
                  View Schedules <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <footer className="text-center py-6 mt-auto">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ChronoFlow. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
