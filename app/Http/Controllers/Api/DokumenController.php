<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DokumenUpload;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DokumenController extends Controller
{
    /**
     * Download a file securely (Automatic RLS check).
     */
    public function download(int $id)
    {
        // Enforces RLS automatically; returns null if petugas_desa is not authorized
        $dokumen = DokumenUpload::find($id);

        if (!$dokumen) {
            return response()->json([
                'status' => 'error',
                'message' => 'Dokumen tidak ditemukan atau Anda tidak memiliki akses.'
            ], 404);
        }

        $fullPath = storage_path('app/' . $dokumen->path);

        if (!file_exists($fullPath)) {
            return response()->json([
                'status' => 'error',
                'message' => 'File fisik tidak ditemukan di server.'
            ], 404);
        }

        return response()->download($fullPath, $dokumen->nama_file);
    }

    /**
     * Preview a file in-browser securely (Automatic RLS check).
     */
    public function preview(int $id)
    {
        // Enforces RLS automatically
        $dokumen = DokumenUpload::find($id);

        if (!$dokumen) {
            return response()->json([
                'status' => 'error',
                'message' => 'Dokumen tidak ditemukan atau Anda tidak memiliki akses.'
            ], 404);
        }

        $fullPath = storage_path('app/' . $dokumen->path);

        if (!file_exists($fullPath)) {
            return response()->json([
                'status' => 'error',
                'message' => 'File fisik tidak ditemukan di server.'
            ], 404);
        }

        // Determine content-type
        $headers = [
            'Content-Type' => $dokumen->mime_type ?: 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $dokumen->nama_file . '"'
        ];

        return response()->file($fullPath, $headers);
    }
}
