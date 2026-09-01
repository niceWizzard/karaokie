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

        // 1. Search for video IDs and snippets
        $searchResult = \Youtube::searchVideos(
            $request->input('title').' karaoke', 20, null, ['id', 'snippet']
        );

        if (! $searchResult) {
            return response()->json([]);
        }

        // 2. Extract video IDs
        $videoIds = array_map(fn ($item) => $item->id->videoId, $searchResult);

        // 3. Batch fetch video details (including 'status')
        $videoDetails = \Youtube::getVideoInfo($videoIds);

        $output = [];
        foreach ($videoDetails as $item) {
            // 4. Filter out non-embeddable or non-public videos
            if (isset($item->status->embeddable) && ! $item->status->embeddable) {
                continue;
            }

            $output[] = [
                'title' => $item->snippet->title,
                'id' => $item->id,
                'thumbnail' => $item->snippet->thumbnails->default->url,
                'uri' => 'https://www.youtube.com/watch?v='.$item->id,
                'duration' => $item->contentDetails->duration,
            ];
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
                // Update party current song
                $nextSong = Song::where('party_id', $song->party_id)
                    ->where('queue_order', '>', $song->queue_order)
                    ->orderBy('queue_order')->first();

                if ($nextSong) {
                    Party::where('slug', $song->party->slug)->update(['current_song_id' => $nextSong->id]);
                }

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
            \Log::error('Error while deleting song: '.$e->getMessage());

            return Inertia::flash(['toast' => [
                'type' => 'error',
                'message' => 'Something went wrong.',
            ]]);
        }
    }
}
