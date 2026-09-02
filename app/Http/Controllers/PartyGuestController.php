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
        $party = Party::active()->where('slug', $slug)->firstOrFail();

        $sessionToken = $request->cookie('guest-token-'.$party->slug);
        if (! $sessionToken) {
            return Inertia::render('join/index', [
                'fresh' => true,
                'requiresPin' => ! empty($party->pin),
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
            'party' => $party->only('name', 'slug', 'current_song_id'),
        ]);
    }

    public function store(Request $request, string $slug)
    {
        $party = Party::active()->where('slug', $slug)->firstOrFail();

        $request->validate([
            'name' => ['required', 'max:255'],
            'pin' => [
                function ($attribute, $value, $fail) use ($party) {
                    if (! empty($party->pin)) {
                        if (empty($value)) {
                            $fail('A PIN is required for this party.');
                        } elseif ($value !== $party->pin) {
                            $fail('The PIN provided is incorrect.');
                        }
                    }
                },
            ],
        ]);

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

        $cookie = Cookie::make('guest-token-'.$party->slug, $sessionToken, 24 * 60);

        return Redirect::back()->withCookie($cookie);
    }
}
