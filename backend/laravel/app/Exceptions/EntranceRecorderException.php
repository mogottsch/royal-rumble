<?php

namespace App\Exceptions;

use Exception;

class EntranceRecorderException extends Exception
{
    private EntranceRecorderErrorCode $errorCode;

    public function __construct(EntranceRecorderErrorCode $errorCode, ?\Throwable $previous = null)
    {
        $this->errorCode = $errorCode;
        parent::__construct($this->message(), previous: $previous);
    }

    public function message(): string
    {
        return match ($this->errorCode) {
            EntranceRecorderErrorCode::WRESTLER_ALREADY_ENTERED => 'Wrestler already entered.',
            EntranceRecorderErrorCode::RUMBLE_ALREADY_FULL => 'The rumble is already full.',
            EntranceRecorderErrorCode::ENTRANCE_CONFLICT => 'Another entrance was recorded at the same time. Please retry.',
        };
    }
}

enum EntranceRecorderErrorCode
{
    case WRESTLER_ALREADY_ENTERED;
    case RUMBLE_ALREADY_FULL;
    case ENTRANCE_CONFLICT;
}
