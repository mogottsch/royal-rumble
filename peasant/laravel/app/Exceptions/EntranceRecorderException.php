<?php

namespace App\Exceptions;

use Exception;

class EntranceRecorderException extends Exception
{
    private EntranceRecorderErrorCode $errorCode;

    public function __construct(EntranceRecorderErrorCode $errorCode)
    {
        $this->errorCode = $errorCode;
        $this->message = $this->message();
    }

    public function message(): string
    {
        return match ($this->errorCode) {
            EntranceRecorderErrorCode::WRESTLER_ALREADY_ENTERED
                => "Wrestler already entered.",
            default => "Unknown error.",
        };
    }
}

enum EntranceRecorderErrorCode
{
    case WRESTLER_ALREADY_ENTERED;
}
