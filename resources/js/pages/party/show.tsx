import {Button} from "@/components/ui/button";
import ReactPlayer from 'react-player'
import {useEffect, useMemo, useRef, useState} from "react";
import {formatIsoDuration} from "@/lib/utils";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {EllipsisVertical, Trash2} from "lucide-react";
import {router, usePoll} from "@inertiajs/react";
import {destroy} from "@/routes/song";
import {setSongId} from "@/routes/party";


type Props = {isAuthorized: false} | { isAuthorized: true;
    party: Party;
    songs: (Song & {guest: Guest})[]
}

enum PartyState {
    Finished,
    Paused,
    Playing,
    Transition,
    TransitionPaused
}

export default function ShowPartyPage(props: Props) {

    usePoll(2500, {
        only: ['songs']
    })
    const [currentVideo, setCurrentVideo] = useState(0);
    const [partyState, setPartyState] = useState(PartyState.Paused);
    const [transitionTimeLeft, setTransitionTimeLeft] = useState(5);
    const activeSongRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(props.isAuthorized && props.party) {
            const currentSong = props.songs.findIndex(v => props.party.current_song_id === v.id);
            if(currentSong > -1) {
                setCurrentVideo(currentSong);
            }
        }
    }, [props]);

    // Scroll current song into view whenever currentVideo changes
    useEffect(() => {
        if (activeSongRef.current) {
            activeSongRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
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

        // Cleanup automatically handles manual skips (Next/Prev) or unmounting
        return () => clearInterval(timer);
    }, [partyState, transitionTimeLeft]);

    if(!props.isAuthorized) {
        return <div className="flex flex-col items-center justify-center flex-1 ">
            <h2 className="font-bold text-2xl tracking-tighter ">Unauthorized</h2>
            <p className="font-light">You are not authorized to see this page.</p>
        </div>
    }

    const {party, songs} = props;

    const currentSong = songs.at(currentVideo);

    const onNext = () => {
        if(currentVideo >= songs.length - 1) {
            setPartyState(PartyState.Finished);
            return;
        }
        const nextSong = songs[currentVideo + 1];
        setCurrentVideo(v => v + 1);
        setPartyState(PartyState.Playing);
        router.post(setSongId({
            slug: party.slug
        }), {
            song_id: nextSong.id,
        });
    }

    const onPrevious = () => {
        if(currentVideo <= 0) {
            return;
        }
        const prevSong = songs[currentVideo - 1];
        setCurrentVideo(v => v - 1);
        setPartyState(PartyState.Playing);
        router.post(setSongId({
            slug: party.slug
        }), {
            song_id: prevSong.id,
        });
    }

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
        if (partyState === PartyState.Finished && currentVideo < songs.length - 1) {
            onNext();
        }
    }, [songs, partyState, currentVideo]);

    const selectSong = (index: number) => {
        const targetSong = songs[index];
        if (!targetSong) return;
        setCurrentVideo(index);
        setPartyState(PartyState.Playing);
        router.post(setSongId({
            slug: party.slug
        }), {
            song_id: targetSong.id,
        });
    };

    const isTransitioning = partyState === PartyState.Transition || partyState === PartyState.TransitionPaused;

    return (
        <div className="container mx-auto max-sm:px-3 py-4 pt-6 flex flex-col md:flex-row gap-4">
            <div className="flex flex-col flex-1">
                <h2 className="text-2xl font-bold tracking-tight">{party.name}</h2>
                <hr/>
                <div className="aspect-video my-2 relative bg-black rounded-lg overflow-hidden">
                    {songs.length > 0 && partyState !== PartyState.Finished && (
                        <div className={`w-full h-full ${isTransitioning ? 'hidden' : 'block'}`}>
                            <ReactPlayer
                                src={songs[currentVideo]?.uri}
                                className="w-full aspect-video max-w-5xl mx-auto"
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
                                    }
                                }}
                            />
                        </div>
                    )}

                    {isTransitioning && (
                        <div className="absolute inset-0 bg-background flex flex-col items-center justify-center gap-2 p-4 text-center">
                            <div className="my-2 size-48 rounded-full border flex items-center justify-center">
                                <h2 className="text-9xl">{transitionTimeLeft}</h2>
                            </div>
                            <span className="text-xl font-medium">
                                {partyState === PartyState.TransitionPaused ? 'Paused' : 'Next song'}
                            </span>
                            {songs[currentVideo + 1] && (
                                <div className="flex flex-col items-center gap-1 max-w-md">
                                    <p className="text-muted-foreground text-lg truncate w-full" title={songs[currentVideo + 1].title}>
                                        Up Next: <span className="font-semibold text-foreground">{songs[currentVideo + 1].title}</span>
                                    </p>
                                    <span className="text-sm text-muted-foreground font-light">
                                        Queued by <span className="font-medium text-foreground">{songs[currentVideo + 1].guest?.name}</span>
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {partyState === PartyState.Finished && (
                        <div className="absolute inset-0 bg-background/90 border rounded-lg flex flex-col items-center justify-center gap-2 p-6 text-center">
                            <h3 className="text-3xl font-bold tracking-tight">Queue is Empty</h3>
                            <p className="text-muted-foreground text-lg">
                                There are no more songs in the queue. Ask guests to add a song!
                            </p>
                        </div>
                    )}
                </div>
                <div className="flex flex-col w-full flex-1">
                    <h3 className="text-lg ">{currentSong?.title ?? "Song"}</h3>
                    <div className="flex gap-2 w-full justify-center">
                        <Button onClick={onPrevious}
                                variant="outline"
                        >Previous</Button>
                        <Button
                            disabled={partyState === PartyState.Finished}
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
                            }}
                        }>{partyState === PartyState.Paused || partyState === PartyState.TransitionPaused
                            ? 'Play'
                            : 'Pause'}  </Button>
                        <Button onClick={onNext}
                            variant="outline"
                        >Next</Button>
                    </div>
                </div>
                <hr/>
            </div>
            <div className="flex flex-col gap-2 items-center">
                <h3 className="text-lg">Queue</h3>
                <div className="flex flex-col gap-2 items-center max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
                    {
                        songs.map((song, index) => {
                            const isCurrent = index === currentVideo;
                            return (
                                <div key={`guest-song-${song.id}`}
                                     ref={isCurrent ? activeSongRef : null}
                                     onClick={() => selectSong(index)}
                                     className={
                                         `flex gap-3 border p-4 w-full min-w-sm rounded-lg bg-foreground/5 shadow cursor-pointer hover:bg-foreground/10 transition-colors ${song.id === party.current_song_id ? 'border-2 border-primary' : ''}`
                                     }
                                >
                                    <img
                                        src={song.thumbnail}
                                        alt={'Thumbnail of video: '+song.title}
                                    />
                                    <div className="flex flex-col flex-1">
                                        {
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 self-end">
                                                        <EllipsisVertical className="size-4" />
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.delete(
                                                                destroy({
                                                                    id: song.id,
                                                                })
                                                            )
                                                        }}
                                                    >
                                                        <Trash2 className="size-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        }
                                        <div className="flex justify-between gap-4">
                                            <h2 className="font-medium text-sm md:text-base" title={song.title}>
                                                {song.title.length > 32 ? `${song.title.slice(0, 32).trim()}...` : song.title}
                                            </h2>
                                            <span className="shrink-0 text-xs">#{song.queue_order}</span>
                                        </div>
                                        <span className="text-sm">{formatIsoDuration(song.duration)}</span>
                                        <span className="text-xs md:text-sm font-light text-end flex-1 flex justify-end items-end">
                                        Queued by {song.guest.name}
                                    </span>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    )
}
