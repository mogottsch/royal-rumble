<?php

namespace App\Exceptions;

use Exception;

class EliminationRecorderException extends Exception
{
    private EliminationRecorderErrorCode $errorCode;

    public function __construct(
        EliminationRecorderErrorCode $errorCode,
        $message = null
    ) {
        $this->errorCode = $errorCode;
        $this->message = $message ?? $this->message();
    }

    public function message(): string
    {
        return match ($this->errorCode) {
            EliminationRecorderErrorCode::OFFENDERS_NOT_RUMBLERS
                => "Some of the items in the list of offenders are not rumblers.",
            EliminationRecorderErrorCode::VICTIMS_NOT_RUMBLERS
                => "Some of the items in the list of victims are not rumblers.",
            default => "Unknown error.",
        };
    }
}

enum EliminationRecorderErrorCode
{
    case OFFENDERS_NOT_RUMBLERS;
    case VICTIMS_NOT_RUMBLERS;
    case RUMBLER_ALREADY_ELIMINATED;
    case RUMBLER_NOT_IN_LOBBY;
}
