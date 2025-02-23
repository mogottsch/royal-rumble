<?php

namespace App\Services;

use App\Models\Wrestler;
use Illuminate\Support\Collection;

class WrestlerSearcher
{
    public function search(string $search): Collection
    {
        $wrestlers = Wrestler::whereFuzzy("name", $search)
            ->orderByFuzzy("name")
            ->limit(10)
            ->get();
        return $wrestlers;
    }
}
