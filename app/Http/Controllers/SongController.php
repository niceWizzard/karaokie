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
        Song::create([
            'title' => 'Song ' . $curCount + 1,
            'uri' => $request->input('uri'),
            'party_id' => $party->id,
            'guest_id' => $guest->id,
            'queue_order' => $curCount + 1,
        ]);

        return Redirect::back();
    }
}
