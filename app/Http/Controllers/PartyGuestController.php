<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use App\Models\Party;
use App\Models\Song;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PartyGuestController extends Controller
{
    public function index(Request $request, string $slug)
    {
        $party = Party::where('slug', $slug)->firstOrFail();

        $sessionToken = $request->cookie('guest-token-'.$party->slug);
        if (! $sessionToken) {
            return Inertia::render('join/index', [
                'fresh' => true,
                'slug' => $party->slug,
            ]);
        }

        $guest = Guest::where('session_token', $sessionToken)->firstOrFail();
        $guestSongs = Song::where('party_id', $party->id)->with('guest')
            ->get();

        return Inertia::render('join/index', [
            'fresh' => false,
            'slug' => $party->slug,
            'guest' => $guest->only('name', 'session_token', 'joined_at', 'id'),
            'songs' => $guestSongs,
            'party' => $party->only('name', 'slug'),
        ]);
    }

    public function store(Request $request, string $slug)
    {
        $request->validate([
            'name' => ['required', 'max:255'],
        ]);
        $party = Party::where('slug', $slug)->firstOrFail();

        $nameUsed = Guest::where('party_id', $party->id)
            ->where('name', $request->input('name'))
            ->exists();

        if ($nameUsed) {
            return back()->withErrors([
                'name' => 'The name has already been taken.',
            ]);
        }

        $sessionToken = Str::uuid()->toString();
        Guest::create([
            'party_id' => $party->id,
            'name' => $request->input('name'),
            'session_token' => $sessionToken,
        ]);

        $cookie = Cookie::make('guest-token-'.$party->slug, $sessionToken, 61 * 24);

        return Redirect::back()->withCookie($cookie);
    }
}
