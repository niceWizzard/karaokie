<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use App\Models\Party;
use App\Models\Song;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
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
            $request->input('title').' karaoke', 10, null, ['id', 'snippet']
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

    public function destroy(Request $request, Song $song)
    {
        $cookieName = 'guest-token-'.$song->party->slug;

        if (! $request->hasCookie($cookieName) && ! $request->hasCookie('party-secret-'.$song->party->slug)) {
            return Redirect::route('join.index', ['slug' => $song->party->slug]);
        }
        if ($request->cookie($cookieName) !== $song->guest->session_token &&
            ! Hash::check($request->cookie('party-secret-'.$song->party->slug), $song->party->secret_hash)
        ) {
            return Inertia::flash(['toast' => [
                'type' => 'error',
                'message' => 'Unauthorized. You can\' delete this song!',
            ]])->back();
        }

        try {
            DB::transaction(function () use ($song) {
                $allSongs = Song::where('party_id', $song->party->id)->orderBy('queue_order')->get();
                foreach ($allSongs as $curSong) {
                    if ($curSong->queue_order > $song->queue_order) {
                        $curSong->queue_order -= 1;
                        $curSong->save();
                    }
                }
                $song->delete();
            });

            return Inertia::flash(['toast' => [
                'type' => 'success',
                'message' => 'Song removed successfully.',
            ]])->back();
        } catch (\Throwable $e) {
            \Log::error("Error while deleting song: " . $e->getMessage());
            return Inertia::flash(['toast' => [
                'type' => 'error',
                'message' => 'Something went wrong.',
            ]]);
        }
    }
}
