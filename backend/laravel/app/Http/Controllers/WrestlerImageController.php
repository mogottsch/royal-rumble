<?php

namespace App\Http\Controllers;

use App\Models\Wrestler;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class WrestlerImageController extends Controller
{
    private const THUMBNAIL_SIZE = 160;
    private const THUMBNAIL_QUALITY = 82;

    public function show(Wrestler $wrestler): BinaryFileResponse
    {
        abort_if($wrestler->image_filename === null, 404);

        $path = $this->imagePath($wrestler->image_filename);

        abort_unless(file_exists($path), 404);
        abort_unless($this->isImageFile($path), 404);

        return response()->file($path, [
            "Cache-Control" => "public, max-age=31536000, immutable",
        ]);
    }

    public function thumbnail(Wrestler $wrestler): BinaryFileResponse
    {
        abort_if($wrestler->image_filename === null, 404);

        $sourcePath = $this->imagePath($wrestler->image_filename);
        abort_unless(file_exists($sourcePath), 404);
        abort_unless($this->isImageFile($sourcePath), 404);

        $thumbnailPath = $this->thumbnailPath($wrestler->id, $wrestler->updated_at?->timestamp ?? 0);
        if (!file_exists($thumbnailPath)) {
            $this->createThumbnail($sourcePath, $thumbnailPath);
        }

        return response()->file($thumbnailPath, [
            "Cache-Control" => "public, max-age=31536000, immutable",
        ]);
    }

    private function imagePath(string $imageFilename): string
    {
        $storagePath = Storage::disk("public")->path("wrestlers/" . $imageFilename);
        if (file_exists($storagePath)) {
            return $storagePath;
        }

        return base_path("seed-data/wrestlers/" . $imageFilename);
    }

    private function thumbnailPath(int $wrestlerId, int $version): string
    {
        return storage_path("app/public/wrestler-thumbs/{$wrestlerId}-{$version}.webp");
    }

    private function createThumbnail(string $sourcePath, string $thumbnailPath): void
    {
        $contents = file_get_contents($sourcePath);
        if ($contents === false) {
            throw new RuntimeException("Failed to read wrestler image");
        }

        $image = @imagecreatefromstring($contents);
        if ($image === false) {
            throw new RuntimeException("Failed to read wrestler image");
        }

        $sourceWidth = imagesx($image);
        $sourceHeight = imagesy($image);
        $size = min($sourceWidth, $sourceHeight);
        $sourceX = (int) floor(($sourceWidth - $size) / 2);
        $sourceY = (int) floor(($sourceHeight - $size) / 2);

        $thumbnail = imagecreatetruecolor(self::THUMBNAIL_SIZE, self::THUMBNAIL_SIZE);
        if ($thumbnail === false) {
            imagedestroy($image);
            throw new RuntimeException("Failed to allocate thumbnail image");
        }

        imagealphablending($thumbnail, false);
        imagesavealpha($thumbnail, true);
        imagecopyresampled(
            $thumbnail,
            $image,
            0,
            0,
            $sourceX,
            $sourceY,
            self::THUMBNAIL_SIZE,
            self::THUMBNAIL_SIZE,
            $size,
            $size,
        );

        $directory = dirname($thumbnailPath);
        if (!is_dir($directory)) {
            mkdir($directory, 0775, true);
        }

        $saved = imagewebp($thumbnail, $thumbnailPath, self::THUMBNAIL_QUALITY);

        imagedestroy($thumbnail);
        imagedestroy($image);

        if ($saved === false) {
            throw new RuntimeException("Failed to write wrestler thumbnail");
        }
    }

    private function isImageFile(string $path): bool
    {
        return @getimagesize($path) !== false;
    }
}
