import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import ReactPlayer from "react-player";
import { useEffect, useRef, useState } from "react";
import { formatIsoDuration } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Check,
    Copy,
    Disc3,
    EllipsisVertical,
    Eye,
    EyeOff,
    ListMusic,
    Music,
    Music2,
    Pause,
    Play,
    Radio,
    ShieldAlert,
    SkipBack,
    SkipForward,
    Trash2,
    User,
} from "lucide-react";
import { Head, router, usePoll } from "@inertiajs/react";
import { destroy } from "@/routes/song";
import { setSongId } from "@/routes/party";
import join from "@/routes/join";
import { SongCard } from "@/components/SongCard";
import { copyTextToClipboard } from "@/hooks/use-clipboard";

type Props =
    | { isAuthorized: false }
    | {
          isAuthorized: true;
          party: Party;
          songs: (Song & { guest: Guest })[];
      };

enum PartyState {
    Finished,
    Paused,
    Playing,
    Transition,
    TransitionPaused,
}

export default function ShowPartyPage(props: Props) {
    usePoll(2500, {
        only: ["songs"],
    });

    const [currentVideo, setCurrentVideo] = useState(0);
    const [partyState, setPartyState] = useState(PartyState.Paused);
    const [transitionTimeLeft, setTransitionTimeLeft] = useState(5);
    const [copied, setCopied] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const activeSongRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (props.isAuthorized && props.party) {
            const currentSong = props.songs.findIndex(
                (v) => props.party.current_song_id === v.id
            );
            if (currentSong > -1) {
                setCurrentVideo(currentSong);
            }
        }
    }, [props]);

    // Scroll current song into view whenever currentVideo changes
    useEffect(() => {
        if (activeSongRef.current) {
            activeSongRef.current.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    }, [currentVideo]);

    useEffect(() => {
        if (partyState !== PartyState.Transition) return;

        if (transitionTimeLeft <= 0) {
            setTransitionTimeLeft(5);
            onNext();
            return;
        }

        const timer = setInterval(() => {
            setTransitionTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [partyState, transitionTimeLeft]);

    if (!props.isAuthorized) {
        return (
            <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center p-4">
                <Card className="flex w-full max-w-md flex-col items-center justify-center p-8 text-center shadow-lg">
                    <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
                        <ShieldAlert className="size-10" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        You are not authorized to view or manage this party page.
                    </p>
                </Card>
            </div>
        );
    }

    const { party, songs } = props;
    const currentSong = songs.at(currentVideo);

    const onNext = () => {
        if (currentVideo >= songs.length - 1) {
            setPartyState(PartyState.Finished);
            return;
        }
        const nextSong = songs[currentVideo + 1];
        setCurrentVideo((v) => v + 1);
        setPartyState(PartyState.Playing);
        router.post(
            setSongId({
                slug: party.slug,
            }),
            {
                song_id: nextSong.id,
            }
        );
    };

    const onPrevious = () => {
        if (currentVideo <= 0) {
            return;
        }
        const prevSong = songs[currentVideo - 1];
        setCurrentVideo((v) => v - 1);
        setPartyState(PartyState.Playing);
        router.post(
            setSongId({
                slug: party.slug,
            }),
            {
                song_id: prevSong.id,
            }
        );
    };

    const handleOnVideoEnd = () => {
        if (currentVideo >= songs.length - 1) {
            setPartyState(PartyState.Finished);
        } else {
            setTransitionTimeLeft(5);
            setPartyState(PartyState.Transition);
        }
    };

    // Auto-resume when a new song is queued while in Finished state
    useEffect(() => {
        if (
            partyState === PartyState.Finished &&
            currentVideo < songs.length - 1
        ) {
            onNext();
        }
    }, [songs, partyState, currentVideo]);

    const selectSong = (index: number) => {
        const targetSong = songs[index];
        if (!targetSong) return;
        setCurrentVideo(index);
        setPartyState(PartyState.Playing);
        router.post(
            setSongId({
                slug: party.slug,
            }),
            {
                song_id: targetSong.id,
            }
        );
    };

    const copyPartyLink = async () => {
        const queryOptions = party.pin ? { query: { pin: party.pin } } : undefined;
        const joinUrl = `${window.location.origin}${join.index.url({ slug: party.slug }, queryOptions)}`;
        const success = await copyTextToClipboard(joinUrl);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const isTransitioning =
        partyState === PartyState.Transition ||
        partyState === PartyState.TransitionPaused;

    const renderStatusBadge = () => {
        switch (partyState) {
            case PartyState.Playing:
                return (
                    <Badge variant="default" className="gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-600/90 text-white">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-300 opacity-75"></span>
                            <span className="relative inline-flex size-2 rounded-full bg-emerald-200"></span>
                        </span>
                        Playing
                    </Badge>
                );
            case PartyState.Transition:
            case PartyState.TransitionPaused:
                return (
                    <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                        <Radio className="size-3.5 animate-pulse text-primary" />
                        Next Up ({transitionTimeLeft}s)
                    </Badge>
                );
            case PartyState.Paused:
                return (
                    <Badge variant="outline" className="gap-1.5 px-3 py-1 border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10">
                        <Pause className="size-3" />
                        Paused
                    </Badge>
                );
            case PartyState.Finished:
            default:
                return (
                    <Badge variant="outline" className="gap-1.5 px-3 py-1 text-muted-foreground">
                        <Disc3 className="size-3" />
                        Queue Ended
                    </Badge>
                );
        }
    };

    return (
        <>
            <Head title={`${party.name} - Party Room`} />
            <div className="container mx-auto max-w-7xl px-4 py-6">
                {/* Party Header Bar */}
                <div className="mb-6 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                {party.name}
                            </h1>
                            {renderStatusBadge()}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                            Manage party music queue and controls in real time
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {party.pin && (
                            <Badge
                                variant="outline"
                                className="gap-1.5 px-2.5 py-1.5 text-xs font-mono select-none cursor-pointer hover:bg-accent transition-colors"
                                onClick={() => setShowPin((prev) => !prev)}
                                title={showPin ? "Hide PIN code" : "Show PIN code"}
                            >
                                <span>PIN: {showPin ? party.pin : "••••"}</span>
                                {showPin ? (
                                    <EyeOff className="size-3.5 text-muted-foreground ml-0.5" />
                                ) : (
                                    <Eye className="size-3.5 text-muted-foreground ml-0.5" />
                                )}
                            </Badge>
                        )}
                        <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs font-normal">
                            <ListMusic className="size-3.5 text-muted-foreground" />
                            <span>{songs.length} {songs.length === 1 ? 'song' : 'songs'}</span>
                        </Badge>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={copyPartyLink}
                            className="gap-2 shadow-xs transition-all hover:bg-accent"
                        >
                            {copied ? (
                                <>
                                    <Check className="size-3.5 text-emerald-500" />
                                    <span>Link Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="size-3.5 text-muted-foreground" />
                                    <span>Share Party Link</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-start">
                    {/* Left Column: Player & Controls */}
                    <div className="flex flex-col gap-4 lg:col-span-7 xl:col-span-8">
                        {/* Video Player Card */}
                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950 border border-border/40 shadow-2xl">
                            {songs.length > 0 && partyState !== PartyState.Finished && (
                                <div className={`h-full w-full ${isTransitioning ? "hidden" : "block"}`}>
                                    <ReactPlayer
                                        src={songs[currentVideo]?.uri}
                                        className="h-full w-full"
                                        width="100%"
                                        height="100%"
                                        playing={partyState === PartyState.Playing}
                                        controls
                                        onEnded={handleOnVideoEnd}
                                        onPause={() => setPartyState(PartyState.Paused)}
                                        onPlay={() => setPartyState(PartyState.Playing)}
                                        config={{
                                            youtube: {
                                                start: 0,
                                                fs: 1,
                                            },
                                        }}
                                    />
                                </div>
                            )}

                            {/* Transition Screen Overlay */}
                            {isTransitioning && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md p-6 text-center animate-in fade-in duration-300">
                                    <div className="relative mb-4 flex size-36 items-center justify-center rounded-full border-4 border-primary/20 bg-primary/5 shadow-inner">
                                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin duration-1000"></div>
                                        <span className="text-6xl font-black tracking-tighter text-primary">
                                            {transitionTimeLeft}
                                        </span>
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                        {partyState === PartyState.TransitionPaused
                                            ? "Transition Paused"
                                            : "Starting Next Song In"}
                                    </span>

                                    {songs[currentVideo + 1] && (
                                        <Card className="mt-4 w-full max-w-md border-border/50 bg-card/80 p-4 shadow-sm backdrop-blur-xs">
                                            <div className="flex items-center gap-3 text-left">
                                                <img
                                                    src={songs[currentVideo + 1].thumbnail}
                                                    alt={songs[currentVideo + 1].title}
                                                    className="size-14 rounded-lg object-cover shadow-xs"
                                                />
                                                <div className="flex-1 overflow-hidden">
                                                    <div className="text-xs font-medium text-primary">Up Next</div>
                                                    <h4 className="truncate font-semibold text-sm sm:text-base" title={songs[currentVideo + 1].title}>
                                                        {songs[currentVideo + 1].title}
                                                    </h4>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        Queued by <span className="font-medium text-foreground">{songs[currentVideo + 1].guest?.name}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    )}

                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                if (partyState === PartyState.Transition) {
                                                    setPartyState(PartyState.TransitionPaused);
                                                } else {
                                                    setPartyState(PartyState.Transition);
                                                }
                                            }}
                                            variant="outline"
                                        >
                                            {partyState === PartyState.TransitionPaused ? (
                                                <>
                                                    <Play className="mr-1.5 size-3.5 fill-current" /> Resume Timer
                                                </>
                                            ) : (
                                                <>
                                                    <Pause className="mr-1.5 size-3.5" /> Pause Timer
                                                </>
                                            )}
                                        </Button>
                                        <Button size="sm" onClick={onNext}>
                                            <SkipForward className="mr-1.5 size-3.5" /> Play Now
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Empty Queue / Finished Overlay */}
                            {(partyState === PartyState.Finished || songs.length === 0) && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 p-8 text-center backdrop-blur-xs">
                                    <div className="mb-4 rounded-full bg-primary/10 p-5 text-primary">
                                        <Disc3 className="size-12 animate-spin-slow" />
                                    </div>
                                    <h3 className="text-2xl font-bold tracking-tight">Queue is Empty</h3>
                                    <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                                        There are no songs playing. Share the party link with guests to start adding tracks!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Player Control Bar Card */}
                        <Card className="p-4 shadow-sm border-border/60">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                {/* Current Song Metadata */}
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Music className="size-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="truncate font-semibold text-base" title={currentSong?.title ?? "No Song Selected"}>
                                            {currentSong?.title ?? "No Song Playing"}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            {currentSong ? (
                                                <>
                                                    <span>{formatIsoDuration(currentSong.duration)}</span>
                                                    <span>•</span>
                                                    <span className="truncate">Queued by <strong className="font-medium text-foreground">{currentSong.guest?.name}</strong></span>
                                                </>
                                            ) : (
                                                <span>Waiting for tracks to be queued</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Controls Buttons */}
                                <div className="flex items-center justify-center gap-2 sm:shrink-0">
                                    <Button
                                        onClick={onPrevious}
                                        variant="outline"
                                        size="icon"
                                        disabled={currentVideo <= 0}
                                        title="Previous Song"
                                        className="size-10 rounded-full"
                                    >
                                        <SkipBack className="size-4" />
                                        <span className="sr-only">Previous Song</span>
                                    </Button>

                                    <Button
                                        disabled={partyState === PartyState.Finished || songs.length === 0}
                                        size="icon"
                                        className="size-12 rounded-full shadow-md"
                                        onClick={() => {
                                            switch (partyState) {
                                                case PartyState.Transition:
                                                    return setPartyState(PartyState.TransitionPaused);
                                                case PartyState.TransitionPaused:
                                                    return setPartyState(PartyState.Transition);
                                                case PartyState.Paused:
                                                    return setPartyState(PartyState.Playing);
                                                case PartyState.Playing:
                                                    return setPartyState(PartyState.Paused);
                                                case PartyState.Finished:
                                                default:
                                                    return;
                                            }
                                        }}
                                    >
                                        {partyState === PartyState.Paused || partyState === PartyState.TransitionPaused ? (
                                            <Play className="size-5 fill-current ml-0.5" />
                                        ) : (
                                            <Pause className="size-5 fill-current" />
                                        )}
                                        <span className="sr-only">
                                            {partyState === PartyState.Paused || partyState === PartyState.TransitionPaused ? "Play" : "Pause"}
                                        </span>
                                    </Button>

                                    <Button
                                        onClick={onNext}
                                        variant="outline"
                                        size="icon"
                                        disabled={currentVideo >= songs.length - 1}
                                        title="Next Song"
                                        className="size-10 rounded-full"
                                    >
                                        <SkipForward className="size-4" />
                                        <span className="sr-only">Next Song</span>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Songs Queue Sidebar */}
                    <div className="flex flex-col gap-3 lg:col-span-5 xl:col-span-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <ListMusic className="size-5 text-primary" />
                                <h2 className="font-semibold text-lg tracking-tight">Queue List</h2>
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                                {songs.length > 0 ? `${currentVideo + 1} of ${songs.length}` : 'Empty'}
                            </span>
                        </div>

                        <div className="flex flex-col gap-2.5 max-h-[calc(100vh-14rem)] min-h-[300px] overflow-y-auto pr-1">
                            {songs.length === 0 ? (
                                <Card className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-dashed">
                                    <Music2 className="mb-2 size-8 text-muted-foreground/60" />
                                    <p className="text-sm font-medium">No songs queued yet</p>
                                    <p className="text-xs text-muted-foreground/80 mt-1">
                                        Songs added by party guests will show up here.
                                    </p>
                                </Card>
                            ) : (
                                songs.map((song, index) => {
                                    const isCurrent = index === currentVideo;
                                    const isPast = index < currentVideo;

                                    return (
                                        <SongCard
                                            key={`guest-song-${song.id}`}
                                            ref={isCurrent ? activeSongRef : null}
                                            song={song}
                                            isCurrent={isCurrent}
                                            isPlaying={partyState === PartyState.Playing}
                                            isPast={isPast}
                                            onClick={() => selectSong(index)}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
