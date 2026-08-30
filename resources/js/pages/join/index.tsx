import {Form, router, usePage} from "@inertiajs/react";
import {Field, FieldDescription, FieldError, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import join from "@/routes/join";

type Props = {
    fresh: true
} | {
    fresh: false,
    party: {
        name: string;
        slug: string;
    }
    guest: {
        name: string;
        joined_at: string;
    }
}

export default function JoinIndexPage() {
    const {props} = usePage<Props & {slug: string}>();
    const errors = props.errors;
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
                <Button>
                    Enter
                </Button>
            </Form>
        </div>
    }

    return (
        <div className="container mx-auto">
            <h2>{props.party.name}</h2>
            <p>Hello {props.guest.name}!</p>
        </div>
    )
}
