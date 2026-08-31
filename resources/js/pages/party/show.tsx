import {Button} from "@/components/ui/button";
import ReactPlayer from 'react-player'
import {useEffect, useState} from "react";
import {formatIsoDuration} from "@/lib/utils";

type Props = {isAuthorized: false} | { isAuthorized: true;
    party: Party;
    songs: Song[]
}

export default function ShowPartyPage(props: Props) {

    const [currentVideo, setCurrentVideo] = useState(0)


    if(!props.isAuthorized) {
        return <div className="flex flex-col items-center justify-center flex-1 ">
            <h2 className="font-bold text-2xl tracking-tighter ">Unauthorized</h2>
            <p className="font-light">You are not authorized to see this page.</p>
        </div>
    }

    const {party, songs} = props;

    return (
        <div className="container mx-auto max-sm:px-3 py-4 pt-6 flex flex-col gap-4">
            <h2 className="text-2xl font-bold tracking-tight">{party.name}</h2>
            <hr/>
            {
                songs.length ? (
                    <ReactPlayer src={songs[currentVideo].uri} className=" w-full aspect-video max-w-5xl mx-auto"
                         width="100%"
                         height="100%"
                    autoPlay
                     controls

                     onEnded={() => {
                         console.log("ended")
                         if(currentVideo +1 < songs.length) {
                             setCurrentVideo(v => v+1);
                         }
                     }}
                     config={{
                         youtube: {
                             fs: 1,
                             start: 0,
                         }
                     }}>

                    </ReactPlayer>
                ) : (
                    <div className="w-full max-w-2xl bg-gray-400  aspect-video mx-auto">
                    </div>
                )
            }
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
            <div className="flex flex-col gap-2 items-center">
                {
                    songs.map(song => (
                        <div key={`song-${song.id}`}
                            className="flex gap-3 border p-2 w-full rounded-lg max-w-lg"
                        >
                            <img
                                src={song.thumbnail}
                                alt={'Thumbnail of video: '+song.title}
                            />
                            <div className="flex flex-col flex-1">
                                <h2>{song.title}</h2>
                                <span>{formatIsoDuration(song.duration)}</span>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}
