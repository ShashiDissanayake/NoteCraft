import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, MoreHorizontal, Plus, LogOut, ChevronRight, File, Trash, ChevronsLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { usePageStore } from "@/store/usePageStore";
import type { Page } from "@/store/usePageStore";
import { cn } from "@/lib/utils";

// Sidebar Item Component
const SidebarItem = ({ page, level = 0 }: { page: Page; level?: number }) => {
    const { pages, createPage, deletePage } = usePageStore();
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    // Find children
    const childPages = pages.filter(p => p.parent === page._id);
    const hasChildren = childPages.length > 0;

    const handleExpand = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const handleCreateChild = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const newPage = await createPage(page._id);
        if (newPage) {
            setIsExpanded(true);
            navigate(`/pages/${newPage._id}`);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await deletePage(page._id);
        navigate('/');
    };

    return (
        <div className="select-none">
            <div
                className={cn(
                    "group flex items-center gap-x-2 py-1 pr-3 text-sm font-medium hover:bg-muted/50 text-muted-foreground hover:text-foreground cursor-pointer rounded-sm w-full transition-colors",
                )}
                style={{ paddingLeft: `${level * 12 + 12}px` }}
                onClick={() => navigate(`/pages/${page._id}`)}
            >
                <div
                    role="button"
                    className="h-full rounded-sm hover:bg-neutral-200 dark:hover:bg-neutral-600 p-0.5"
                    onClick={handleExpand}
                >
                    <ChevronRight className={cn("h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform", isExpanded && "rotate-90")} />
                </div>

                {page.icon ? (
                    <span className="shrink-0 text-[18px] mr-1">{page.icon}</span>
                ) : (
                    <File className="h-4 w-4 shrink-0 text-muted-foreground mr-1" />
                )}

                <span className="truncate">{page.title}</span>

                <div className="ml-auto flex items-center gap-x-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <div role="button" className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-200 dark:hover:bg-neutral-600">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48" align="start" side="right" forceMount>
                            <DropdownMenuItem onClick={handleDelete}>
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleCreateChild}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add child page
                            </DropdownMenuItem>
                            <div className="text-xs text-muted-foreground p-2">
                                Last edited by {page.owner}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div
                        role="button"
                        onClick={handleCreateChild}
                        className="opacity-0 group-hover:opacity-100 h-full rounded-sm hover:bg-neutral-200 dark:hover:bg-neutral-600"
                    >
                        <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div>
                    {childPages.length === 0 ? (
                        <p
                            className="text-xs text-muted-foreground/50 py-1"
                            style={{ paddingLeft: `${(level + 1) * 12 + 25}px` }}
                        >
                            No pages inside
                        </p>
                    ) : (
                        childPages.map(child => (
                            <SidebarItem key={child._id} page={child} level={level + 1} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default function AppShell() {
    const { isSidebarOpen, toggleSidebar } = useUIStore();
    const { user, logout } = useAuthStore();
    const { pages, fetchPages, createPage } = usePageStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPages();
    }, [fetchPages]);

    const handleCreatePage = async () => {
        const newPage = await createPage();
        if (newPage) {
            navigate(`/pages/${newPage._id}`);
        }
    };

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
                <div className="p-4 flex items-center gap-2 border-b hover:bg-muted/50 transition cursor-pointer">
                    <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {user?.name?.charAt(0) ?? "N"}
                    </div>
                    <span className="font-semibold truncate text-sm flex-1">
                        {user?.email ? `${user.email}'s Workspace` : "Workspace"}
                    </span>
                    <ChevronsLeft className="h-4 w-4" onClick={toggleSidebar} />
                </div>

                {/* Sidebar Content */}
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase flex justify-between items-center group">
                            <span>Private</span>
                            <Plus
                                className="h-4 w-4 cursor-pointer hover:text-foreground opacity-0 group-hover:opacity-100 transition"
                                onClick={handleCreatePage}
                            />
                        </div>

                        {/* Render Root Pages (parent === null) */}
                        {pages.filter(p => !p.parent).map(page => (
                            <SidebarItem key={page._id} page={page} />
                        ))}

                        {pages.length === 0 && (
                            <div className="px-4 py-2 text-sm text-muted-foreground">
                                No pages created yet.
                            </div>
                        )}

                    </div>
                </ScrollArea>

                {/* Sidebar Footer */}
                <div className="p-2 border-t mt-auto space-y-1">
                    <Button variant="ghost" className="w-full justify-start gap-2" size="sm" onClick={handleCreatePage}>
                        <Plus className="h-4 w-4" /> New Page
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        size="sm"
                        onClick={() => logout()}
                    >
                        <LogOut className="h-4 w-4" /> Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-full">
                {/* Topbar */}
                <header className="h-14 border-b flex items-center justify-between px-4 bg-background z-10">
                    <div className="flex items-center gap-2">
                        {!isSidebarOpen && (
                            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
                                <Menu className="h-4 w-4" />
                            </Button>
                        )}

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

// Helper icon not in original imports, need to add if missing
