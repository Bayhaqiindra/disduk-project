<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileStorageService
{
    /**
     * Store an uploaded document securely.
     *
     * @param UploadedFile $file
     * @param string $folder
     * @return array{path: string, nama_file: string, mime_type: string, ukuran: int}
     */
    public function store(UploadedFile $file, string $folder = 'documents'): array
    {
        // Generate secure random name to prevent path traversal or guessing
        $extension = $file->getClientOriginalExtension();
        $randomName = Str::uuid() . '.' . $extension;
        
        // Save to 'local' disk (defaults to private storage/app directory, NOT public)
        $path = $file->storeAs($folder, $randomName, 'local');

        return [
            'path' => $path,
            'nama_file' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'ukuran' => $file->getSize(),
        ];
    }

    /**
     * Get secure file contents.
     */
    public function get(string $path): ?string
    {
        if (Storage::disk('local')->exists($path)) {
            return Storage::disk('local')->get($path);
        }
        return null;
    }

    /**
     * Delete a file securely.
     */
    public function delete(string $path): bool
    {
        if (Storage::disk('local')->exists($path)) {
            return Storage::disk('local')->delete($path);
        }
        return false;
    }
}
