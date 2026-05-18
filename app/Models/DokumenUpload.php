<?php

namespace App\Models;

use App\Traits\HasRls;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['pengajuan_id', 'tipe', 'nama_file', 'path', 'mime_type', 'ukuran', 'uploaded_by'])]
class DokumenUpload extends Model
{
    use HasFactory, HasRls;

    protected $table = 'dokumen_upload';

    /**
     * Define the RLS column for row level security.
     */
    public function getRlsColumn(): string
    {
        return 'uploaded_by';
    }

    public function pengajuan(): BelongsTo
    {
        return $this->belongsTo(Pengajuan::class, 'pengajuan_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
