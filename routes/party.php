<?php

use App\Http\Controllers\PartyController;
use App\Http\Controllers\PartyGuestController;
use App\Http\Controllers\SongController;
use Illuminate\Support\Facades\Route;

Route::prefix('party')->name('party.')->controller(PartyController::class)->group(function () {
    Route::get('/create', 'create')->name('create');
    Route::post('/store', 'store')->name('store');
    Route::get('/{slug}', 'show')->name('show');
});

Route::prefix('join')->name('join.')->controller(PartyGuestController::class)->group(function () {
    Route::get('/{slug}', 'index')->name('index');
    Route::post('/{slug}', 'store')->name('store');
});


Route::prefix('song')->name('song.')->controller(SongController::class)->group(function () {
    Route::post('/{slug}', 'store')->name('store');
});
