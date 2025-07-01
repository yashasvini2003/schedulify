'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { ChronoFlowLogo } from '@/components/icons';
import { BookOpen, LayoutDashboard, Users, FileText } from 'lucide-react';
import { Button } from '../ui/button';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/teacher-schedule', label: 'Teacher Schedules', icon: Users },
  { href: '/teacher-timetable', label: 'Teacher Timetables', icon: FileText },
  { href: '/class-schedule', label: 'Class Timetables', icon: BookOpen },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href="/">
                <ChronoFlowLogo className="h-5 w-5 text-primary" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold tracking-tight">ChronoFlow</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
