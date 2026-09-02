<?php

namespace App\Http\Controllers;

use App\Models\Party;
use App\Models\Song;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PartyController extends Controller
{
    public function create(Request $request)
    {
        return Inertia::render('party/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'min:3'],
            'pin' => ['nullable', 'string',  'digits:4'],
        ]);

        $slug = Str::random(8);
        $partySecret = Str::uuid()->toString();
        Party::create([
            'slug' => $slug,
            'secret_hash' => Hash::make($partySecret),
            ...$request->only('name', 'pin'),
        ]);

        $cookie = cookie(
            'party-secret-'.$slug,
            $partySecret,
            24 * 60,
        );

        return Redirect::route('party.show', ['slug' => $slug])->withCookie($cookie);
    }

    public function show(Request $request, string $slug): Response
    {
        $party = Party::active()->where('slug', $slug)->firstOrFail();

        $cookieSecret = $request->cookie('party-secret-'.$slug);

        $isHost = $cookieSecret && Hash::check($cookieSecret, $party->secret_hash);

        $isAuthorized = $isHost;

        if (! $isAuthorized) {
            return Inertia::render('party/show', [
                'isAuthorized' => false,
            ]);
        }

        $songs = Song::where('party_id', $party->id)->orderBy('queue_order')
            ->with('guest')
            ->get();

        return Inertia::render('party/show', [
            'party' => [
                'id' => $party->id,
                'name' => $party->name,
                'slug' => $party->slug,
                'pin' => $party->pin,
                'current_song_id' => $party->current_song_id,
                'requiresPin' => ! empty($party->pin),
            ],
            'songs' => $songs,
            'isAuthorized' => true,
        ]);
    }

    public function setSongId(Request $request, string $slug): RedirectResponse
    {
        $request->validate([
            'song_id' => ['required', 'integer', 'min:1', 'exists:songs,id'],
        ]);
        $party = Party::active()->where('slug', $slug)->firstOrFail();

        $party->update([
            'current_song_id' => $request->input('song_id'),
        ]);

        return Redirect::back();

    }
}
