<?php

use App\Models\Party;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function (Request $request) {
    $cookies = $request->cookies->all();

    $hostedSlugs = [];
    $joinedSlugs = [];

    foreach ($cookies as $key => $value) {
        if (str_starts_with($key, 'party-secret-')) {
            $hostedSlugs[] = substr($key, strlen('party-secret-'));
        } elseif (str_starts_with($key, 'guest-token-')) {
            $joinedSlugs[] = substr($key, strlen('guest-token-'));
        }
    }

    $hostedParties = ! empty($hostedSlugs)
        ? Party::whereIn('slug', $hostedSlugs)->latest()->get(['id', 'name', 'slug', 'created_at'])
        : [];

    $joinedParties = ! empty($joinedSlugs)
        ? Party::whereIn('slug', $joinedSlugs)->latest()->get(['id', 'name', 'slug', 'created_at'])
        : [];

    return Inertia::render('welcome', [
        'hostedParties' => $hostedParties,
        'joinedParties' => $joinedParties,
    ]);
})->name('home');


require __DIR__.'/party.php';
