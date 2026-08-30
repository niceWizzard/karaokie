import {Form} from "@inertiajs/react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Field, FieldDescription, FieldLabel} from "@/components/ui/field";
import {Button} from "@/components/ui/button";
import party from "@/routes/party";

export default function CreatePartyPage(a: {}) {
    console.log(a);
    return <div className="container mx-auto">

        <Form className="max-sm:px-4 py-8 flex flex-col justify-center items-center"
            action={party.store()}
        >
            <div className="flex flex-col gap-4  w-full">
                <h2 className="text-xl font-medium ">Create your Party</h2>
                <Field>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input placeholder="Enter name" name="name" />
                    <FieldDescription>This will be shown as the party name for everyone</FieldDescription>
                </Field>
                <Field>
                    <FieldLabel htmlFor="pin">Pin Code</FieldLabel>
                    <Input placeholder="Enter pin" name="pin" />
                    <FieldDescription>This may be asked to verify guests joining to the party</FieldDescription>
                </Field>
                <Button >
                    Create
                </Button>
            </div>
        </Form>

    </div>
}
