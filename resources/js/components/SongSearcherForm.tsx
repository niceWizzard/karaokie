import {Button} from "@/components/ui/button";
import {Field, FieldError, FieldLabel} from "@/components/ui/field";
import {Form, useForm, usePage} from "@inertiajs/react";
import * as songRoute from "@/routes/song";
import {Input} from "@/components/ui/input";
import {RouteDefinition} from "@/wayfinder";
import {SubmitEvent, useEffect, useState} from "react";
import {PlusIcon} from "lucide-react";
import {formatIsoDuration} from "@/lib/utils";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import ReactPlayer from "react-player";

enum FocusedVideoState {
    Loading,
    Playing,
    Error
}

export function SongSearcherForm({partySlug}: { partySlug: string }) {
    const {props} = usePage();
    const errors = props.errors;
    const { data, setData, get} = useForm<{title: string;}>();
    const [songSearch, setSongSearch] = useState<Song[]>([])
    const [focusedUri, setFocusedUri] = useState('');
    const [dialogState, setDialogState] = useState(FocusedVideoState.Loading);

    useEffect(() => {
        setDialogState(FocusedVideoState.Loading);
    }, [focusedUri, setFocusedUri])

    const handleSubmit = async (e : SubmitEvent<HTMLFormElement> ) => {
        e.preventDefault()
        const queryParams = new URLSearchParams(data).toString();
        const fullUrl = `${songRoute.search().url}?${queryParams}`;

        const res = await fetch(fullUrl, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        })

        const resData = await res.json();
        setSongSearch(resData)
    }


    return (
        <>
            <Dialog open={focusedUri.trim().length > 0}
                onOpenChange={(open) => open ? null : setFocusedUri('')}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Queue song?</DialogTitle>
                        <DialogDescription>
                            This song will be queued to the party
                        </DialogDescription>
                    </DialogHeader>
                    {
                        !!focusedUri && (
                            <ReactPlayer
                                src={focusedUri} className="w-full aspect-video max-w-5xl mx-auto"
                                width="100%"
                                height="100%"
                                autoPlay
                                controls
                                onError={() => setDialogState(FocusedVideoState.Error)}
                                onStart={() => setDialogState(FocusedVideoState.Playing)}
                                config={{
                                    youtube: {
                                        start: 0,
                                    }
                                }}
                            />
                        )
                    }
                    <Form
                        action={songRoute.store({
                            slug: partySlug,
                        })}
                        onBefore={() => setSongSearch([])}
                        className="flex flex-col gap-2"
                        onStart={() => {
                            setFocusedUri('')
                        }}
                    >
                        <input type="hidden" name="uri" value={focusedUri}/>
                        <Field>
                            <Button className="w-full"
                                disabled={dialogState !== FocusedVideoState.Playing}
                            >
                                {(() => {
                                    switch (dialogState) {
                                        case FocusedVideoState.Playing:
                                            return 'Add to Queue';
                                        case FocusedVideoState.Error:
                                            return 'Song unvailable';
                                        default:
                                        case FocusedVideoState.Loading:
                                            return 'Song Loading...';
                                    }
                                })()}
                            </Button>
                            {
                               dialogState === FocusedVideoState.Error && <FieldError>Please select another video</FieldError>
                            }
                        </Field>
                        <DialogClose asChild>
                            <Button variant="outline" className="w-full">Cancel</Button>
                        </DialogClose>
                    </Form>
                </DialogContent>
            </Dialog>
            <form className="flex flex-col gap-2 border p-4 rounded-lg"
                  onSubmit={handleSubmit}
            >
                <h3 className="font-bold tracking-tight">Add Song</h3>
                <Field>
                    <FieldLabel htmlFor="title">Song Title</FieldLabel>
                    <Input type="text" placeholder="Hawak mo ang beat etc." name="title"
                        onChange={e => setData('title', e.target.value)}
                    />
                    {
                        errors.title &&
                        <FieldError>
                            {errors.title}
                        </FieldError>
                    }
                </Field>
                <Button>Search</Button>
            </form>
            <div className="flex flex-col gap-2">
                {
                    songSearch.length ? (<>
                        <h3 className="font-semibold text-lg">Results</h3>
                        <hr className="my-2"/>
                        {songSearch.map(song => (
                            <div className="flex flex-row gap-2 items-center"
                                 key={`youtube-${song.id}`}
                            >
                                <img src={song.thumbnail} alt={"Song " + song.title}/>
                                <div className="flex flex-col flex-1">
                                    <h2>{song.title}</h2>
                                    <span>{formatIsoDuration(song.duration)}</span>

                                </div>
                                <Button onClick={() => setFocusedUri(song.uri)}>
                                    <PlusIcon />
                                </Button>
                            </div>
                        ))}
                    </>) : null

                }
            </div>
        </>
    )
}
