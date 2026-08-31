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
}

interface Guest {
    name: string;
    joined_at: string;
}
