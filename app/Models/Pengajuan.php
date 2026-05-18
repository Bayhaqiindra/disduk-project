<?php

namespace App\Models;

use App\Traits\HasRls;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'nomor_pengajuan',
    'user_id',
    'layanan_id',
    'status',
    'catatan_admin',
    'verified_by',
    'processed_by',
    'verified_at',
    'processed_at',
    'completed_at'
])]
class Pengajuan extends Model
{
    use HasFactory, HasRls;

    protected $table = 'pengajuan';

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
            'processed_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function layanan(): BelongsTo
    {
        return $this->belongsTo(Layanan::class, 'layanan_id');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function uploads(): HasMany
    {
        return $this->hasMany(DokumenUpload::class, 'pengajuan_id');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(StatusLog::class, 'pengajuan_id');
    }
}
