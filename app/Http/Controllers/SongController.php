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
        if(!$guestToken) {
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
}
