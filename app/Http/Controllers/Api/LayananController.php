<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Layanan;
use Illuminate\Http\JsonResponse;

class LayananController extends Controller
{
    /**
     * Get all active services hierarchically (categories with sub-services).
     */
    public function index(): JsonResponse
    {
        $layanan = Layanan::with('subLayanan')
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('urutan')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $layanan
        ]);
    }

    /**
     * Get detailed information of a service/sub-service.
     */
    public function show(int $id): JsonResponse
    {
        $layanan = Layanan::with(['parent', 'subLayanan', 'persyaratan'])
            ->where('is_active', true)
            ->find($id);

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

    /**
     * Get requirements checklist for a specific service/sub-service.
     */
    public function persyaratan(int $id): JsonResponse
    {
        $layanan = Layanan::where('is_active', true)->find($id);

        if (!$layanan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Layanan tidak ditemukan atau tidak aktif'
            ], 404);
        }

        $persyaratan = $layanan->persyaratan()->get();

        return response()->json([
            'status' => 'success',
            'data' => $persyaratan
        ]);
    }
}
