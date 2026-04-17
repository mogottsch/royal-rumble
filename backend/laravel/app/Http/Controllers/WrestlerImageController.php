<?php

namespace App\Http\Controllers;

use App\Models\Wrestler;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class WrestlerImageController extends Controller
{
    public function show(Wrestler $wrestler): BinaryFileResponse
    {
        abort_if($wrestler->image_filename === null, 404);

        $path = Storage::disk("public")->path(
            "wrestlers/" . $wrestler->image_filename
        );

        abort_unless(file_exists($path), 404);

        return response()->file($path, [
            "Cache-Control" => "public, max-age=31536000, immutable",
        ]);
    }
}
