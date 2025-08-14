import TeacherTimetableViewer from "@/components/teacher-timetable-viewer";

export const metadata = {
  title: "Teacher Timetables | ChronoFlow",
  description: "View individual teacher timetables.",
};

export default function TeacherTimetablePage({
    params,
    searchParams,
  }: {
    params: { slug: string };
    searchParams: { [key: string]: string | string[] | undefined };
  }) {
    return <TeacherTimetableViewer />;
}
