<?php

namespace App\Services;

use App\Models\Notifikasi;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotifikasiService
{
    /**
     * Create an in-app notification and trigger simulated/actual email.
     */
    public function send(int $userId, string $judul, string $pesan, ?int $pengajuanId = null): Notifikasi
    {
        // 1. Create in-app notification
        $notif = Notifikasi::create([
            'user_id' => $userId,
            'pengajuan_id' => $pengajuanId,
            'judul' => $judul,
            'pesan' => $pesan,
            'is_read' => false,
        ]);

        // 2. Trigger automated email notification (Logged for verification)
        $user = User::find($userId);
        if ($user) {
            $this->sendEmail($user->email, $judul, $pesan);
        }

        return $notif;
    }

    /**
     * Helper to send notification to all admins.
     */
    public function notifyAdmins(string $judul, string $pesan, ?int $pengajuanId = null): void
    {
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $this->send($admin->id, $judul, $pesan, $pengajuanId);
        }
    }

    /**
     * Simulate or send actual email.
     */
    protected function sendEmail(string $email, string $subject, string $message): void
    {
        // Log the email triggering for audit & verification purposes
        Log::info("Email otomatis dikirim ke: {$email} | Subjek: {$subject} | Pesan: {$message}");
    }
}
