<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\UserManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    protected $userService;

    public function __construct(UserManagementService $userService)
    {
        $this->userService = $userService;
    }

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

        $user = $this->userService->completeProfile($user->id, $request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil dilengkapi.',
            'data' => $user,
        ]);
    }
}
