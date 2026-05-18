<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['kode', 'nama', 'deskripsi', 'persyaratan', 'icon', 'is_active'])]
class Layanan extends Model
{
    use HasFactory;

    protected $table = 'layanan';

    protected function casts(): array
    {
        return [
            'persyaratan' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function pengajuan(): HasMany
    {
        return $this->hasMany(Pengajuan::class, 'layanan_id');
    }
}
