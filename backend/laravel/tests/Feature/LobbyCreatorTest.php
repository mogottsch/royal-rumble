<?php

namespace Tests\Feature;

use App\Services\LobbyCreator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use InvalidArgumentException;
use Tests\TestCase;

class LobbyCreatorTest extends TestCase
{
    private LobbyCreator $lobbyCreator;

    public function setUp(): void
    {
        parent::setUp();
        $this->lobbyCreator = $this->app->make(LobbyCreator::class);
    }

    public function test_creates_lobby_with_names()
    {
        $names = collect(["John", "Jane", "Jack"]);
        $lobby = $this->lobbyCreator->createWithParticipants($names);

        $this->assertEquals($names, $lobby->participants->pluck("name"));
    }

    public function test_throws_exception_if_name_is_empty()
    {
        $this->expectException(InvalidArgumentException::class);
        $this->lobbyCreator->createWithParticipants(
            collect(["John", "", "Jack"])
        );
    }

    public function test_throws_exception_if_no_names()
    {
        $this->expectException(InvalidArgumentException::class);
        $this->lobbyCreator->createWithParticipants(collect());
    }

    public function test_throws_exception_if_names_are_not_unique()
    {
        $this->expectException(InvalidArgumentException::class);
        $this->lobbyCreator->createWithParticipants(
            collect(["John", "John", "Jack"])
        );
    }
}
