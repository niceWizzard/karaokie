<?php

namespace App\Models;

use Database\Factories\PartyFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Party extends Model
{
    /** @use HasFactory<PartyFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'secret_hash',
        'pin',
        'current_song_id',
    ];

    public function scopeActive($query)
    {
        return $query->where('created_at', '>=', now()->subHours(24));
    }
}
