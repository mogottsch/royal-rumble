<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEliminationRequest;
use App\Http\Requests\UpdateEliminationRequest;
use App\Models\Elimination;
use Illuminate\Http\Response;

class EliminationController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return Response
     */
    public function store(StoreEliminationRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @return Response
     */
    public function show(Elimination $elimination)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @return Response
     */
    public function update(UpdateEliminationRequest $request, Elimination $elimination)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @return Response
     */
    public function destroy(Elimination $elimination)
    {
        //
    }
}
