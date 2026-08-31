<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
