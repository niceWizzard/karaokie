import { Form, Head, usePage, usePoll } from "@inertiajs/react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import join from "@/routes/join";
import { SongSearcherForm } from "@/components/SongSearcherForm";
import { SongCard } from "@/components/SongCard";
import { Disc3, ListMusic, Music, Music2, Radio, Sparkles, User } from "lucide-react";
import { formatIsoDuration } from "@/lib/utils";

type Props =
    | {
          fresh: true;
          requiresPin: boolean;
      }
    | {
          fresh: false;
          party: Party;
          guest: Guest;
          songs: (Song & { guest: Guest })[];
      };

export default function JoinIndexPage() {
    const { props } = usePage<Props & { slug: string }>();
    const errors = props.errors;
    const searchParams = new URLSearchParams(window.location.search);
    const defaultPin = searchParams.get("pin") ?? "";

    usePoll(2500, {
        only: ["songs", "party"],
    });

    if (props.fresh) {
        return (
            <>
                <Head title="Join Party - Karaokie" />
                <div className="container mx-auto flex min-h-[80vh] flex-col items-center justify-center p-4">
                    <Card className="w-full max-w-md border-border/60 p-8 shadow-xl">
                        <div className="mb-6 flex flex-col items-center text-center">
                            <div className="mb-3 rounded-full bg-primary/10 p-4 text-primary">
                                <Sparkles className="size-8" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">Join the Party</h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Enter your nickname to queue up your favorite songs!
                            </p>
                        </div>

                        <Form
                            className="flex flex-col gap-4"
                            action={join.store({ slug: props.slug })}
                            method="POST"
                        >
                            <Field>
                                <FieldLabel htmlFor="name">Nickname</FieldLabel>
                                <Input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Karaoke Master"
                                    autoFocus
                                    className="h-11"
                                />
                                <FieldDescription>
                                    This will be shown to everyone in the party.
                                </FieldDescription>
                                {errors.name && <FieldError>{errors.name}</FieldError>}
                            </Field>

                            {props.requiresPin && (
                                <Field>
                                    <FieldLabel htmlFor="pin">Party PIN</FieldLabel>
                                    <Input
                                        type="text"
                                        name="pin"
                                        placeholder="Enter PIN code"
                                        defaultValue={defaultPin}
                                        className="h-11 font-mono tracking-wider"
                                    />
                                    <FieldDescription>
                                        {defaultPin
                                            ? "PIN code was auto-filled from link"
                                            : "Ask the host for the party PIN"}
                                    </FieldDescription>
                                    {errors.pin && <FieldError>{errors.pin}</FieldError>}
                                </Field>
                            )}

                            <Button size="lg" className="mt-2 w-full font-semibold shadow-md">
                                Enter Party
                            </Button>
                        </Form>
                    </Card>
                </div>
            </>
        );
    }

    const currentSongIndex = props.songs.findIndex(
        (s) => s.id === props.party.current_song_id
    );
    const currentSong = currentSongIndex > -1 ? props.songs[currentSongIndex] : null;

    return (
        <>
            <Head title={`${props.party.name} - Karaoke Queue`} />
            <div className="container mx-auto max-w-7xl px-4 py-6">
                {/* Header Banner */}
                <div className="mb-6 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                                {props.party.name}
                            </h1>
                            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                                <Radio className="size-3.5 animate-pulse text-emerald-500" />
                                Party Live
                            </Badge>
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
                            <User className="size-3.5" />
                            Joined as <strong className="font-semibold text-foreground">{props.guest.name}</strong>
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-xs font-normal">
                            <ListMusic className="size-3.5 text-primary" />
                            <span>{props.songs.length} {props.songs.length === 1 ? 'song' : 'songs'} in queue</span>
                        </Badge>
                    </div>
                </div>

                {/* Main 2-Column Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 items-start">
                    {/* Left Column: Search & Add Song Form */}
                    <div className="flex flex-col gap-6 lg:col-span-6 xl:col-span-5">
                        <SongSearcherForm partySlug={props.party.slug} />
                    </div>

                    {/* Right Column: Song Queue & Currently Playing */}
                    <div className="flex flex-col gap-4 lg:col-span-6 xl:col-span-7">
                        {/* Currently Playing Highlight Card */}
                        {currentSong ? (
                            <Card className="relative overflow-hidden border-primary/40 bg-primary/5 p-4 shadow-sm">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex size-2.5">
                                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500"></span>
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                                            Now Playing in Party
                                        </span>
                                    </div>
                                    <span className="font-mono text-xs text-muted-foreground">
                                        {formatIsoDuration(currentSong.duration)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <img
                                        src={currentSong.thumbnail}
                                        alt={currentSong.title}
                                        className="size-14 rounded-lg object-cover shadow-xs border"
                                    />
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="truncate font-semibold text-sm sm:text-base" title={currentSong.title}>
                                            {currentSong.title}
                                        </h3>
                                        <p className="truncate text-xs text-muted-foreground mt-0.5">
                                            Queued by{" "}
                                            <strong className="font-medium text-foreground">
                                                {props.guest.id === currentSong.guest?.id
                                                    ? "You"
                                                    : currentSong.guest?.name ?? "Guest"}
                                            </strong>
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ) : null}

                        {/* Queue List Header */}
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <ListMusic className="size-5 text-primary" />
                                <h2 className="font-semibold text-lg tracking-tight">Song Queue</h2>
                            </div>
                            <span className="text-xs text-muted-foreground font-medium">
                                {props.songs.length > 0
                                    ? `${props.songs.length} ${props.songs.length === 1 ? "track" : "tracks"}`
                                    : "Empty"}
                            </span>
                        </div>

                        {/* Queue Items */}
                        <div className="flex flex-col gap-2.5 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
                            {props.songs.length === 0 ? (
                                <Card className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-dashed">
                                    <Music2 className="mb-2 size-8 text-muted-foreground/60" />
                                    <p className="text-sm font-medium">The queue is currently empty</p>
                                    <p className="text-xs text-muted-foreground/80 mt-1">
                                        Be the first to search and queue a song above!
                                    </p>
                                </Card>
                            ) : (
                                props.songs.map((song, index) => {
                                    const isCurrent = song.id === props.party.current_song_id;
                                    const isPast = currentSongIndex > -1 && index < currentSongIndex;

                                    return (
                                        <SongCard
                                            key={`guest-song-${song.id}`}
                                            song={song}
                                            isCurrent={isCurrent}
                                            isPlaying={isCurrent}
                                            isPast={isPast}
                                            canDelete={props.guest.id === song.guest.id}
                                            isQueuedByCurrentGuest={props.guest.id === song.guest.id}
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

