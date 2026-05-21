<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureProfileComplete
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // If user is a petugas desa and profile is not complete, block access.
        if ($user && $user->role === 'petugas_desa' && !$user->is_profile_complete) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda harus melengkapi profil terlebih dahulu sebelum dapat menggunakan sistem.',
                'code' => 'PROFILE_INCOMPLETE'
            ], 403);
        }

        return $next($request);
    }
}
