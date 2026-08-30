<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Date;

/**
 * @mixin Builder<Guest>
 *
 * @property int $id
 * @property int $party_id
 * @property string $session_token
 * @property Date|null $created_at
 * @property Date|null $joined_at
 * @property Date|null $updated_at
 */
class Guest extends Model
{
    protected $fillable = ['name', 'session_token', 'party_id'];
}
