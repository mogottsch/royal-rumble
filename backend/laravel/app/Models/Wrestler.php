<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Wrestler extends Model
{
    use HasFactory;

    protected $appends = ["image_url", "thumbnail_url"];

    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->image_filename === null
                ? null
                : route("wrestlers.image", ["wrestler" => $this->id])
        );
    }

    protected function thumbnailUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->image_filename === null
                ? null
                : route("wrestlers.thumbnail", ["wrestler" => $this->id])
        );
    }
}
