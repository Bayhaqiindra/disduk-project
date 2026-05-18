<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengajuan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard counts/statistics (Automatically scoped by RLS).
     */
    public function stats(Request $request): JsonResponse
    {
        $total = Pengajuan::count();
        $menunggu = Pengajuan::where('status', 'menunggu')->count();
        $diverifikasi = Pengajuan::where('status', 'diverifikasi')->count();
        $diproses = Pengajuan::where('status', 'diproses')->count();
        $selesai = Pengajuan::where('status', 'selesai')->count();
        $dikembalikan = Pengajuan::where('status', 'dikembalikan')->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total' => $total,
                'menunggu' => $menunggu,
                'diverifikasi' => $diverifikasi,
                'diproses' => $diproses,
                'selesai' => $selesai,
                'dikembalikan' => $dikembalikan,
            ]
        ]);
    }

    /**
     * Get monthly submission chart data (For admins).
     */
    public function chart(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya admin yang memiliki akses data grafik.'
            ], 403);
        }

        // Get submissions group by month for the current year
        $submissions = Pengajuan::select(
                DB::raw("strftime('%m', created_at) as month"),
                DB::raw("count(id) as count")
            )
            ->whereYear('created_at', date('Y'))
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get();

        // Populate months names array
        $monthNames = [
            '01' => 'Jan', '02' => 'Feb', '03' => 'Mar', '04' => 'Apr',
            '05' => 'Mei', '06' => 'Jun', '07' => 'Jul', '08' => 'Agt',
            '09' => 'Sep', '10' => 'Okt', '11' => 'Nov', '12' => 'Des'
        ];

        $chartData = [];
        foreach ($monthNames as $key => $name) {
            $match = $submissions->firstWhere('month', $key);
            $chartData[] = [
                'name' => $name,
                'count' => $match ? $match->count : 0
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $chartData
        ]);
    }
}
