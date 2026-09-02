<?php

namespace App\Models;

use Database\Factories\PartyFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;

class Party extends Model
{
    /** @use HasFactory<PartyFactory> */
    use HasFactory, Prunable;

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

    /**
     * Get the prunable model query for automatic 24-hour cleanup.
     */
    public function prunable()
    {
        return static::where('created_at', '<=', now()->subHours(24));
    }
}
