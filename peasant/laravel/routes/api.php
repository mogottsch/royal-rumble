<?php

use App\Http\Controllers\LobbyController;
use App\Http\Controllers\WrestlerController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::middleware('auth:sanctum')->group(function () {
Route::post("/lobbies", [LobbyController::class, "store"])->name(
    "lobbies.store"
);
Route::get("/wrestlers/search", [WrestlerController::class, "search"])->name(
    "wrestlers.search"
);

Route::put("/lobbies/{lobby}/entrance-numbers", [
    LobbyController::class,
    "assignEntranceNumbers",
])->name("lobbies.assignEntranceNumbers");
// });
