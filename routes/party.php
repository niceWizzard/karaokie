<?php


use App\Http\Controllers\PartyController;
use Illuminate\Support\Facades\Route;


Route::prefix('party')->name('party.')->controller(PartyController::class)->group(function () {
    Route::get('/create', 'create')->name('create');
    Route::post('/store', 'store')->name('store');
    Route::get('/{slug}', 'show')->name('show');
});
