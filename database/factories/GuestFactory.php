<?php

namespace Database\Factories;

use App\Models\Guest;
use App\Models\Party;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Guest>
 */
class GuestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'session_token' => $this->faker->uuid(),
            'party_id' => Party::factory(),
        ];
    }
}
