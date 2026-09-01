import {Button} from "@/components/ui/button";
import {Field, FieldError, FieldLabel} from "@/components/ui/field";
import {Form, useForm, usePage} from "@inertiajs/react";
import * as songRoute from "@/routes/song";
import {Input} from "@/components/ui/input";
import {RouteDefinition} from "@/wayfinder";
import {SubmitEvent, useState} from "react";
import {PlusIcon} from "lucide-react";

export function SongSearcherForm({partySlug}: { partySlug: string }) {
    const {props} = usePage();
    const errors = props.errors;

    const { data, setData, get} = useForm<{title: string;}>();

    const [songSearch, setSongSearch] = useState<{
        id: string;
        title: string;
        thumbnail: string;
        url: string;
    }[]>([])
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
                            <div className="flex flex-row gap-2"
                                 key={`youtube-${song.id}`}
                            >
                                <img src={song.thumbnail} alt={"Song " + song.title}/>
                                <h2>{song.title}</h2>
                                <Form
                                    action={songRoute.store({
                                        slug: partySlug,
                                    })}
                                    onBefore={() => setSongSearch([])}
                                >
                                    <input type="hidden" name="uri" value={song.url}/>
                                    <Button>
                                        <PlusIcon/>
                                    </Button>
                                </Form>
                            </div>
                        ))}
                    </>) : null

                }
            </div>
        </>
    )
}
