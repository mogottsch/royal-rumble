<?php

// @formatter:off
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * App\Models\Action
 *
 * @property-read \App\Models\Lobby|null $lobby
 * @property-read \App\Models\Rumbler|null $rumbler
 * @method static \Illuminate\Database\Eloquent\Builder|Action newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Action newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Action query()
 */
	class Action extends \Eloquent {}
}

namespace App\Models{
/**
 * App\Models\Lobby
 *
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Action[] $actions
 * @property-read int|null $actions_count
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Participant[] $participants
 * @property-read int|null $participants_count
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\Rumbler[] $rumblers
 * @property-read int|null $rumblers_count
 * @method static \Database\Factories\LobbyFactory factory(...$parameters)
 * @method static \Illuminate\Database\Eloquent\Builder|Lobby newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Lobby newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Lobby query()
 */
	class Lobby extends \Eloquent {}
}

namespace App\Models{
/**
 * App\Models\Participant
 *
 * @property-read \App\Models\Lobby|null $lobby
 * @method static \Database\Factories\ParticipantFactory factory(...$parameters)
 * @method static \Illuminate\Database\Eloquent\Builder|Participant newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Participant newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Participant query()
 */
	class Participant extends \Eloquent {}
}

namespace App\Models{
/**
 * App\Models\Rumbler
 *
 * @property-read \App\Models\Lobby|null $lobby
 * @property-read \App\Models\Wrestler|null $wrestler
 * @method static \Database\Factories\RumblerFactory factory(...$parameters)
 * @method static \Illuminate\Database\Eloquent\Builder|Rumbler newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Rumbler newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Rumbler query()
 */
	class Rumbler extends \Eloquent {}
}

namespace App\Models{
/**
 * App\Models\User
 *
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection|\Illuminate\Notifications\DatabaseNotification[] $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection|\Laravel\Sanctum\PersonalAccessToken[] $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory(...$parameters)
 * @method static \Illuminate\Database\Eloquent\Builder|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User query()
 */
	class User extends \Eloquent {}
}

namespace App\Models{
/**
 * App\Models\Wrestler
 *
 * @method static \Database\Factories\WrestlerFactory factory(...$parameters)
 * @method static \Illuminate\Database\Eloquent\Builder|Wrestler newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Wrestler newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Wrestler query()
 */
	class Wrestler extends \Eloquent {}
}

