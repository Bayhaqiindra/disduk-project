<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DokumenController;
use App\Http\Controllers\Api\LayananController;
use App\Http\Controllers\Api\NotifikasiController;
use App\Http\Controllers\Api\PengajuanController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\UserManagementController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Authentication
Route::post('/login', [AuthController::class, 'login']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth profile & logout
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    // Profile Management (Can be accessed even if profile is not complete)
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile/complete', [ProfileController::class, 'complete']);

    // Core Features - Must have complete profile
    Route::middleware('profile.complete')->group(function () {
        // Layanan (Services)
    Route::get('/layanan', [LayananController::class, 'index']);
    Route::get('/layanan/{id}', [LayananController::class, 'show']);

    // Pengajuan (Submissions)
    Route::get('/pengajuan', [PengajuanController::class, 'index']);
    Route::post('/pengajuan', [PengajuanController::class, 'store']);
    Route::get('/pengajuan/{id}', [PengajuanController::class, 'show']);
    
    // Status updates (Admin Only)
    Route::put('/pengajuan/{id}/verify', [PengajuanController::class, 'verify']);
    Route::put('/pengajuan/{id}/return', [PengajuanController::class, 'return']);
    Route::put('/pengajuan/{id}/process', [PengajuanController::class, 'process']);
    Route::post('/pengajuan/{id}/complete', [PengajuanController::class, 'complete']); // Using POST to allow multipart form upload

    // Dokumen (Secure serving)
    Route::get('/dokumen/{id}/download', [DokumenController::class, 'download']);
    Route::get('/dokumen/{id}/preview', [DokumenController::class, 'preview']);

    // Notifikasi
    Route::get('/notifikasi', [NotifikasiController::class, 'index']);
    Route::get('/notifikasi/unread-count', [NotifikasiController::class, 'unreadCount']);
    Route::put('/notifikasi/{id}/read', [NotifikasiController::class, 'read']);
    Route::put('/notifikasi/read-all', [NotifikasiController::class, 'readAll']);

    // Dashboard Stats
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
        Route::get('/dashboard/chart', [DashboardController::class, 'chart']);

        // Admin User Management
        Route::get('/admin/users', [UserManagementController::class, 'index']);
        Route::post('/admin/users', [UserManagementController::class, 'store']);
        Route::put('/admin/users/{user}/reset-password', [UserManagementController::class, 'resetPassword']);
        Route::put('/admin/users/{user}/toggle-active', [UserManagementController::class, 'toggleActive']);
    });
});
