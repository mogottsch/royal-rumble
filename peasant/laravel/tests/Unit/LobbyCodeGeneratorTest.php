<?php

use App\Services\LobbyCodeGenerator;

$lobbyCodeGenerator = new LobbyCodeGenerator();

beforeEach(fn() => ($this->lobbyCodeGenerator = new LobbyCodeGenerator()));

it("should generate a string", function () use ($lobbyCodeGenerator) {
    $lobbyCode = $lobbyCodeGenerator->generate();

    $this->assertIsString($lobbyCode);
});

it("should generate a string of specific length", function () use (
    $lobbyCodeGenerator
) {
    $lobbyCode = $lobbyCodeGenerator->generate();

    $this->assertEquals(LobbyCodeGenerator::CODE_LENGTH, strlen($lobbyCode));
});

it("should generate a string with specific chars", function () use (
    $lobbyCodeGenerator
) {
    $lobbyCode = $lobbyCodeGenerator->generate();

    foreach (str_split($lobbyCode) as $char) {
        $this->assertContains($char, str_split(LobbyCodeGenerator::CODE_CHARS));
    }
});
