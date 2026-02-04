import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface PresenceUser {
    socketId: string;
    userId: string;
    userName: string;
    avatarUrl?: string;
}

interface PresenceAvatarsProps {
    users: PresenceUser[];
    currentUserId?: string;
}

export default function PresenceAvatars({
    users,
    currentUserId,
}: PresenceAvatarsProps) {
    // Filter out current user and remove duplicates
    const otherUsers = users.filter(
        (user, index, self) =>
            user.userId !== currentUserId &&
            index === self.findIndex((u) => u.userId === user.userId)
    );

    if (otherUsers.length === 0) return null;

    return (
        <TooltipProvider>
            <div className="flex items-center -space-x-2">
                {otherUsers.slice(0, 3).map((user) => (
                    <Tooltip key={user.userId}>
                        <TooltipTrigger asChild>
                            <Avatar className="h-7 w-7 border-2 border-background">
                                <AvatarImage src={user.avatarUrl} />
                                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                    {user.userName?.charAt(0)?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{user.userName}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
                {otherUsers.length > 3 && (
                    <div className="h-7 w-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs">
                        +{otherUsers.length - 3}
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}
