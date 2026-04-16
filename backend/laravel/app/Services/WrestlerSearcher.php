<?php

namespace App\Services;

use App\Models\Wrestler;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class WrestlerSearcher
{
    public function search(string $search): Collection
    {
        $needle = trim($search);
        if ($needle === "") {
            return new Collection();
        }

        $lower = mb_strtolower($needle);
        $like = "%" . str_replace(["%", "_"], ["\\%", "\\_"], $lower) . "%";

        return Wrestler::query()
            ->whereRaw("LOWER(name) LIKE ?", [$like])
            ->orderByRaw(
                "CASE
                    WHEN LOWER(name) = ? THEN 0
                    WHEN LOWER(name) LIKE ? THEN 1
                    WHEN LOWER(name) LIKE ? THEN 2
                    ELSE 3
                END",
                [$lower, $lower . "%", "%" . $lower . "%"]
            )
            ->orderBy("name")
            ->limit(10)
            ->get();
    }
}
