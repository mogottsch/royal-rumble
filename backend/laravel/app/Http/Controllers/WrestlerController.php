<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateWrestlerRequest;
use App\Models\Wrestler;
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
        return response()->json(["data" => $wrestlers], Response::HTTP_OK);
    }

    public function create(CreateWrestlerRequest $request)
    {
        $wrestler = new Wrestler();
        $wrestler->name = $request->name;
        $wrestler->save();
        return response()->json(
            ["data" => ["wrestler" => $wrestler]],
            Response::HTTP_CREATED
        );
    }

    public function index()
    {
        $wrestlers = Wrestler::all();
        return response()->json(["data" => $wrestlers], Response::HTTP_OK);
    }
}
