<?php

namespace App\Exceptions;

use Exception;

class DrinkDistributionException extends Exception
{
    public function __construct(
        public DrinkDistributionErrorCode $errorCode,
        ?string $message = null
    ) {
        parent::__construct($message ?? $this->defaultMessage());
    }

    private function defaultMessage(): string
    {
        return match ($this->errorCode) {
            DrinkDistributionErrorCode::WRONG_SCHLUECKE_SUM
                => "Sum of Schlücke does not match the lobby configuration.",
            DrinkDistributionErrorCode::WRONG_SHOTS_SUM
                => "Sum of Shots does not match the lobby configuration.",
            DrinkDistributionErrorCode::GIVER_NOT_IN_LOBBY
                => "The giver is not a participant in this lobby.",
            DrinkDistributionErrorCode::GIVER_DOES_NOT_OWN_OFFENDER
                => "The giver does not own the offender wrestler.",
            DrinkDistributionErrorCode::RECEIVER_NOT_IN_LOBBY
                => "A receiver is not a participant in this lobby.",
            DrinkDistributionErrorCode::OFFENDER_VICTIM_MISMATCH
                => "The offender and victim do not belong to the same elimination.",
            DrinkDistributionErrorCode::ALREADY_DISTRIBUTED
                => "This pool has already been distributed.",
        };
    }
}

enum DrinkDistributionErrorCode
{
    case WRONG_SCHLUECKE_SUM;
    case WRONG_SHOTS_SUM;
    case GIVER_NOT_IN_LOBBY;
    case GIVER_DOES_NOT_OWN_OFFENDER;
    case RECEIVER_NOT_IN_LOBBY;
    case OFFENDER_VICTIM_MISMATCH;
    case ALREADY_DISTRIBUTED;
}
