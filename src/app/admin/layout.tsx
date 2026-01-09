
'use client';

import * as React from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutDashboard, FolderKanban, Newspaper, Settings, Mail, LogOut, Home, MessageSquare, Wrench } from 'lucide-react';
import Link from 'next/link';
import withAuth from '@/components/auth/withAuth';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import AdminPermissionGate from './_components/AdminPermissionGate';

function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const isActive = (path: string) => pathname === path || (path !== '/admin' && pathname.startsWith(path));

    const loginOrSetupPage = pathname === '/admin/login' || pathname === '/admin/setup';

    // The login/setup page should not display the full dashboard layout
    if (loginOrSetupPage) {
        return <>{children}</>;
    }
    
    if (!user) {
        // This can happen briefly on first load, or after logout
        // withAuth should handle redirection, but this prevents layout flicker
        return <>{children}</>;
    }

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <div className="flex items-center justify-between">
                         <Logo />
                         <SidebarTrigger />
                    </div>
                </SidebarHeader>
                <SidebarContent className="p-2">
                    <SidebarMenu>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={pathname === '/admin'} tooltip={{children: 'Dashboard'}}>
                                <Link href="/admin"><LayoutDashboard /><span>Dashboard</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                         <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/admin/projects')} tooltip={{children: 'Projects'}}>
                                <Link href="/admin/projects"><FolderKanban /><span>Projects</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/admin/pages')} tooltip={{children: 'Pages'}} aria-disabled>
                                 <a href="#" aria-disabled="true" onClick={(e) => e.preventDefault()}><Newspaper /><span>Pages</span></a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/admin/leads')} tooltip={{children: 'Leads'}}>
                                 <Link href="/admin/leads"><Mail /><span>Leads</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/admin/contact-messages')} tooltip={{children: 'Contact Messages'}}>
                                 <Link href="/admin/contact-messages"><MessageSquare /><span>Contact Messages</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild isActive={isActive('/admin/settings')} tooltip={{children: 'Settings'}}>
                                <Link href="/admin/settings"><Settings /><span>Settings</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
                 <div className="mt-auto p-2">
                    <SidebarMenu>
                         <SidebarMenuItem>
                           <SidebarMenuButton asChild isActive={isActive('/admin/setup')} tooltip={{children: 'Admin Setup'}}>
                             <Link href="/admin/setup"><Wrench /><span>Admin Setup</span></Link>
                           </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                           <SidebarMenuButton asChild tooltip={{children: 'View Site'}}>
                             <a href="/" target="_blank" rel="noopener noreferrer"><Home /><span>View Site</span></a>
                           </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                           <SidebarMenuButton onClick={logout} tooltip={{children: 'Logout'}}>
                               <LogOut /><span>Logout</span>
                           </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    <div className="flex items-center gap-3 p-2 mt-2 border-t border-sidebar-border">
                        <Avatar className="h-8 w-8">
                             <AvatarImage src={user?.photoURL || undefined} alt="Admin" />
                             <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-sm truncate">
                             <span className="font-medium">{user?.displayName || 'Admin'}</span>
                             <span className="text-muted-foreground truncate">{user?.email}</span>
                        </div>
                    </div>
                 </div>
            </Sidebar>
            <SidebarInset>
                <AdminPermissionGate>
                    {children}
                </AdminPermissionGate>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default withAuth(AdminDashboardLayout);
