<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengajuan;
use App\Services\PengajuanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PengajuanController extends Controller
{
    protected PengajuanService $pengajuanService;

    public function __construct(PengajuanService $pengajuanService)
    {
        $this->pengajuanService = $pengajuanService;
    }

    /**
     * Get list of pengajuan (Enforces RLS globally).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Pengajuan::with(['layanan', 'user'])
            ->orderBy('created_at', 'desc');

        // Optional filtering for admin
        if ($request->user()->role === 'admin') {
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }
            if ($request->filled('layanan_id')) {
                $query->where('layanan_id', $request->layanan_id);
            }
            if ($request->filled('desa')) {
                $query->whereHas('user', function ($q) use ($request) {
                    $q->where('desa', 'like', '%' . $request->desa . '%');
                });
            }
        }

        $pengajuan = $query->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $pengajuan
        ]);
    }

    /**
     * Store a new pengajuan.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'layanan_id' => 'required|exists:layanan,id',
            'formulir' => 'required|file|max:10240|mimes:pdf,jpg,png', // Max 10MB
            'persyaratan' => 'required|array|min:1',
            'persyaratan.*' => 'required|file|max:10240|mimes:pdf,jpg,png', // Max 10MB
        ]);

        $pengajuan = $this->pengajuanService->create(
            Auth::id(),
            $request->layanan_id,
            $request->file('formulir'),
            $request->file('persyaratan')
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Pengajuan berhasil dibuat',
            'data' => $pengajuan->load('layanan')
        ], 21);
    }

    /**
     * Get details of a single pengajuan (Securely checks RLS).
     */
    public function show(int $id): JsonResponse
    {
        // Finding record; automatically scopes by RlsScope if user is petugas_desa
        $pengajuan = Pengajuan::with(['layanan', 'user', 'uploads.uploader', 'logs.user'])->find($id);

        if (!$pengajuan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengajuan tidak ditemukan atau Anda tidak memiliki akses.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $pengajuan
        ]);
    }

    /**
     * Admin: Verify files (set status to diverifikasi).
     */
    public function verify(int $id): JsonResponse
    {
        $this->authorizeAdmin();

        $pengajuan = Pengajuan::findOrFail($id);

        if ($pengajuan->status !== 'menunggu') {
            return response()->json([
                'status' => 'error',
                'message' => 'Pengajuan ini tidak sedang menunggu verifikasi.'
            ], 400);
        }

        $updated = $this->pengajuanService->updateStatus($pengajuan, 'diverifikasi');

        return response()->json([
            'status' => 'success',
            'message' => 'Berkas berhasil diverifikasi',
            'data' => $updated
        ]);
    }

    /**
     * Admin: Return files with audit notes.
     */
    public function return(Request $request, int $id): JsonResponse
    {
        $this->authorizeAdmin();

        $request->validate([
            'catatan' => 'required|string|min:5',
        ]);

        $pengajuan = Pengajuan::findOrFail($id);

        if ($pengajuan->status !== 'menunggu') {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya pengajuan dengan status menunggu yang dapat dikembalikan.'
            ], 400);
        }

        $updated = $this->pengajuanService->updateStatus($pengajuan, 'dikembalikan', $request->catatan);

        return response()->json([
            'status' => 'success',
            'message' => 'Berkas berhasil dikembalikan ke petugas desa dengan catatan.',
            'data' => $updated
        ]);
    }

    /**
     * Admin: Process pengajuan (set status to diproses).
     */
    public function process(int $id): JsonResponse
    {
        $this->authorizeAdmin();

        $pengajuan = Pengajuan::findOrFail($id);

        if ($pengajuan->status !== 'diverifikasi') {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya pengajuan yang telah diverifikasi yang dapat diproses.'
            ], 400);
        }

        $updated = $this->pengajuanService->updateStatus($pengajuan, 'diproses');

        return response()->json([
            'status' => 'success',
            'message' => 'Pengajuan sedang diproses',
            'data' => $updated
        ]);
    }

    /**
     * Admin: Complete and upload result file (set status to selesai).
     */
    public function complete(Request $request, int $id): JsonResponse
    {
        $this->authorizeAdmin();

        $request->validate([
            'file_hasil' => 'required|file|max:10240|mimes:pdf,jpg,png', // Max 10MB
        ]);

        $pengajuan = Pengajuan::findOrFail($id);

        if ($pengajuan->status !== 'diproses') {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya pengajuan dengan status diproses yang dapat diselesaikan.'
            ], 400);
        }

        $updated = $this->pengajuanService->updateStatus(
            $pengajuan,
            'selesai',
            'Dokumen kependudukan telah berhasil diterbitkan.',
            $request->file('file_hasil')
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Pengajuan selesai dan dokumen telah diterbitkan!',
            'data' => $updated
        ]);
    }

    /**
     * Help abort unless user is Admin.
     */
    protected function authorizeAdmin(): void
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Aksi ini hanya dapat dilakukan oleh Admin.');
        }
    }
}
