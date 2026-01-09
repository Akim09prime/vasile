
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, FolderKanban, Newspaper, Settings, Mail, PlusCircle, Database, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { seedDatabase } from "@/lib/services/project-service";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";
import AdminPermissionDiagnostic from "./_components/PermissionDiagnostic";

const quickActions = [
    { title: 'New Project', description: 'Add a project to the portfolio.', icon: <PlusCircle/>, href: '/admin/projects'},
    { title: 'View Leads', description: 'View received quote requests.', icon: <Mail/>, href: '/admin/leads'},
    { title: 'Contact Messages', description: 'View messages from contact form.', icon: <MessageSquare/>, href: '/admin/contact-messages'},
    { title: 'General Settings', description: 'Manage menus and categories.', icon: <Settings/>, href: '/admin/settings'},
]

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = React.useState(false);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      await seedDatabase();
      toast({ title: 'Success', description: 'Database has been seeded with initial data.'});
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not seed database." });
    } finally {
      setIsSeeding(false);
    }
  }
  
  return (
      <div className="p-4 md:p-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.displayName || user?.email}! Here's an overview of your site.</p>
        
        <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">published projects in portfolio</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">unread quote requests</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Published Pages</CardTitle>
                    <Newspaper className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">8</div>
                    <p className="text-xs text-muted-foreground">custom and system pages</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Visitors (30 days)</CardTitle>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+1,234</div>
                    <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
            </Card>
        </div>

        <div className="mt-8">
            <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
            <div className="grid gap-6 mt-4 md:grid-cols-2 lg:grid-cols-4">
                {quickActions.map(action => (
                     <Card key={action.title} className="group hover:border-primary/50 transition-colors">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                 <div className="flex flex-col">
                                     <CardTitle className="text-lg">{action.title}</CardTitle>
                                     <CardDescription>{action.description}</CardDescription>
                                 </div>
                                <div className="p-2 bg-secondary/50 rounded-lg text-primary">
                                    {action.icon}
                                </div>
                            </div>
                        </CardHeader>
                        <CardFooter>
                            <Button variant="ghost" asChild className="p-0 h-auto">
                                <Link href={action.href}>
                                    Execute
                                    <ArrowUpRight className="w-4 h-4 ml-1"/>
                                </Link>
                            </Button>
                        </CardFooter>
                     </Card>
                ))}
            </div>
        </div>

        <div className="mt-8">
             <Card>
                <CardHeader>
                    <CardTitle>Database Management</CardTitle>
                    <CardDescription>Use this to populate your Firestore database with the initial sample data if it's empty. This will add projects and site settings.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Button onClick={handleSeedDatabase} disabled={isSeeding}>
                        <Database className="mr-2 h-4 w-4" /> 
                        {isSeeding ? 'Seeding...' : 'Seed Database'}
                    </Button>
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground">This action will add sample projects and default settings. It will not overwrite existing data with the same ID.</p>
                 </CardFooter>
             </Card>
        </div>

        <AdminPermissionDiagnostic />
      </div>
  );
}
