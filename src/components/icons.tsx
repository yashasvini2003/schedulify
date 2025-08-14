import type { SVGProps } from "react";

export function ChronoFlowLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M8 7v5" />
      <path d="M12 7v5" />
      <path d="M16 7v5" />
      <path d="M8 17h8" />
    </svg>
  );
}

export function MadaanInternationalSchoolLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="50" cy="50" r="48" fill="hsl(var(--primary))" />
      <image
        href="/public/school-logo.png"
        x="25"
        y="25"
        width="50"
        height="50"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}
