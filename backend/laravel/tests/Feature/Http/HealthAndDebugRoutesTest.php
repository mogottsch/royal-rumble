<?php

namespace Tests\Feature\Http;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class HealthAndDebugRoutesTest extends TestCase
{
    public function test_health_endpoint_is_available(): void
    {
        $this->getJson('/api/health')
            ->assertOk()
            ->assertExactJson(['status' => 'ok']);
    }

    public function test_readiness_endpoint_checks_the_migrated_database(): void
    {
        $this->getJson('/api/readiness')
            ->assertOk()
            ->assertExactJson(['status' => 'ready']);
    }

    public function test_readiness_fails_when_required_schema_is_missing(): void
    {
        Schema::table('royal_rumble_entries', function (Blueprint $table): void {
            $table->dropColumn('entrance_order_verified');
        });

        $this->getJson('/api/readiness')
            ->assertServiceUnavailable()
            ->assertExactJson(['status' => 'not_ready']);
    }

    public function test_debug_endpoints_are_not_registered(): void
    {
        $this->getJson('/api/test')->assertNotFound();
        $this->getJson('/debug/wrestlers')->assertNotFound();
        $this->getJson('/debug/lobbies')->assertNotFound();
        $this->getJson('/debug/phpinfo')->assertNotFound();
    }
}
