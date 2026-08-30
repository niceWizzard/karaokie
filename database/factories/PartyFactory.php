<?php

namespace Database\Factories;

use App\Models\Party;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Party>
 */
class PartyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->domainName(),
            'slug' => $this->faker->text(8),
            'pin' => str($this->faker->numberBetween(1000, 9999)),
            'secret_hash' => $this->faker->sha256(),
            'current_song_id' => null,
        ];
    }
}
