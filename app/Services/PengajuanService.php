<?php

namespace App\Services;

use App\Models\DokumenUpload;
use App\Models\Pengajuan;
use App\Models\StatusLog;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PengajuanService
{
    protected FileStorageService $storageService;
    protected NotifikasiService $notifService;

    public function __construct(FileStorageService $storageService, NotifikasiService $notifService)
    {
        $this->storageService = $storageService;
        $this->notifService = $notifService;
    }

    /**
     * Create a new pengajuan with uploads.
     */
    public function create(int $userId, int $layananId, UploadedFile $formulir, array $persyaratanFiles): Pengajuan
    {
        return DB::transaction(function () use ($userId, $layananId, $formulir, $persyaratanFiles) {
            // 1. Generate unique nomor pengajuan LYN-YYYYMMDD-XXXXX
            $nomor = 'LYN-' . date('Ymd') . '-' . strtoupper(Str::random(5));

            // 2. Create the pengajuan record
            $pengajuan = Pengajuan::create([
                'nomor_pengajuan' => $nomor,
                'user_id' => $userId,
                'layanan_id' => $layananId,
                'status' => 'menunggu',
            ]);

            // 3. Upload formulir file
            $storedFormulir = $this->storageService.store($formulir);
            DokumenUpload::create([
                'pengajuan_id' => $pengajuan->id,
                'tipe' => 'formulir',
                'nama_file' => $storedFormulir['nama_file'],
                'path' => $storedFormulir['path'],
                'mime_type' => $storedFormulir['mime_type'],
                'ukuran' => $storedFormulir['ukuran'],
                'uploaded_by' => $userId,
            ]);

            // 4. Upload requirements files
            foreach ($persyaratanFiles as $persyaratanId => $file) {
                if ($file instanceof UploadedFile) {
                    $storedFile = $this->storageService->store($file);
                    DokumenUpload::create([
                        'pengajuan_id' => $pengajuan->id,
                        'persyaratan_id' => is_numeric($persyaratanId) ? (int) $persyaratanId : null,
                        'tipe' => 'persyaratan',
                        'nama_file' => $storedFile['nama_file'],
                        'path' => $storedFile['path'],
                        'mime_type' => $storedFile['mime_type'],
                        'ukuran' => $storedFile['ukuran'],
                        'uploaded_by' => $userId,
                    ]);
                }
            }

            // 5. Notify all Admins
            $this->notifService->notifyAdmins(
                "Pengajuan Baru: " . $pengajuan->layanan->nama,
                "Petugas desa telah mengajukan berkas baru dengan nomor {$nomor}.",
                $pengajuan->id
            );

            return $pengajuan;
        });
    }

    /**
     * Update status (with auditing and notification).
     */
    public function updateStatus(Pengajuan $pengajuan, string $newStatus, ?string $catatan = null, ?UploadedFile $fileHasil = null): Pengajuan
    {
        return DB::transaction(function () use ($pengajuan, $newStatus, $catatan, $fileHasil) {
            $oldStatus = $pengajuan->status;
            $adminId = Auth::id();

            // Prepare update data
            $updateData = ['status' => $newStatus];

            if ($newStatus === 'diverifikasi') {
                $updateData['verified_by'] = $adminId;
                $updateData['verified_at'] = now();
            } elseif ($newStatus === 'diproses') {
                $updateData['processed_by'] = $adminId;
                $updateData['processed_at'] = now();
            } elseif ($newStatus === 'selesai') {
                $updateData['completed_at'] = now();
                
                // If Completed, Admin MUST upload the hasil file
                if ($fileHasil) {
                    $storedFile = $this->storageService->store($fileHasil, 'results');
                    DokumenUpload::create([
                        'pengajuan_id' => $pengajuan->id,
                        'tipe' => 'hasil',
                        'nama_file' => $storedFile['nama_file'],
                        'path' => $storedFile['path'],
                        'mime_type' => $storedFile['mime_type'],
                        'ukuran' => $storedFile['ukuran'],
                        'uploaded_by' => $adminId,
                    ]);
                }
            }

            if ($catatan) {
                $updateData['catatan_admin'] = $catatan;
            }

            // Apply updates
            $pengajuan->update($updateData);

            // Audit Log
            StatusLog::create([
                'pengajuan_id' => $pengajuan->id,
                'status_lama' => $oldStatus,
                'status_baru' => $newStatus,
                'catatan' => $catatan,
                'changed_by' => $adminId,
            ]);

            // Notify Petugas Desa
            $judul = "Update Status Pengajuan: " . strtoupper($newStatus);
            $pesan = "Pengajuan dengan nomor {$pengajuan->nomor_pengajuan} telah diubah statusnya menjadi {$newStatus}.";
            
            if ($newStatus === 'dikembalikan') {
                $pesan .= " Catatan perbaikan: {$catatan}";
            }

            $this->notifService->send($pengajuan->user_id, $judul, $pesan, $pengajuan->id);

            return $pengajuan;
        });
    }
}
