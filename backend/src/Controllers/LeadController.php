<?php

namespace Elmira\Controllers;

use Elmira\Config\Database;
use Elmira\Config\Env;
use Elmira\Middleware\AuthMiddleware;
use Elmira\Router;
use Elmira\Utils\Response;
use PDO;

class LeadController
{
    /**
     * Meta Lead Ads Webhook Doğrulama (GET /webhooks/meta)
     */
    public function webhookVerify(): void
    {
        $mode = $_GET['hub_mode'] ?? $_GET['hub.mode'] ?? null;
        $token = $_GET['hub_verify_token'] ?? $_GET['hub.verify_token'] ?? null;
        $challenge = $_GET['hub_challenge'] ?? $_GET['hub.challenge'] ?? null;

        $expectedToken = Env::get('META_VERIFY_TOKEN', 'elmira_davet_meta_secret_token_2026');

        if ($mode === 'subscribe' && $token === $expectedToken) {
            header('Content-Type: text/plain');
            echo $challenge;
            exit;
        }

        http_response_code(403);
        echo 'Forbidden - Verification token mismatch';
        exit;
    }

    /**
     * Meta Lead Ads Gelen Bildirim (POST /webhooks/meta)
     */
    public function webhookReceive(): void
    {
        $rawBody = file_get_contents('php://input');
        $signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

        $appSecret = Env::get('META_APP_SECRET', '');

        // HMAC-SHA256 İmza Doğrulaması (App Secret tanımlıysa)
        if (!empty($appSecret) && !empty($signature)) {
            $expectedSig = 'sha256=' . hash_hmac('sha256', $rawBody, $appSecret);
            if (!hash_equals($expectedSig, $signature)) {
                $this->logSync('WEBHOOK_EVENT', 'FAILED', 'Geçersiz Meta X-Hub-Signature-256 imzası', $signature);
                Response::error('Invalid signature', 401);
                return;
            }
        }

        $payload = json_decode($rawBody, true);
        if (!$payload) {
            Response::error('Invalid JSON payload', 400);
            return;
        }

        $db = Database::getConnection();

        // Lead Ads kayıtlarını döngüye al
        if (($payload['object'] ?? '') === 'page' && !empty($payload['entry'])) {
            foreach ($payload['entry'] as $entry) {
                $changes = $entry['changes'] ?? [];
                foreach ($changes as $change) {
                    if (($change['field'] ?? '') === 'leadgen') {
                        $val = $change['value'] ?? [];
                        $leadgenId = (string)($val['leadgen_id'] ?? '');
                        $formId = (string)($val['form_id'] ?? '');
                        $adId = isset($val['ad_id']) ? (string)$val['ad_id'] : null;
                        $campaignId = isset($val['campaign_id']) ? (string)$val['campaign_id'] : null;

                        if (!empty($leadgenId)) {
                            $this->processMetaLead($db, $leadgenId, $formId, $adId, $campaignId, $val);
                        }
                    }
                }
            }
        }

        Response::success(['received' => true], 'Webhook başarıyla işlendi');
    }

    /**
     * Meta Graph API üzerinden lead verisini çekip MySQL leads tablosuna kaydeder
     */
    private function processMetaLead(PDO $db, string $leadgenId, string $formId, ?string $adId, ?string $campaignId, array $rawVal): void
    {
        $accessToken = Env::get('META_PAGE_ACCESS_TOKEN', '');
        $leadData = null;

        if (!empty($accessToken)) {
            $url = "https://graph.facebook.com/v19.0/{$leadgenId}?access_token={$accessToken}";
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $res = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && $res) {
                $leadData = json_decode($res, true);
            }
        }

        // Alanları normalize et
        $fullName = 'Meta Müşterisi';
        $phone = '-';
        $email = null;
        $eventDate = null;
        $eventType = 'Düğün Organizasyonu';
        $hallPreference = 'Kristal Salon (600 Kişilik)';
        $guestCount = 350;
        $timeSlot = 'NIGHT';

        if ($leadData && !empty($leadData['field_data'])) {
            foreach ($leadData['field_data'] as $field) {
                $name = strtolower($field['name'] ?? '');
                $val = is_array($field['values']) ? implode(', ', $field['values']) : ($field['values'] ?? '');

                if (str_contains($name, 'full_name') || str_contains($name, 'ad_soyad') || $name === 'name') {
                    $fullName = $val;
                } elseif (str_contains($name, 'phone') || str_contains($name, 'telefon') || str_contains($name, 'gsm')) {
                    $phone = $val;
                } elseif (str_contains($name, 'email') || str_contains($name, 'eposta')) {
                    $email = $val;
                } elseif (str_contains($name, 'tarih') || str_contains($name, 'date')) {
                    $parsedTime = strtotime($val);
                    if ($parsedTime) $eventDate = date('Y-m-d', $parsedTime);
                } elseif (str_contains($name, 'saat') || str_contains($name, 'seans') || str_contains($name, 'gunduz')) {
                    if (str_contains(strtolower($val), 'gunduz') || str_contains(strtolower($val), '13:00')) {
                        $timeSlot = 'DAY';
                    }
                } elseif (str_contains($name, 'salon') || str_contains($name, 'kir')) {
                    if (str_contains(strtolower($val), 'kir') || str_contains(strtolower($val), 'bahce')) {
                        $hallPreference = 'Kır Bahçesi (300 Kişilik)';
                    }
                }
            }
        }

        $id = 'meta_' . $leadgenId;
        $stmt = $db->prepare('INSERT INTO leads 
            (id, full_name, phone, email, event_date, time_slot, event_type, hall_preference, guest_count, source, status, leadgen_id, form_id, ad_id, campaign_id, raw_field_data, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "Meta / Instagram Ads", "PENDING", ?, ?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), phone = VALUES(phone), updated_at = NOW()');

        $stmt->execute([
            $id,
            $fullName,
            $phone,
            $email,
            $eventDate,
            $timeSlot,
            $eventType,
            $hallPreference,
            $guestCount,
            $leadgenId,
            $formId,
            $adId,
            $campaignId,
            json_encode($leadData ?: $rawVal, JSON_UNESCAPED_UNICODE)
        ]);

        $this->logSync('LEAD_INGEST', 'SUCCESS', "Yeni Meta Talebi Kaydedildi: {$fullName} ({$phone})", json_encode($leadData ?: $rawVal));
    }

    /**
     * Tüm Talepleri Listele (GET /leads)
     */
    public function index(): void
    {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $status = $_GET['status'] ?? 'ALL';
        $source = $_GET['source'] ?? 'ALL';
        $search = trim($_GET['search'] ?? '');

        $where = [];
        $params = [];

        if ($status !== 'ALL') {
            $where[] = 'status = ?';
            $params[] = $status;
        }

        if ($source !== 'ALL') {
            $where[] = 'source = ?';
            $params[] = $source;
        }

        if (!empty($search)) {
            $where[] = '(full_name LIKE ? OR phone LIKE ? OR email LIKE ? OR event_type LIKE ?)';
            $like = '%' . $search . '%';
            $params = array_merge($params, [$like, $like, $like, $like]);
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        $stmt = $db->prepare("SELECT * FROM leads {$whereClause} ORDER BY created_at DESC");
        $stmt->execute($params);
        $leads = $stmt->fetchAll();

        Response::success($leads);
    }

    /**
     * Manuel Talep Ekle (POST /leads)
     */
    public function store(): void
    {
        AuthMiddleware::authenticate();
        $body = Router::getJsonBody();

        $fullName = trim($body['fullName'] ?? $body['full_name'] ?? '');
        $phone = trim($body['phone'] ?? '');

        if (empty($fullName) || empty($phone)) {
            Response::error('Ad Soyad ve Telefon zorunludur', 422);
            return;
        }

        $db = Database::getConnection();
        $id = 'lead_' . uniqid();
        $email = $body['email'] ?? null;
        $eventDate = !empty($body['eventDate'] ?? $body['event_date']) ? date('Y-m-d', strtotime($body['eventDate'] ?? $body['event_date'])) : null;
        $timeSlot = in_array($body['timeSlot'] ?? '', ['DAY', 'NIGHT', 'FULL'], true) ? $body['timeSlot'] : 'NIGHT';
        $eventType = $body['eventType'] ?? 'Düğün Organizasyonu';
        $hallPreference = $body['hallPreference'] ?? 'Kristal Salon (600 Kişilik)';
        $guestCount = !empty($body['guestCount']) ? (int)$body['guestCount'] : 350;
        $budget = !empty($body['budget']) ? (float)$body['budget'] : null;
        $source = $body['source'] ?? 'Website';
        $notes = $body['notes'] ?? null;

        $stmt = $db->prepare('INSERT INTO leads 
            (id, full_name, phone, email, event_date, time_slot, event_type, hall_preference, guest_count, budget, source, status, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "PENDING", ?, NOW(), NOW())');

        $stmt->execute([$id, $fullName, $phone, $email, $eventDate, $timeSlot, $eventType, $hallPreference, $guestCount, $budget, $source, $notes]);

        Response::success(['id' => $id], 'Talep başarıyla oluşturuldu', 201);
    }

    /**
     * Talep Durumunu Güncelle ve Kapora Alındığında Takvime Kilitle (PUT /leads/{id}/status)
     */
    public function updateStatus(string $id): void
    {
        AuthMiddleware::authenticate();
        $body = Router::getJsonBody();

        $status = $body['status'] ?? '';
        $validStatuses = ['PENDING', 'CONTACTED', 'OFFER_SENT', 'CONFIRMED', 'CANCELLED'];

        if (!in_array($status, $validStatuses, true)) {
            Response::error('Geçersiz durum', 422);
            return;
        }

        $db = Database::getConnection();
        $notes = $body['notes'] ?? null;
        $bookingDetails = $body['bookingDetails'] ?? $body['booking_details'] ?? null;
        $depositAmount = isset($bookingDetails['depositAmount']) ? (float)$bookingDetails['depositAmount'] : null;

        // Talep var mı kontrol et
        $stmt = $db->prepare('SELECT * FROM leads WHERE id = ?');
        $stmt->execute([$id]);
        $lead = $stmt->fetch();

        if (!$lead) {
            Response::error('Talep bulunamadı', 404);
            return;
        }

        // Güncelleme sorgusu
        $eventDate = $bookingDetails['eventDate'] ?? $lead['event_date'];
        $hall = $bookingDetails['hallPreference'] ?? $lead['hall_preference'];
        $timeSlot = $bookingDetails['timeSlot'] ?? $lead['time_slot'];

        $updateStmt = $db->prepare('UPDATE leads SET 
            status = ?, 
            event_date = ?, 
            hall_preference = ?, 
            time_slot = ?, 
            deposit_amount = COALESCE(?, deposit_amount),
            notes = COALESCE(?, notes),
            updated_at = NOW() 
            WHERE id = ?');
        $updateStmt->execute([$status, $eventDate, $hall, $timeSlot, $depositAmount, $notes, $id]);

        // Kapora alındı (CONFIRMED) ise takvime otomatik kilitle
        if ($status === 'CONFIRMED' && !empty($eventDate)) {
            $normHall = str_contains(strtolower($hall), 'kır') || str_contains(strtolower($hall), 'kir') ? 'Kır Bahçesi' : 'Kristal Salon';
            $calId = 'cal_' . $id;

            // Önceki kaydı temizle
            $delCal = $db->prepare('DELETE FROM calendar_events WHERE lead_id = ?');
            $delCal->execute([$id]);

            // Yeni kilitli seans oluştur
            $insCal = $db->prepare('INSERT INTO calendar_events (id, event_date, hall, slot, status, note, lead_id, client_name, guest_count, created_at, updated_at)
                VALUES (?, ?, ?, ?, "BLOCKED", ?, ?, ?, ?, NOW(), NOW())');
            $note = "Kapora Alındı: {$lead['full_name']} (" . ($timeSlot === 'DAY' ? 'Gündüz 13:00-17:00' : 'Akşam 19:00-23:00') . ')';
            $insCal->execute([$calId, $eventDate, $normHall, $timeSlot, $note, $id, $lead['full_name'], $lead['guest_count']]);
        } elseif ($status === 'CANCELLED') {
            // İptal edilirse takvimdeki kilidi serbest bırak
            $delCal = $db->prepare('DELETE FROM calendar_events WHERE lead_id = ?');
            $delCal->execute([$id]);
        }

        Response::success(null, 'Talep durumu ve takvim başarıyla güncellendi');
    }

    /**
     * Talep Sil (DELETE /leads/{id})
     */
    public function delete(string $id): void
    {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $delCal = $db->prepare('DELETE FROM calendar_events WHERE lead_id = ?');
        $delCal->execute([$id]);

        $stmt = $db->prepare('DELETE FROM leads WHERE id = ?');
        $stmt->execute([$id]);

        Response::success(null, 'Talep silindi');
    }

    /**
     * Takvim Olaylarını Getir (GET /calendar)
     */
    public function calendar(): void
    {
        $db = Database::getConnection();
        $stmt = $db->query('SELECT * FROM calendar_events ORDER BY event_date ASC');
        $events = $stmt->fetchAll();

        Response::success($events);
    }

    private function logSync(string $type, string $status, string $message, ?string $details = null): void
    {
        try {
            $db = Database::getConnection();
            $stmt = $db->prepare('INSERT INTO meta_sync_logs (id, type, status, message, details, created_at) VALUES (?, ?, ?, ?, ?, NOW())');
            $stmt->execute(['log_' . uniqid(), $type, $status, $message, $details]);
        } catch (\Throwable $e) {}
    }
}
