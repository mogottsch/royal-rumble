<?php

namespace App\Services;

use App\Models\Wrestler;
use Illuminate\Support\Collection;

class WrestlerSearcher
{
    public function search(string $search): Collection
    {
        $wrestlers = Wrestler::where("name", "like", "%{$search}%")->get();
        return $wrestlers;
    }
}
