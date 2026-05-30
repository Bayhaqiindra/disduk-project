<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserManagementService
{
    /**
     * Get list of petugas with optional filters.
     */
    public function listPetugas(array $filters = [])
    {
        $query = User::where('role', 'petugas_desa')
            ->orderBy('created_at', 'desc');

        if (isset($filters['desa']) && !empty($filters['desa'])) {
            $query->where('desa', 'like', '%' . $filters['desa'] . '%');
        }

        if (isset($filters['is_profile_complete'])) {
            $query->where('is_profile_complete', filter_var($filters['is_profile_complete'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->paginate(15);
    }

    /**
     * Create a new minimal Petugas account by Admin.
     */
    public function createPetugasAccount(array $data, int $adminId): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'desa' => $data['desa'],
            'role' => 'petugas_desa',
            'is_profile_complete' => false,
            'is_active' => true,
            'created_by' => $adminId,
        ]);
    }

    /**
     * Complete profile on first login by Petugas.
     */
    public function completeProfile(int $userId, array $data): User
    {
        $user = User::findOrFail($userId);

        $updateData = [
            'nik' => $data['nik'],
            'phone' => $data['phone'],
            'alamat' => $data['alamat'],
            'is_profile_complete' => true,
        ];

        // Optional password change
        if (isset($data['password']) && !empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $user->update($updateData);

        return $user;
    }

    /**
     * Update an existing Petugas account by Admin.
     */
    public function updatePetugasAccount(int $userId, array $data): User
    {
        $user = User::findOrFail($userId);

        $updateData = [
            'name' => $data['name'] ?? $user->name,
            'email' => $data['email'] ?? $user->email,
            'desa' => $data['desa'] ?? $user->desa,
            'nik' => $data['nik'] ?? $user->nik,
            'phone' => $data['phone'] ?? $user->phone,
            'alamat' => $data['alamat'] ?? $user->alamat,
        ];

        if (isset($data['password']) && !empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $user->update($updateData);

        return $user;
    }

    /**
     * Delete a user by Admin.
     */
    public function deletePetugasAccount(int $userId): void
    {
        $user = User::findOrFail($userId);
        $user->delete();
    }
}
