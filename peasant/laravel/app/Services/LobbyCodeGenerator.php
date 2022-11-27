<?php

namespace App\Services;

class LobbyCodeGenerator
{
    const CODE_LENGTH = 5;
    const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    public function generate(): string
    {
        $code = "";
        for ($i = 0; $i < self::CODE_LENGTH; $i++) {
            $code .=
                self::CODE_CHARS[random_int(0, strlen(self::CODE_CHARS) - 1)];
        }
        return $code;
    }
}
