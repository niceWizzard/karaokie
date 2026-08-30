<?php

namespace App\Models;

use Database\Factories\PartyFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Date;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $pin
 * @property string $secret_hash
 * @property int|null $current_song_id
 * @property Date|null $created_at
 * @property Date|null $updated_at
 */
class Party extends Model
{
    /** @use HasFactory<PartyFactory> */
    use HasFactory;
}
