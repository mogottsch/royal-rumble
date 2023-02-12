<?php

use App\Models\Lobby;
use App\Models\Wrestler;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::get("/", function () {
//     return view("welcome");
// });

Route::get("debug/wrestlers", function () {
    $wrestlers = Wrestler::orderBy("created_at", "desc")->get();

    return $wrestlers;
});

Route::get("debug/lobbies", function () {
    $lobbies = Lobby::orderBy("created_at", "desc")->get();

    return $lobbies;
});

Route::get("debug/phpinfo", function () {
    return phpinfo();
});
