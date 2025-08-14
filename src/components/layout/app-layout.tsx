// 'use client';

// import React, { useState, useEffect } from 'react';
// import { usePathname } from 'next/navigation';
// import Link from 'next/link';
// import {
//   SidebarProvider,
//   Sidebar,
//   SidebarHeader,
//   SidebarContent,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarMenuButton,
//   SidebarInset,
// } from '@/components/ui/sidebar';
// import { SchedulifyLogo } from '@/components/icons';
// import { BookOpen, LayoutDashboard, Users, FileText } from 'lucide-react';
// import { Button } from '../ui/button';

// const navItems = [
//   { href: '/', label: 'Dashboard', icon: LayoutDashboard },
//   { href: '/teacher-schedule', label: 'Timetable Editor', icon: Users },
//   { href: '/teacher-timetable', label: 'Teacher Timetables', icon: FileText },
//   { href: '/class-schedule', label: 'Class Timetable', icon: BookOpen },
// ];

// export default function AppLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();
//   const [isMounted, setIsMounted] = useState(false);

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   return (
//     <SidebarProvider>
//       <Sidebar>
//         <SidebarHeader>
//           <div className="flex items-center gap-2 p-2">
//             <Button variant="ghost" size="icon" className="shrink-0" asChild>
//               <Link href="/">
//                 <SchedulifyLogo className="h-5 w-5 text-primary" />
//               </Link>
//             </Button>
//             <h1 className="text-lg font-semibold tracking-tight">Schedulify</h1>
//           </div>
//         </SidebarHeader>
//         <SidebarContent>
//           <SidebarMenu>
//             {navItems.map((item) => (
//               <SidebarMenuItem key={item.href}>
//                 <SidebarMenuButton
//                   asChild
//                   isActive={isMounted ? pathname === item.href : false}
//                   tooltip={item.label}
//                 >
//                   <Link href={item.href}>
//                     <item.icon />
//                     <span>{item.label}</span>
//                   </Link>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//             ))}
//           </SidebarMenu>
//         </SidebarContent>
//       </Sidebar>
//       <SidebarInset>
//         <div className="p-4 sm:p-6 lg:p-8">{children}</div>
//       </SidebarInset>
//     </SidebarProvider>
//   );
// }


'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, Users, FileText } from 'lucide-react';
import { SchedulifyLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/teacher-schedule', label: 'Timetable Editor', icon: Users },
  { href: '/teacher-timetable', label: 'Teacher Timetables', icon: FileText },
  { href: '/class-schedule', label: 'Class Timetable', icon: BookOpen },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex min-h-screen">
        <aside
          className={`bg-background border-r transition-all duration-300 ease-in-out flex flex-col ${
            isCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div className="h-full flex flex-col">
            <header 
              className="p-4 border-b flex items-center gap-2 cursor-pointer"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <SchedulifyLogo className="h-8 w-8 text-primary flex-shrink-0" />
              {!isCollapsed && <span className="text-xl font-bold text-primary">Schedulify</span>}
            </header>
            <nav className="flex-grow p-2">
              <ul>
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            pathname === item.href
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          } ${isCollapsed ? 'justify-center' : ''}`}
                        >
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" align="center">
                          {item.label}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/20">{children}</main>
      </div>
    </TooltipProvider>
  );
}
