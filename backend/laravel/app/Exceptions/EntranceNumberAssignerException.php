<?php

namespace App\Exceptions;

use Exception;

class EntranceNumberAssignerException extends Exception
{
    private EntranceNumberAssignerErrorCode $errorCode;

    public function __construct(EntranceNumberAssignerErrorCode $errorCode)
    {
        $this->errorCode = $errorCode;
        $this->message = $this->message();
    }

    public function message(): string
    {
        return match ($this->errorCode) {
            EntranceNumberAssignerErrorCode::NOT_ALL_PARTICIPANTS_HAVE_AN_ENTRANCE_NUMBER
                => "Not all participants have an entrance number.",
            EntranceNumberAssignerErrorCode::ENTRANCE_NUMBERS_ARE_NOT_UNIQUE
                => "Entrance numbers are not unique.",
            EntranceNumberAssignerErrorCode::ENTRANCE_NUMBERS_ARE_NOT_POSITIVE
                => "Entrance numbers have to be positive.",
            EntranceNumberAssignerErrorCode::ENTRANCE_NUMBERS_ARE_NOT_SEQUENTIAL
                => "Entrance numbers have to go from 1 to the number of participants.",
            EntranceNumberAssignerErrorCode::UNEXPECTED_NUMBER_OF_PARTICIPANTS
                => "The number of participants in the lobby is not equal to the number of entrance numbers given.",
            EntranceNumberAssignerErrorCode::ENTRANCE_NUMBERS_DO_NOT_START_WITH_ONE
                => "Entrance numbers have to start with 1.",
            default => "Unknown error.",
        };
    }
}

enum EntranceNumberAssignerErrorCode
{
    case NOT_ALL_PARTICIPANTS_HAVE_AN_ENTRANCE_NUMBER;
    case ENTRANCE_NUMBERS_ARE_NOT_UNIQUE;
    case ENTRANCE_NUMBERS_ARE_NOT_POSITIVE;
    case ENTRANCE_NUMBERS_ARE_NOT_SEQUENTIAL;
    case UNEXPECTED_NUMBER_OF_PARTICIPANTS;
    case ENTRANCE_NUMBERS_DO_NOT_START_WITH_ONE;
}
