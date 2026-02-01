import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X, MoreHorizontal, User, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

// Mock Sidebar Item Component (Recursive later)
const SidebarItem = ({ title }: { title: string }) => (
    <div className="flex items-center px-4 py-2 hover:bg-muted/50 cursor-pointer rounded-sm text-sm group">
        <span className="truncate flex-1">{title}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="h-4 w-4" />
        </Button>
    </div>
);

export default function AppShell() {
    const { isSidebarOpen, toggleSidebar } = useUIStore();
    const { user, logout } = useAuthStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            {/* Sidebar */}
            <aside
                className={cn(
                    "border-r bg-muted/10 transition-all duration-300 flex flex-col",
                    isSidebarOpen ? "w-64" : "w-0 overflow-hidden"
                )}
            >
                {/* Sidebar Header */}
                <div className="p-4 flex items-center gap-2 border-b">
                    <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {user?.name?.charAt(0) || "N"}
                    </div>
                    <span className="font-semibold truncate text-sm flex-1">{user?.email}'s Workspace</span>
                </div>

                {/* Sidebar Content */}
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                            Favorites
                        </div>
                        <SidebarItem title="Project Roadmap" />
                        <SidebarItem title="Personal Goals" />

                        <div className="mt-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase flex justify-between items-center group">
                            <span>Private</span>
                            <Plus className="h-4 w-4 cursor-pointer hover:text-foreground opacity-0 group-hover:opacity-100" />
                        </div>
                        <SidebarItem title="Meeting Notes" />
                        <SidebarItem title="Ideas" />
                        <SidebarItem title="Journal" />
                    </div>
                </ScrollArea>

                {/* Sidebar Footer */}
                <div className="p-2 border-t mt-auto">
                    <Button variant="ghost" className="w-full justify-start gap-2" size="sm">
                        <Plus className="h-4 w-4" /> New Page
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" size="sm" onClick={() => logout()}>
                        <User className="h-4 w-4" /> Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 h-full">
                {/* Topbar */}
                <header className="h-14 border-b flex items-center justify-between px-4 bg-background z-10">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
                            {isSidebarOpen ? <Menu className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </Button>

                        {/* Breadcrumbs Placeholder */}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span>Workspace</span>
                            <span>/</span>
                            <span className="text-foreground font-medium">Dashboard</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground hidden sm:block">
                            Edited 2m ago
                        </div>
                        <ModeToggle />
                        <Button variant="outline" size="sm" className="hidden sm:flex">
                            Share
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
