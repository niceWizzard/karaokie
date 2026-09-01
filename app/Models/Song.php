<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Song extends Model
{
    //
    protected $fillable = [
        'uri',
        'party_id',
        'queue_order',
        'guest_id',
        'title',
        'duration',
        'thumbnail',
    ];

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }


}
