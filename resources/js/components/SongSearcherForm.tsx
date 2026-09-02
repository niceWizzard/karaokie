import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form, useForm, usePage } from "@inertiajs/react";
import * as songRoute from "@/routes/song";
import { Input } from "@/components/ui/input";
import { SubmitEvent, useEffect, useState } from "react";
import {
    Clock,
    ListPlus,
    Loader2,
    Music2,
    PlusIcon,
    Search,
} from "lucide-react";
import { formatIsoDuration } from "@/lib/utils";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import ReactPlayer from "react-player";

enum FocusedVideoState {
    Loading,
    Playing,
    Error,
}

export function SongSearcherForm({ partySlug }: { partySlug: string }) {
    const { props } = usePage();
    const errors = props.errors;
    const { data, setData } = useForm<{ title: string }>({ title: "" });
    const [songSearch, setSongSearch] = useState<Song[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [focusedUri, setFocusedUri] = useState("");
    const [dialogState, setDialogState] = useState(FocusedVideoState.Loading);

    useEffect(() => {
        setDialogState(FocusedVideoState.Loading);
    }, [focusedUri]);

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!data.title.trim()) return;

        setIsSearching(true);
        setHasSearched(true);
        try {
            const queryParams = new URLSearchParams(data).toString();
            const fullUrl = `${songRoute.search().url}?${queryParams}`;

            const res = await fetch(fullUrl, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            });

            const resData = await res.json();
            setSongSearch(resData);
        } catch (err) {
            console.error("Failed to search songs", err);
            setSongSearch([]);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <>
            {/* Song Preview & Queue Confirmation Modal */}
            <Dialog
                open={focusedUri.trim().length > 0}
                onOpenChange={(open) => (open ? null : setFocusedUri(""))}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Music2 className="size-5 text-primary" />
                            <span>Preview & Queue Song</span>
                        </DialogTitle>
                        <DialogDescription>
                            Listen to a quick preview before adding this track to the party queue.
                        </DialogDescription>
                    </DialogHeader>

                    {focusedUri && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-border/50 shadow-md">
                            <ReactPlayer
                                src={focusedUri}
                                className="h-full w-full"
                                width="100%"
                                height="100%"
                                playing
                                controls
                                onError={() => setDialogState(FocusedVideoState.Error)}
                                onStart={() => setDialogState(FocusedVideoState.Playing)}
                                config={{
                                    youtube: {
                                        start: 0,
                                    },
                                }}
                            />
                        </div>
                    )}

                    <Form
                        action={songRoute.store({
                            slug: partySlug,
                        })}
                        onBefore={() => setSongSearch([])}
                        className="flex flex-col gap-2.5 mt-2"
                        onStart={() => {
                            setFocusedUri("");
                        }}
                    >
                        <input type="hidden" name="uri" value={focusedUri} />
                        <Field>
                            <Button
                                className="w-full h-11 font-medium shadow-md gap-2"
                                disabled={dialogState !== FocusedVideoState.Playing}
                            >
                                {(() => {
                                    switch (dialogState) {
                                        case FocusedVideoState.Playing:
                                            return (
                                                <>
                                                    <ListPlus className="size-4" />
                                                    <span>Add to Party Queue</span>
                                                </>
                                            );
                                        case FocusedVideoState.Error:
                                            return "Song Unavailable";
                                        default:
                                        case FocusedVideoState.Loading:
                                            return (
                                                <>
                                                    <Loader2 className="size-4 animate-spin" />
                                                    <span>Loading Preview...</span>
                                                </>
                                            );
                                    }
                                })()}
                            </Button>
                            {dialogState === FocusedVideoState.Error && (
                                <FieldError className="text-center mt-1">
                                    This video is restricted or unavailable. Please select another track.
                                </FieldError>
                            )}
                        </Field>
                        <DialogClose asChild>
                            <Button variant="outline" className="w-full">
                                Cancel
                            </Button>
                        </DialogClose>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Search Form Card */}
            <Card className="p-5 shadow-sm border-border/60">
                <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base tracking-tight">Add a Song</h3>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="title" className="sr-only">
                            Song Title or Artist
                        </FieldLabel>
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
                            <Input
                                type="text"
                                placeholder="Search by song title, artist, or lyric..."
                                name="title"
                                value={data.title}
                                onChange={(e) => setData("title", e.target.value)}
                                className="pl-9 pr-4 h-11"
                            />
                        </div>
                        {errors.title && <FieldError>{errors.title}</FieldError>}
                    </Field>

                    <Button type="submit" disabled={isSearching || !data.title.trim()} className="h-10 font-medium gap-2">
                        {isSearching ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                <span>Searching YouTube...</span>
                            </>
                        ) : (
                            <>
                                <Search className="size-4" />
                                <span>Search Track</span>
                            </>
                        )}
                    </Button>
                </form>
            </Card>

            {/* Search Results */}
            {isSearching && (
                <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                    <Loader2 className="size-8 animate-spin text-primary mb-2" />
                    <p className="text-sm font-medium">Searching for song matches...</p>
                </div>
            )}

            {!isSearching && songSearch.length > 0 && (
                <div className="flex flex-col gap-3 mt-1">
                    <div className="flex items-center justify-between px-1">
                        <h4 className="font-semibold text-sm tracking-tight text-foreground/90">
                            Search Results ({songSearch.length})
                        </h4>
                        <span className="text-xs text-muted-foreground">Click + to preview & add</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        {songSearch.map((song) => (
                            <div
                                className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-2xs hover:border-border hover:bg-accent/60 transition-all"
                                key={`youtube-${song.id}`}
                            >
                                <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-muted shadow-xs">
                                    <img
                                        src={song.thumbnail}
                                        alt={`Thumbnail for ${song.title}`}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[10px] font-mono text-white">
                                        {formatIsoDuration(song.duration)}
                                    </span>
                                </div>

                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                    <h5 className="text-xs sm:text-sm font-medium leading-snug line-clamp-2 text-foreground" title={song.title}>
                                        {song.title}
                                    </h5>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock className="size-3" />
                                        <span>{formatIsoDuration(song.duration)}</span>
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    onClick={() => setFocusedUri(song.uri)}
                                    className="shrink-0 gap-1.5 font-medium shadow-2xs"
                                >
                                    <PlusIcon className="size-4" />
                                    <span className="hidden sm:inline">Queue</span>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isSearching && hasSearched && songSearch.length === 0 && (
                <Card className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-dashed">
                    <Search className="mb-2 size-8 text-muted-foreground/60" />
                    <p className="text-sm font-medium">No songs found</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">
                        Try searching with different keywords or artist names.
                    </p>
                </Card>
            )}
        </>
    );
}

