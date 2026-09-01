<?php

namespace App\Models;

use Database\Factories\GuestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Guest extends Model
{
    /** @use HasFactory<GuestFactory> */
    use HasFactory;

    protected $fillable = ['name', 'session_token', 'party_id'];
}
