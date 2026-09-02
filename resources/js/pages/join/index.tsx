import {Form, router, usePage} from "@inertiajs/react";
import {Field, FieldDescription, FieldError, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import join from "@/routes/join";
import {destroy} from "@/routes/song";
import {formatIsoDuration} from "@/lib/utils";
import {SongSearcherForm} from "@/components/SongSearcherForm";
import {EllipsisVertical, Trash2} from "lucide-react";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";

type Props = {
    fresh: true,
    requiresPin: boolean;
} | {
    fresh: false,
    party: Party
    guest: Guest
    songs: (Song & {guest: Guest})[]
}

export default function JoinIndexPage() {
    const {props,url} = usePage<Props & {slug: string}>();
    const errors = props.errors;
    const searchParams = new URLSearchParams(window.location.search);
    const defaultPin = searchParams.get('pin') ?? '';


    if(props.fresh) {
        return <div className="w-full h-full flex flex-col justify-center items-center flex-1">
            <h2 className="text-2xl font-medium tracking-tight">Join the Party</h2>
            <p className="text-lg font-light text-gray-50/70">Enter your nickname to get join this party!</p>
            <Form className="border p-8 rounded-lg flex flex-col gap-2 mt-6"
                  action={join.store({slug: props.slug})}
                  method="POST"
            >
                <Field>
                    <FieldLabel htmlFor="name">Nickname</FieldLabel>
                    <Input type="text" name="name" autoFocus />
                    <FieldDescription>This will be shown to other guests in the party. Must be unique</FieldDescription>
                    {
                        errors.name && (<FieldError>
                            {errors.name}
                        </FieldError>)
                    }
                </Field>
                {
                    props.requiresPin && (
                        <Field>
                            <FieldLabel htmlFor="pin">Pin</FieldLabel>
                            <Input type="text" name="pin" placeholder="Enter pin code here" defaultValue={defaultPin} />
                            <FieldDescription>{!!defaultPin ? 'Pin code was auto-filled' : 'Ask for a pin code from host of the party'}</FieldDescription>
                            {
                                errors.pin && (<FieldError>
                                    {errors.pin}
                                </FieldError>)
                            }
                        </Field>
                    )
                }
                <Button>
                    Enter
                </Button>
            </Form>
        </div>
    }

    return (
        <div className="container mx-auto flex max-md:flex-col gap-8 max-sm:p-3 pb-lg px-4 py-8 ">
            <div className="flex flex-col gap-4  w-full max-w-2xl">
                <h2>{props.party.name}</h2>
                <p>Hello {props.guest.name}!</p>
                <SongSearcherForm
                    partySlug={props.party.slug}
                />
            </div>
            <div className="flex flex-col gap-4">
                <h3>Song Queue</h3>
                <div className="flex flex-col gap-2">
                    {
                        props.songs.map(song => (
                            <div key={`guest-song-${song.id}`}
                                 className="flex gap-3 border p-4 w-full min-w-sm rounded-lg  bg-foreground/5 shadow"
                            >
                                <img
                                    src={song.thumbnail}
                                    alt={'Thumbnail of video: '+song.title}
                                />
                                <div className="flex flex-col flex-1">
                                    {
                                        props.guest.id === song.guest.id && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 self-end">
                                                        <EllipsisVertical className="size-4" />
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() => {
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
                                        )
                                    }
                                    <div className="flex justify-between gap-4">
                                        <h2 className="font-medium text-sm md:text-base" title={song.title}>
                                            {song.title.length > 32 ? `${song.title.slice(0, 32).trim()}...` : song.title}
                                        </h2>
                                        <span className="shrink-0 text-xs">#{song.queue_order}</span>
                                    </div>
                                    <span className="text-sm">{formatIsoDuration(song.duration)}</span>
                                    <span className="text-xs md:text-sm font-light text-end flex-1 flex justify-end items-end">
                                    Queued by {
                                        props.guest.id === song.guest.id ? (<span className="font-semibold">You</span>):
                                            song.guest.name
                                    }
                                </span>
                                </div>
                            </div>
                        ))
                    }
                    {
                        props.songs.length == 0 && (
                            <p className="text-center ">There is no song in queue</p>
                        )
                    }
                </div>
            </div>

        </div>
    )
}
