<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed Petugas Desa
        User::updateOrCreate(
            ['email' => 'petugas@desa.id'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('password'),
                'role' => 'petugas_desa',
                'desa' => 'Senggoro',
                'phone' => '081234567890',
            ]
        );

        // Seed Admin 1
        User::updateOrCreate(
            ['email' => 'admin1@disduk.id'],
            [
                'name' => 'Siti Aminah',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'desa' => null,
                'phone' => '082198765432',
            ]
        );

        // Seed Admin 2
        User::updateOrCreate(
            ['email' => 'admin2@disduk.id'],
            [
                'name' => 'Ahmad Roni',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'desa' => null,
                'phone' => '082198765433',
            ]
        );
    }
}
