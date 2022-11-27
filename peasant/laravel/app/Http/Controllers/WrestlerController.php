<?php

namespace App\Http\Controllers;

use App\Services\WrestlerSearcher;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WrestlerController extends Controller
{
    public function search(Request $request, WrestlerSearcher $wrestlerSearcher)
    {
        $search = $request->search;
        if (!$search) {
            return response()->json(
                ["message" => "'search' parameter is required"],
                Response::HTTP_BAD_REQUEST
            );
        }
        $wrestlers = $wrestlerSearcher->search($search);
        return ["data" => $wrestlers];
    }
}
