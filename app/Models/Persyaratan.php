<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'layanan_id',
    'nama_dokumen',
    'deskripsi',
    'is_wajib',
    'catatan',
    'urutan'
])]
class Persyaratan extends Model
{
    use HasFactory;

    protected $table = 'persyaratan';

    protected function casts(): array
    {
        return [
            'is_wajib' => 'boolean',
            'urutan' => 'integer',
        ];
    }

    /**
     * Service this requirement belongs to.
     */
    public function layanan(): BelongsTo
    {
        return $this->belongsTo(Layanan::class, 'layanan_id');
    }

    /**
     * Uploaded documents for this requirement.
     */
    public function dokumenUpload(): HasMany
    {
        return $this->hasMany(DokumenUpload::class, 'persyaratan_id');
    }
}
