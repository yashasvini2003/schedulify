import TeacherScheduleEditor from "@/components/teacher-schedule-editor";

export const metadata = {
  title: "Timetable Editor",
  description: "The central hub for all scheduling.",
};

export default function TeacherSchedulePage({
    params,
    searchParams,
  }: {
    params: { slug: string };
    searchParams: { [key: string]: string | string[] | undefined };
  }) {
    return <TeacherScheduleEditor />;
}
