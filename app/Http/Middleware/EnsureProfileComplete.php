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
        // Only apply to petugas_desa role, Admin doesn't need to complete this specific profile
        if ($request->user() && $request->user()->role === 'petugas_desa' && !$request->user()->is_profile_complete) {
            return response()->json([
                'status' => 'error',
                'message' => 'Silakan lengkapi profil Anda terlebih dahulu.',
                'redirect' => '/profile/complete'
            ], 403);
        }

        return $next($request);
    }
}
