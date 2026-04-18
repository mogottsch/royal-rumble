<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Wrestler extends Model
{
    use HasFactory;

    protected $appends = ["image_url", "thumbnail_url", "royal_rumble_stats"];

    protected $casts = [
        "cm_id" => "integer",
    ];

    public function royalRumbleEntries()
    {
        return $this->hasMany(RoyalRumbleEntry::class);
    }

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

    protected function royalRumbleStats(): Attribute
    {
        return Attribute::make(get: function () {
            $entries = $this->relationLoaded("royalRumbleEntries")
                ? $this->royalRumbleEntries
                : $this->royalRumbleEntries()->get(["entrance_number"]);

            $appearances = $entries->count();

            if ($appearances === 0) {
                return [
                    "appearances" => 0,
                    "number_one_appearances" => 0,
                    "number_thirty_appearances" => 0,
                ];
            }

            return [
                "appearances" => $appearances,
                "number_one_appearances" => $entries->where("entrance_number", 1)->count(),
                "number_thirty_appearances" => $entries->where("entrance_number", 30)->count(),
            ];
        });
    }
}
