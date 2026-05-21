<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile.
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $request->user(),
        ]);
    }

    /**
     * Complete user profile (first-login flow).
     */
    public function complete(Request $request): JsonResponse
    {
        $user = $request->user();

        // If profile is already complete, don't allow modifying via this endpoint
        if ($user->is_profile_complete) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil Anda sudah lengkap. Tidak dapat diubah melalui form ini.',
            ], 403);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nik' => ['required', 'string', 'regex:/^\d{16}$/'],
            'phone' => ['required', 'string', 'max:20'],
            'alamat' => ['required', 'string', 'min:10'],
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ]);

        $user->name = $request->name;
        $user->nik = $request->nik;
        $user->phone = $request->phone;
        $user->alamat = $request->alamat;
        $user->is_profile_complete = true;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        // Notifikasi ke admin bahwa petugas ini telah melengkapi profil
        // (Implementation for NotifikasiService will be added later or we can inject it now)

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil dilengkapi.',
            'data' => $user,
        ]);
    }
}
