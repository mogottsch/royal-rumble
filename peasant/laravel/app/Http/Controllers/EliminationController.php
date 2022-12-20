<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEliminationRequest;
use App\Http\Requests\UpdateEliminationRequest;
use App\Models\Elimination;

class EliminationController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \App\Http\Requests\StoreEliminationRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function store(StoreEliminationRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Elimination  $elimination
     * @return \Illuminate\Http\Response
     */
    public function show(Elimination $elimination)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \App\Http\Requests\UpdateEliminationRequest  $request
     * @param  \App\Models\Elimination  $elimination
     * @return \Illuminate\Http\Response
     */
    public function update(UpdateEliminationRequest $request, Elimination $elimination)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Elimination  $elimination
     * @return \Illuminate\Http\Response
     */
    public function destroy(Elimination $elimination)
    {
        //
    }
}
