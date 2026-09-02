import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatIsoDuration } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, Play, Trash2, User } from "lucide-react";
import { router } from "@inertiajs/react";
import { destroy } from "@/routes/song";
import React from "react";

export interface SongCardProps {
    song: Song & { guest: Guest };
    isCurrent?: boolean;
    isPlaying?: boolean;
    isPast?: boolean;
    canDelete?: boolean;
    isQueuedByCurrentGuest?: boolean;
    onClick?: () => void;
    className?: string;
}

export const SongCard = React.forwardRef<HTMLDivElement, SongCardProps>(
    (
        {
            song,
            isCurrent = false,
            isPlaying = false,
            isPast = false,
            canDelete = true,
            isQueuedByCurrentGuest = false,
            onClick,
            className = "",
        },
        ref
    ) => {
        const handleDelete = (e: React.MouseEvent) => {
            e.stopPropagation();
            router.delete(
                destroy({
                    id: song.id,
                })
            );
        };

        return (
            <div
                ref={ref}
                onClick={onClick}
                className={`group relative flex items-center gap-3 rounded-xl border p-3 transition-all select-none ${
                    onClick ? "cursor-pointer" : ""
                } ${
                    isCurrent
                        ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/30"
                        : isPast
                        ? "border-border/40 bg-muted/30 opacity-75 hover:opacity-100 hover:bg-accent/60"
                        : "border-border/60 bg-card hover:border-border hover:bg-accent/70 shadow-2xs"
                } ${className}`}
            >
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-muted shadow-xs">
                    <img
                        src={song.thumbnail}
                        alt={`Thumbnail of video: ${song.title}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[10px] font-mono text-white">
                        {formatIsoDuration(song.duration)}
                    </span>
                    {isCurrent && isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                                <Play className="size-3 fill-current ml-0.5" />
                            </span>
                        </div>
                    )}
                </div>

                {/* Song Info */}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-1">
                        <h3
                            className={`text-xs sm:text-sm font-medium leading-snug line-clamp-2 ${
                                isCurrent ? "font-semibold text-foreground" : "text-foreground/90"
                            }`}
                            title={song.title}
                        >
                            {song.title}
                        </h3>

                        {/* Dropdown Menu Actions */}
                        {canDelete && (
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    asChild
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 shrink-0 -mr-1.5 opacity-70 group-hover:opacity-100"
                                    >
                                        <EllipsisVertical className="size-4" />
                                        <span className="sr-only">Open menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={handleDelete}
                                    >
                                        <Trash2 className="size-4 mr-2" />
                                        Remove from Queue
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 truncate text-muted-foreground/90">
                            <User className="size-3 shrink-0" />
                            <span className="truncate">
                                Queued by{" "}
                                <strong className="font-medium text-foreground">
                                    {isQueuedByCurrentGuest ? "You" : song.guest?.name ?? "Guest"}
                                </strong>
                            </span>
                        </span>

                        <Badge
                            variant={isCurrent ? "default" : "outline"}
                            className="ml-2 shrink-0 text-[10px] px-1.5 py-0 h-4"
                        >
                            #{song.queue_order}
                        </Badge>
                    </div>
                </div>
            </div>
        );
    }
);

SongCard.displayName = "SongCard";
