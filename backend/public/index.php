<?php

// ==============================================================================
// Elmira Davet - Headless PHP REST API Entrypoint
// ==============================================================================

declare(strict_types=1);

// 1. PSR-4 Benzeri Basit Autoloader
spl_autoload_register(function ($class) {
    $prefix = 'Elmira\\';
    $baseDir = __DIR__ . '/../src/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relativeClass = substr($class, $len);
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

use Elmira\Config\Env;
use Elmira\Controllers\AuthController;
use Elmira\Controllers\BlogController;
use Elmira\Controllers\GalleryController;
use Elmira\Controllers\HeroController;
use Elmira\Controllers\MediaController;
use Elmira\Controllers\PackageController;
use Elmira\Controllers\PageController;
use Elmira\Controllers\ReservationController;
use Elmira\Controllers\SettingController;
use Elmira\Controllers\TestimonialController;
use Elmira\Middleware\CorsMiddleware;
use Elmira\Router;
use Elmira\Utils\Response;

// 2. Ortam Değişkenlerini Yükle (.env)
$envPath = __DIR__ . '/../.env';
if (!file_exists($envPath)) {
    $envPath = __DIR__ . '/../.env.example';
}
Env::load($envPath);

// 3. CORS Yönetimi
CorsMiddleware::handle();

// 4. Router Kurulumu
$router = new Router();

// ─── Health Check & API Bilgisi ─────────────────────────────
$router->get('/', function () {
    Response::success([
        'name' => 'Elmira Davet Headless REST API',
        'version' => '1.0.0',
        'status' => 'online',
        'timestamp' => date('Y-m-d H:i:s'),
    ], 'Elmira Davet API Servisi Aktif');
});

// ─── Kimlik Doğrulama (Auth) ────────────────────────────────
$router->post('/auth/login', [AuthController::class, 'login']);
$router->get('/auth/me', [AuthController::class, 'me']);
$router->post('/auth/logout', [AuthController::class, 'logout']);

// ─── Sayfalar & Blok CMS (Pages & Blocks) ────────────────────
$router->get('/pages', [PageController::class, 'index']);
$router->post('/pages', [PageController::class, 'create']);
$router->get('/pages/by-slug/{slug}', [PageController::class, 'bySlug']);
$router->get('/pages/{id}', [PageController::class, 'show']);
$router->put('/pages/{id}', [PageController::class, 'save']);
$router->delete('/pages/{id}', [PageController::class, 'trash']);
$router->post('/pages/{id}/restore', [PageController::class, 'restore']);
$router->delete('/pages/{id}/force', [PageController::class, 'delete']);
$router->post('/pages/{id}/publish', [PageController::class, 'publish']);
$router->get('/pages/{id}/revisions', [PageController::class, 'revisions']);
$router->post('/pages/{id}/lock', [PageController::class, 'lock']);
$router->delete('/pages/{id}/lock', [PageController::class, 'unlock']);

// ─── Site Ayarları (Settings) ────────────────────────────────
$router->get('/settings', [SettingController::class, 'index']);
$router->put('/settings', [SettingController::class, 'update']);

// ─── Hero Slaytları (Slider) ────────────────────────────────
$router->get('/hero-slides', [HeroController::class, 'index']);
$router->post('/hero-slides', [HeroController::class, 'store']);
$router->put('/hero-slides/{id}', [HeroController::class, 'update']);
$router->delete('/hero-slides/{id}', [HeroController::class, 'delete']);
$router->post('/hero-slides/reorder', [HeroController::class, 'reorder']);

// ─── Paketler (Packages) ─────────────────────────────────────
$router->get('/packages', [PackageController::class, 'index']);
$router->post('/packages', [PackageController::class, 'store']);
$router->put('/packages/{id}', [PackageController::class, 'update']);
$router->delete('/packages/{id}', [PackageController::class, 'delete']);

// ─── Galeri (Gallery) ────────────────────────────────────────
$router->get('/gallery', [GalleryController::class, 'index']);
$router->post('/gallery/images', [GalleryController::class, 'storeImage']);
$router->delete('/gallery/images/{id}', [GalleryController::class, 'deleteImage']);

// ─── Yorumlar (Testimonials) ─────────────────────────────────
$router->get('/testimonials', [TestimonialController::class, 'index']);
$router->post('/testimonials', [TestimonialController::class, 'store']);
$router->put('/testimonials/{id}', [TestimonialController::class, 'update']);
$router->delete('/testimonials/{id}', [TestimonialController::class, 'delete']);

// ─── Blog Yazıları (Blog) ────────────────────────────────────
$router->get('/blog', [BlogController::class, 'index']);
$router->get('/blog/{slug}', [BlogController::class, 'show']);
$router->post('/blog', [BlogController::class, 'store']);
$router->put('/blog/{id}', [BlogController::class, 'update']);
$router->delete('/blog/{id}', [BlogController::class, 'delete']);

// ─── Rezervasyonlar & Teklifler (Reservations) ──────────────
$router->get('/reservations', [ReservationController::class, 'index']);
$router->post('/reservations', [ReservationController::class, 'store']);
$router->put('/reservations/{id}/status', [ReservationController::class, 'updateStatus']);

// ─── Meta Webhook & CRM Talepleri (Leads & CRM) ────────────
$router->get('/webhooks/meta', [\Elmira\Controllers\LeadController::class, 'webhookVerify']);
$router->post('/webhooks/meta', [\Elmira\Controllers\LeadController::class, 'webhookReceive']);
$router->get('/leads', [\Elmira\Controllers\LeadController::class, 'index']);
$router->post('/leads', [\Elmira\Controllers\LeadController::class, 'store']);
$router->put('/leads/{id}/status', [\Elmira\Controllers\LeadController::class, 'updateStatus']);
$router->delete('/leads/{id}', [\Elmira\Controllers\LeadController::class, 'delete']);
$router->get('/calendar', [\Elmira\Controllers\LeadController::class, 'calendar']);

// ─── Medya Yükleme (Media Upload) ───────────────────────────
$router->post('/media/upload', [MediaController::class, 'upload']);

// 5. İsteği Yönlendir
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = $_SERVER['REQUEST_URI'] ?? '/';

$router->dispatch($method, $uri);
