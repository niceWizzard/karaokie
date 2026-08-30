import {Button} from "@/components/ui/button";

type Props = {isAuthorized: false} | { isAuthorized: true;
    party: {
        name: string;
        slug: string;
    }
}

export default function ShowPartyPage(props: Props) {


    if(!props.isAuthorized) {
        return <div className="flex flex-col items-center justify-center flex-1 ">
            <h2 className="font-bold text-2xl tracking-tighter ">Unauthorized</h2>
            <p className="font-light">You are not authorized to see this page.</p>
        </div>
    }

    const {party} = props;

    return (
        <div className="container mx-auto max-sm:px-3 py-4 pt-6 flex flex-col gap-4">
            <h2 className="text-2xl font-bold tracking-tight">{party.name}</h2>
            <hr/>
            <div className="w-full max-w-2xl bg-gray-400  aspect-video mx-auto">
            </div>
            <div className="flex flex-col w-full">
                <h3 className="text-lg ">Song Title Here</h3>
                <div className="flex gap-2 w-full justify-center">
                    <Button>Previous</Button>
                    <Button>Pause</Button>
                    <Button>Next</Button>
                </div>
            </div>
            <hr/>
            <h3 className="text-lg">Queue</h3>
        </div>
    )
}
