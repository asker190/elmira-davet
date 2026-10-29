<?php

namespace Elmira\Controllers;

use Elmira\Config\Database;
use Elmira\Middleware\AuthMiddleware;
use Elmira\Router;
use Elmira\Utils\Response;
use PDO;

class ReservationController
{
    public function index(): void
    {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $status = $_GET['status'] ?? 'ALL';
        $where = [];
        $params = [];

        if ($status !== 'ALL') {
            $where[] = 'status = ?';
            $params[] = $status;
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        $stmt = $db->prepare("SELECT * FROM reservations {$whereClause} ORDER BY created_at DESC");
        $stmt->execute($params);
        $reservations = $stmt->fetchAll();

        Response::success($reservations);
    }

    public function store(): void
    {
        $body = Router::getJsonBody();

        $fullName = trim($body['fullName'] ?? $body['full_name'] ?? $body['name'] ?? '');
        $email = trim($body['email'] ?? '');
        $phone = trim($body['phone'] ?? '');
        $eventDate = trim($body['eventDate'] ?? $body['event_date'] ?? date('Y-m-d'));
        $eventType = trim($body['eventType'] ?? $body['event_type'] ?? 'Düğün');

        if (empty($fullName) || empty($phone)) {
            Response::error('Ad soyad ve telefon zorunludur', 422);
        }

        $db = Database::getConnection();
        $id = 'res_' . uniqid();
        $guestCount = !empty($body['guestCount'] ?? $body['guest_count']) ? (int)($body['guestCount'] ?? $body['guest_count']) : null;
        $message = $body['message'] ?? null;
        $kvkkConsent = !empty($body['kvkkConsent'] ?? $body['kvkk_consent']) ? 1 : 0;
        $kvkkDate = $kvkkConsent ? date('Y-m-d H:i:s') : null;

        $stmt = $db->prepare('INSERT INTO reservations (id, full_name, email, phone, event_date, event_type, guest_count, message, status, kvkk_consent, kvkk_consent_date, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, "PENDING", ?, ?, NOW(), NOW())');
        $stmt->execute([$id, $fullName, $email, $phone, $eventDate, $eventType, $guestCount, $message, $kvkkConsent, $kvkkDate]);

        Response::success(['id' => $id], 'Talebiniz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.', 201);
    }

    public function updateStatus(string $id): void
    {
        AuthMiddleware::authenticate();
        $body = Router::getJsonBody();

        $status = $body['status'] ?? '';
        if (!in_array($status, ['PENDING', 'CONFIRMED', 'CANCELLED'], true)) {
            Response::error('Geçersiz rezervasyon durumu', 422);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare('UPDATE reservations SET status = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$status, $id]);

        Response::success(null, 'Rezervasyon durumu güncellendi');
    }
}
