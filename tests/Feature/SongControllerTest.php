<?php

use App\Models\Guest;
use App\Models\Party;
use App\Models\Song;
use Illuminate\Support\Facades\Hash;

function generateMockVidData(array $values = []): object
{
    $defaults = [
        'id' => '12345',
        'snippet' => [
            'title' => 'Test Karaoke Song',
            'thumbnails' => [
                'default' => [
                    'url' => 'https://img.youtube.com/vi/12345/default.jpg',
                ],
            ],
        ],
        'contentDetails' => [
            'duration' => 'PT3M30S',
        ],
        'status' => [
            'embeddable' => true,
            'privacyStatus' => 'public',
        ],
    ];

    // Deep merge defaults with provided overrides
    $merged = array_replace_recursive($defaults, $values);

    return json_decode(json_encode($merged));
}

beforeEach(function () {
    // Define reusable properties on $this
    $this->party = Party::factory()->create();
    $this->guest = Guest::factory()->create(['party_id' => $this->party->id]);
    $this->mockVidData = generateMockVidData([
        'snippet' => ['title' => 'Default Reusable Song'],
    ]);
});

test('a guest can store a song in the queue', function () {
    $party = $this->party;
    $guest = $this->guest;
    $mockVidData = $this->mockVidData;
    Youtube::shouldReceive('parseVidFromURL')
        ->once()
        ->with('https://www.youtube.com/watch?v=12345')
        ->andReturn('12345');

    Youtube::shouldReceive('getVideoInfo')
        ->once()
        ->with('12345')
        ->andReturn($mockVidData);

    $response = $this->withCookie("guest-token-{$party->slug}", $guest->session_token)
        ->post(route('song.store', ['slug' => $party->slug]), [
            'uri' => 'https://www.youtube.com/watch?v=12345',
        ]);
    $response->assertRedirect();
    $this->assertDatabaseHas('songs', [
        'party_id' => $party->id,
        'guest_id' => $guest->id,
        'title' => 'Default Reusable Song',
        'queue_order' => 1,
    ]);
    $response->assertInertiaFlash('toast', [
        'type' => 'success',
        'message' => 'Added song to queue.',
    ]);
});

test('a non guest cannot store a song in the queue', function () {
    $response = $this->post(
        route('song.store', ['slug' => $this->party->slug]), [
            'uri' => 'https://www.youtube.com/watch?v=12345',
        ]);
    $response->assertRedirect();
    $this->assertDatabaseCount('songs', 0);
});

test('song queue order is ordered based on time added', function () {
    $party = $this->party;
    $guest = $this->guest;
    $mockVidData = $this->mockVidData;
    Youtube::shouldReceive('parseVidFromURL')
        ->twice()
        ->with('https://www.youtube.com/watch?v=12345')
        ->andReturn('12345');

    Youtube::shouldReceive('getVideoInfo')
        ->twice()
        ->with('12345')
        ->andReturn($mockVidData);

    $this->withCookie("guest-token-{$party->slug}", $guest->session_token)
        ->post(route('song.store', ['slug' => $party->slug]), [
            'uri' => 'https://www.youtube.com/watch?v=12345',
        ]);

    $this->withCookie("guest-token-{$party->slug}", $guest->session_token)
        ->post(route('song.store', ['slug' => $party->slug]), [
            'uri' => 'https://www.youtube.com/watch?v=12345',
        ]);

    $this->assertDatabaseCount('songs', 2);
    $this->assertDatabaseHas('songs', [
        'party_id' => $party->id,
        'guest_id' => $guest->id,
        'title' => 'Default Reusable Song',
        'queue_order' => 2,
    ]);
});

test('deletion of song reorders queue', function () {
    $party = $this->party;
    $guest = $this->guest;
    $mockVidData = $this->mockVidData;
    Youtube::shouldReceive('parseVidFromURL')
        ->with('https://www.youtube.com/watch?v=12345')
        ->andReturn('12345');

    Youtube::shouldReceive('getVideoInfo')
        ->with('12345')
        ->andReturn($mockVidData);
    $cookieName = "guest-token-{$party->slug}";

    // Add 3 songs
    $this->withCookie($cookieName, $guest->session_token)
        ->post(route('song.store', ['slug' => $party->slug]), [
            'uri' => 'https://www.youtube.com/watch?v=12345',
        ]);
    $this->withCookie($cookieName, $guest->session_token)
        ->post(route('song.store', ['slug' => $party->slug]), [
            'uri' => 'https://www.youtube.com/watch?v=12345',
        ]);
    $this->withCookie($cookieName, $guest->session_token)
        ->post(route('song.store', ['slug' => $party->slug]), [
            'uri' => 'https://www.youtube.com/watch?v=12345',
        ]);
    $middleSong = Song::where('party_id', $party->id)
        ->orderBy('queue_order')
        ->skip(1)
        ->first();

    $this->withCookie($cookieName, $guest->session_token)
        ->delete(route('song.destroy', ['song' => $middleSong]));

    $this->assertDatabaseCount('songs', 2);
    foreach (Song::where('party_id', $party->id)->get() as $song) {
        $this->assertLessThan(3, $song->queue_order);
    }
});

test('storing a song requires a valid uri', function () {
    $party = $this->party;
    $guest = $this->guest;

    $response = $this->withCookie("guest-token-{$party->slug}", $guest->session_token)
        ->post(route('song.store', ['slug' => $party->slug]), [
            'uri' => 'invalid-url',
        ]);

    $response->assertSessionHasErrors(['uri']);
    $this->assertDatabaseCount('songs', 0);
});

test('store handles youtube api exception gracefully', function () {
    $party = $this->party;
    $guest = $this->guest;

    Youtube::shouldReceive('parseVidFromURL')
        ->once()
        ->with('https://www.youtube.com/watch?v=invalid')
        ->andReturn('invalid');

    Youtube::shouldReceive('getVideoInfo')
        ->once()
        ->with('invalid')
        ->andThrow(new Exception('Video not found'));

    $response = $this->withCookie("guest-token-{$party->slug}", $guest->session_token)
        ->post(route('song.store', ['slug' => $party->slug]), [
            'uri' => 'https://www.youtube.com/watch?v=invalid',
        ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors(['error']);
    $this->assertDatabaseCount('songs', 0);
});

test('unauthenticated request to destroy redirects to join index', function () {
    $song = Song::create([
        'title' => 'Test Song',
        'uri' => 'https://www.youtube.com/watch?v=12345',
        'party_id' => $this->party->id,
        'guest_id' => $this->guest->id,
        'queue_order' => 1,
        'duration' => 'PT3M',
        'thumbnail' => 'https://img.youtube.com/vi/12345/default.jpg',
    ]);

    $response = $this->delete(route('song.destroy', ['song' => $song]));

    $response->assertRedirect(route('join.index', ['slug' => $this->party->slug]));
    $this->assertDatabaseHas('songs', ['id' => $song->id]);
});

test('a guest cannot delete another guest song', function () {
    $party = $this->party;
    $guest1 = $this->guest;
    $guest2 = Guest::factory()->create(['party_id' => $party->id]);

    $song = Song::create([
        'title' => 'Guest 1 Song',
        'uri' => 'https://www.youtube.com/watch?v=12345',
        'party_id' => $party->id,
        'guest_id' => $guest1->id,
        'queue_order' => 1,
        'duration' => 'PT3M',
        'thumbnail' => 'https://img.youtube.com/vi/12345/default.jpg',
    ]);

    $response = $this->withCookie("guest-token-{$party->slug}", $guest2->session_token)
        ->delete(route('song.destroy', ['song' => $song]));

    $response->assertRedirect();
    $response->assertInertiaFlash('toast', [
        'type' => 'error',
        'message' => "Unauthorized. You can' delete this song!",
    ]);

    $this->assertDatabaseHas('songs', ['id' => $song->id]);
});

test('host with party secret cookie can delete any song', function () {
    $party = Party::factory()->create([
        'secret_hash' => Hash::make('secret123'),
    ]);
    $guest = Guest::factory()->create(['party_id' => $party->id]);

    $song = Song::create([
        'title' => 'Guest Song',
        'uri' => 'https://www.youtube.com/watch?v=12345',
        'party_id' => $party->id,
        'guest_id' => $guest->id,
        'queue_order' => 1,
        'duration' => 'PT3M',
        'thumbnail' => 'https://img.youtube.com/vi/12345/default.jpg',
    ]);

    $response = $this->withCookie("party-secret-{$party->slug}", 'secret123')
        ->delete(route('song.destroy', ['song' => $song]));

    $response->assertRedirect();
    $response->assertInertiaFlash('toast', [
        'type' => 'success',
        'message' => 'Song removed successfully.',
    ]);
    $this->assertDatabaseMissing('songs', ['id' => $song->id]);
});

test('deleting a song updates party current song id when next song exists', function () {
    $party = $this->party;
    $guest = $this->guest;

    $song1 = Song::create([
        'title' => 'Song 1',
        'uri' => 'https://www.youtube.com/watch?v=11111',
        'party_id' => $party->id,
        'guest_id' => $guest->id,
        'queue_order' => 1,
        'duration' => 'PT3M',
        'thumbnail' => 'https://img.youtube.com/vi/11111/default.jpg',
    ]);

    $song2 = Song::create([
        'title' => 'Song 2',
        'uri' => 'https://www.youtube.com/watch?v=22222',
        'party_id' => $party->id,
        'guest_id' => $guest->id,
        'queue_order' => 2,
        'duration' => 'PT3M',
        'thumbnail' => 'https://img.youtube.com/vi/22222/default.jpg',
    ]);

    $this->withCookie("guest-token-{$party->slug}", $guest->session_token)
        ->delete(route('song.destroy', ['song' => $song1]));

    $party->refresh();
    expect($party->current_song_id)->toBe($song2->id);
});

test('guest can search for songs', function () {
    Youtube::shouldReceive('searchVideos')
        ->once()
        ->with('Queen karaoke', 20, null, ['id', 'snippet'])
        ->andReturn([
            (object) [
                'id' => (object) ['videoId' => '12345'],
                'snippet' => (object) ['title' => 'Queen - Bohemian Rhapsody'],
            ],
        ]);

    Youtube::shouldReceive('getVideoInfo')
        ->once()
        ->with(['12345'])
        ->andReturn([
            (object) [
                'id' => '12345',
                'snippet' => (object) [
                    'title' => 'Queen - Bohemian Rhapsody',
                    'thumbnails' => (object) [
                        'default' => (object) ['url' => 'https://img.youtube.com/12345.jpg'],
                    ],
                ],
                'contentDetails' => (object) ['duration' => 'PT5M55S'],
                'status' => (object) ['embeddable' => true],
            ],
        ]);

    $response = $this->getJson(route('song.search', ['title' => 'Queen']));

    $response->assertOk()
        ->assertJson([
            [
                'title' => 'Queen - Bohemian Rhapsody',
                'id' => '12345',
                'thumbnail' => 'https://img.youtube.com/12345.jpg',
                'uri' => 'https://www.youtube.com/watch?v=12345',
                'duration' => 'PT5M55S',
            ],
        ]);
});

test('search filters out non embeddable videos', function () {
    Youtube::shouldReceive('searchVideos')
        ->once()
        ->with('Queen karaoke', 20, null, ['id', 'snippet'])
        ->andReturn([
            (object) [
                'id' => (object) ['videoId' => '12345'],
                'snippet' => (object) ['title' => 'Non Embeddable Song'],
            ],
        ]);

    Youtube::shouldReceive('getVideoInfo')
        ->once()
        ->with(['12345'])
        ->andReturn([
            (object) [
                'id' => '12345',
                'snippet' => (object) [
                    'title' => 'Non Embeddable Song',
                    'thumbnails' => (object) [
                        'default' => (object) ['url' => 'https://img.youtube.com/12345.jpg'],
                    ],
                ],
                'contentDetails' => (object) ['duration' => 'PT3M'],
                'status' => (object) ['embeddable' => false],
            ],
        ]);

    $response = $this->getJson(route('song.search', ['title' => 'Queen']));

    $response->assertOk()
        ->assertExactJson([]);
});

test('search requires a title of at least 2 characters', function () {
    $response = $this->getJson(route('song.search', ['title' => 'a']));

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['title']);
});
