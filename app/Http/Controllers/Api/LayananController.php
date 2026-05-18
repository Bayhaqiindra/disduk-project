<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Layanan;
use Illuminate\Http\JsonResponse;

class LayananController extends Controller
{
    /**
     * Get all active services.
     */
    public function index(): JsonResponse
    {
        $layanan = Layanan::where('is_active', true)->get();

        return response()->json([
            'status' => 'success',
            'data' => $layanan
        ]);
    }

    /**
     * Get detailed information of a service.
     */
    public function show(int $id): JsonResponse
    {
        $layanan = Layanan::where('is_active', true)->find($id);

        if (!$layanan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Layanan tidak ditemukan atau tidak aktif'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $layanan
        ]);
    }
}
