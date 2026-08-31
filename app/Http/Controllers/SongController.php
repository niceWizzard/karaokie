<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use App\Models\Party;
use App\Models\Song;
use Illuminate\Http\Request;
use Redirect;

class SongController extends Controller
{
    public function store(Request $request, string $slug)
    {
        $party = Party::where('slug', $slug)->firstOrFail();
        $guestToken = $request->cookie('guest-token-'.$slug);
        if (! $guestToken) {
            return Redirect::route('join.index');
        }

        $guest = Guest::where('session_token', $guestToken)->firstOrFail();
        $request->validate([
            'uri' => ['required', 'url'],
        ]);
        $curCount = Song::where('party_id', $party->id)->count();

        try {
            $vidData = \Youtube::getVideoInfo(
                \Youtube::parseVidFromURL($request->input('uri'))
            );

            Song::create([
                'title' => $vidData->snippet->title,
                'uri' => $request->input('uri'),
                'party_id' => $party->id,
                'guest_id' => $guest->id,
                'queue_order' => $curCount + 1,
                'duration' => $vidData->contentDetails->duration,
                'thumbnail' => $vidData->snippet->thumbnails->default->url,
            ]);

            return Redirect::back();
        } catch (\Exception $e) {
            return Redirect::back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function search(Request $request)
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255', 'min:2'],
        ]);

        $searchResult = \Youtube::searchVideos(
            $request->input('title') . ' karaoke', 10, null, ['id', 'snippet']
        );
        $output = [];
        if ($searchResult) {
            foreach ($searchResult as $item) {
                $videoId = $item->id->videoId;
                $title = $item->snippet->title;
                $output[] = [
                    'title' => $title,
                    'id' => $videoId,
                    'thumbnail' => $item->snippet->thumbnails->default->url,
                    'url' => 'https://www.youtube.com/watch?v='.$videoId,
                ];
            }
        }

        return response()->json($output);

    }
}
