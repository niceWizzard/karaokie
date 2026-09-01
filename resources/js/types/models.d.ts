interface Song
{
    uri: string;
    id : number;
    title: string;
    thumbnail: string;
    duration: string;
    queue_order: number;
}

interface Party {
    name: string;
    slug: string;
    current_song_id: number | null;
}

interface Guest {
    id: number;
    name: string;
    joined_at: string;
}
