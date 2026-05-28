<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'parent_id',
    'kode',
    'kode_formulir',
    'nama',
    'kategori',
    'deskripsi',
    'icon',
    'urutan',
    'is_active'
])]
class Layanan extends Model
{
    use HasFactory;

    protected $table = 'layanan';

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'urutan' => 'integer',
        ];
    }

    /**
     * Parent category if this is a sub-service.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Layanan::class, 'parent_id');
    }

    /**
     * Sub-services under this category.
     */
    public function subLayanan(): HasMany
    {
        return $this->hasMany(Layanan::class, 'parent_id')->orderBy('urutan');
    }

    /**
     * Requirements for this service.
     */
    public function persyaratan(): HasMany
    {
        return $this->hasMany(Persyaratan::class, 'layanan_id')->orderBy('urutan');
    }

    /**
     * Submissions under this service.
     */
    public function pengajuan(): HasMany
    {
        return $this->hasMany(Pengajuan::class, 'layanan_id');
    }
}
