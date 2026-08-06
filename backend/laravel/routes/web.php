<?php

use App\Http\Controllers\WrestlerImageController;
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

Route::get('storage/wrestlers/{wrestler}', [WrestlerImageController::class, 'show'])->name(
    'wrestlers.image'
);
Route::get('storage/wrestlers/{wrestler}/thumbnail.webp', [WrestlerImageController::class, 'thumbnail'])->name(
    'wrestlers.thumbnail'
);
