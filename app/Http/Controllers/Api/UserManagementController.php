<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    /**
     * List all petugas desa accounts.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', 'petugas_desa')->latest();

        if ($request->filled('desa')) {
            $query->where('desa', $request->desa);
        }

        if ($request->filled('status_profil')) {
            $query->where('is_profile_complete', $request->status_profil === 'lengkap');
        }

        if ($request->filled('status_akun')) {
            $query->where('is_active', $request->status_akun === 'aktif');
        }

        $users = $query->paginate(15);

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

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'petugas_desa',
            'desa' => $request->desa,
            'is_profile_complete' => false,
            'is_active' => true,
            'created_by' => $request->user()->id,
        ]);

        // Trigger notification logic here if needed (e.g. log email that account is created)

        return response()->json([
            'status' => 'success',
            'message' => 'Akun petugas berhasil dibuat.',
            'data' => $user,
        ]);
    }

    /**
     * Reset a petugas desa's password.
     */
    public function resetPassword(Request $request, User $user): JsonResponse
    {
        if ($user->role !== 'petugas_desa') {
            return response()->json(['message' => 'Hanya bisa mereset password petugas desa.'], 403);
        }

        // Generate a random 8 character password
        $newPassword = Str::random(8);

        $user->password = Hash::make($newPassword);
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Password berhasil direset.',
            'data' => [
                'new_password' => $newPassword,
            ]
        ]);
    }

    /**
     * Toggle the active status of a user account.
     */
    public function toggleActive(Request $request, User $user): JsonResponse
    {
        if ($user->role !== 'petugas_desa') {
            return response()->json(['message' => 'Hanya bisa mengelola akun petugas desa.'], 403);
        }

        $user->is_active = !$user->is_active;
        $user->save();

        $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return response()->json([
            'status' => 'success',
            'message' => "Akun petugas berhasil $status.",
            'data' => $user,
        ]);
    }
}
