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
        // Seed Admin 1 (dibuat duluan karena akan jadi created_by untuk petugas)
        $admin1 = User::updateOrCreate(
            ['email' => 'admin1@disduk.id'],
            [
                'name' => 'Siti Aminah',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'desa' => null,
                'phone' => '082198765432',
                'is_profile_complete' => true,
                'is_active' => true,
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
                'is_profile_complete' => true,
                'is_active' => true,
            ]
        );

        // Seed Petugas Desa (profil sudah lengkap untuk testing)
        User::updateOrCreate(
            ['email' => 'petugas@desa.id'],
            [
                'name' => 'Budi Santoso',
                'password' => Hash::make('password'),
                'role' => 'petugas_desa',
                'desa' => 'Senggoro',
                'phone' => '081234567890',
                'nik' => '1401012345678901',
                'alamat' => 'Jl. Merdeka No. 10, Desa Senggoro, Kec. Bengkalis',
                'is_profile_complete' => true,
                'is_active' => true,
                'created_by' => $admin1->id,
            ]
        );

        // Seed Petugas Desa baru (profil BELUM lengkap — untuk test first-login flow)
        User::updateOrCreate(
            ['email' => 'petugasbaru@desa.id'],
            [
                'name' => 'Rina Wati',
                'password' => Hash::make('password'),
                'role' => 'petugas_desa',
                'desa' => 'Teluk Latak',
                'phone' => null,
                'nik' => null,
                'alamat' => null,
                'is_profile_complete' => false,
                'is_active' => true,
                'created_by' => $admin1->id,
            ]
        );
    }
}
