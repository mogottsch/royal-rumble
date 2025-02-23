<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Wrestler extends Model
{
    use HasFactory;

    protected $appends = ["image_url"];

    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->image_filename === null
                ? null
                : Storage::disk("public")->url(
                    "wrestlers/" . rawurlencode($this->image_filename)
                )
        );
    }
}
