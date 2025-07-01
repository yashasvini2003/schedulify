import ClassScheduleViewer from "@/components/class-schedule-viewer";

export const metadata = {
  title: "Class Schedules | ChronoFlow",
  description: "View and export generated class timetables.",
};

export default function ClassSchedulePage() {
    return <ClassScheduleViewer />;
}
