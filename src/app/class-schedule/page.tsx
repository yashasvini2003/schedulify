import ClassScheduleViewer from "@/components/class-schedule-viewer";

export const metadata = {
  title: "Class Timetable",
  description: "View and export generated class timetables.",
};

export default function ClassSchedulePage({
    params,
    searchParams,
  }: {
    params: { slug: string };
    searchParams: { [key: string]: string | string[] | undefined };
  }) {
    return <ClassScheduleViewer />;
}
