<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\UserManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    protected $userService;

    public function __construct(UserManagementService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * List all petugas desa accounts.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['desa', 'is_profile_complete']);
        
        // Map status_profil to is_profile_complete if needed, depending on how frontend sends it
        if ($request->filled('status_profil')) {
            $filters['is_profile_complete'] = $request->status_profil === 'lengkap';
        }

        $users = $this->userService->listPetugas($filters);

        return response()->json([
            'status' => 'success',
            'data' => $users,
        ]);
    }

    /**
     * Create a new petugas desa account.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'desa' => 'required|string|max:255',
        ]);

        $user = $this->userService->createPetugasAccount($request->all(), $request->user()->id);

        return response()->json([
            'status' => 'success',
            'message' => 'Akun petugas berhasil dibuat.',
            'data' => $user,
        ]);
    }

    /**
     * Update an existing petugas desa account.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        if ($user->role !== 'petugas_desa') {
            return response()->json(['message' => 'Hanya bisa mengedit akun petugas desa.'], 403);
        }

        $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'desa' => 'nullable|string|max:255',
            'nik' => 'nullable|string|regex:/^\d{16}$/',
            'phone' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
        ]);

        $updatedUser = $this->userService->updatePetugasAccount($user->id, $request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Akun petugas berhasil diperbarui.',
            'data' => $updatedUser,
        ]);
    }

    /**
     * Delete a petugas desa account.
     */
    public function destroy(User $user): JsonResponse
    {
        if ($user->role !== 'petugas_desa') {
            return response()->json(['message' => 'Hanya bisa menghapus akun petugas desa.'], 403);
        }

        $this->userService->deletePetugasAccount($user->id);

        return response()->json([
            'status' => 'success',
            'message' => "Akun petugas berhasil dihapus.",
        ]);
    }
}
