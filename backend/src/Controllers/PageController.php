<?php

namespace Elmira\Controllers;

use Elmira\Config\Database;
use Elmira\Middleware\AuthMiddleware;
use Elmira\Router;
use Elmira\Utils\Response;
use PDO;

class PageController
{
    public function index(): void
    {
        $status = $_GET['status'] ?? 'ALL';
        $search = trim($_GET['search'] ?? '');

        $db = Database::getConnection();

        // 1. İstatistikleri hesapla
        $countsQuery = "SELECT 
            COUNT(*) as `all`,
            SUM(CASE WHEN status = 'PUBLISHED' THEN 1 ELSE 0 END) as `published`,
            SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as `draft`,
            SUM(CASE WHEN status = 'SCHEDULED' THEN 1 ELSE 0 END) as `scheduled`,
            SUM(CASE WHEN status = 'PENDING_REVIEW' THEN 1 ELSE 0 END) as `pendingReview`,
            SUM(CASE WHEN status = 'TRASH' THEN 1 ELSE 0 END) as `trash`
        FROM pages";
        $countsStmt = $db->query($countsQuery);
        $rawCounts = $countsStmt->fetch();

        $counts = [
            'all' => (int)($rawCounts['all'] ?? 0),
            'published' => (int)($rawCounts['published'] ?? 0),
            'draft' => (int)($rawCounts['draft'] ?? 0),
            'scheduled' => (int)($rawCounts['scheduled'] ?? 0),
            'pendingReview' => (int)($rawCounts['pendingReview'] ?? 0),
            'trash' => (int)($rawCounts['trash'] ?? 0),
        ];

        // 2. Sayfaları getir
        $where = [];
        $params = [];

        if ($status === 'TRASH') {
            $where[] = "status = 'TRASH'";
        } elseif ($status !== 'ALL') {
            $where[] = "status = ?";
            $params[] = $status;
        } else {
            $where[] = "status != 'TRASH'";
        }

        if (!empty($search)) {
            $where[] = "(title LIKE ? OR slug LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        $sql = "SELECT id, title, slug, status, parent_id, template, menu_order, is_system, system_key, 
                       schema_version, version, seo, author_id, published_at, scheduled_at, trashed_at, 
                       created_at, updated_at 
                FROM pages {$whereClause} 
                ORDER BY menu_order ASC, created_at DESC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();

        $pages = array_map(function ($row) {
            $row['is_system'] = (bool)$row['is_system'];
            $row['seo'] = !empty($row['seo']) ? json_decode($row['seo'], true) : null;
            return $row;
        }, $rows);

        Response::success([
            'pages' => $pages,
            'counts' => $counts
        ]);
    }

    public function show(string $id): void
    {
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM pages WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $page = $stmt->fetch();

        if (!$page) {
            Response::error('Sayfa bulunamadı', 404);
        }

        $page['is_system'] = (bool)$page['is_system'];
        $page['content'] = !empty($page['content']) ? json_decode($page['content'], true) : [];
        $page['seo'] = !empty($page['seo']) ? json_decode($page['seo'], true) : null;

        Response::success($page);
    }

    public function bySlug(string $slug): void
    {
        // Anasayfa slug'ı boş string ('') veya 'anasayfa' olabilir
        $normalizedSlug = ($slug === 'anasayfa' || $slug === 'home') ? '' : $slug;

        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM pages WHERE slug = ? AND status = "PUBLISHED" LIMIT 1');
        $stmt->execute([$normalizedSlug]);
        $page = $stmt->fetch();

        if (!$page) {
            Response::error('Sayfa bulunamadı', 404);
        }

        $page['is_system'] = (bool)$page['is_system'];
        $page['content'] = !empty($page['content']) ? json_decode($page['content'], true) : [];
        $page['seo'] = !empty($page['seo']) ? json_decode($page['seo'], true) : null;

        Response::success($page);
    }

    public function save(string $id): void
    {
        $user = AuthMiddleware::authenticate();
        $body = Router::getJsonBody();

        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM pages WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $page = $stmt->fetch();

        if (!$page) {
            Response::error('Sayfa bulunamadı', 404);
        }

        $title = $body['title'] ?? $page['title'];
        $content = isset($body['content']) ? json_encode($body['content'], JSON_UNESCAPED_UNICODE) : $page['content'];
        $seo = isset($body['seo']) ? json_encode($body['seo'], JSON_UNESCAPED_UNICODE) : $page['seo'];
        $status = $body['status'] ?? $page['status'];
        $template = $body['template'] ?? $page['template'];
        $newVersion = (int)$page['version'] + 1;

        $updateStmt = $db->prepare('UPDATE pages SET 
            title = ?, 
            content = ?, 
            seo = ?, 
            status = ?, 
            template = ?, 
            version = ?, 
            updated_at = NOW() 
            WHERE id = ?');
        
        $updateStmt->execute([
            $title,
            $content,
            $seo,
            $status,
            $template,
            $newVersion,
            $id
        ]);

        // Revizyon kaydı oluştur (Opsiyonel / Snapshot)
        if (isset($body['content'])) {
            $revId = 'rev_' . uniqid();
            $revStmt = $db->prepare('INSERT INTO page_revisions (id, page_id, title, content, author_id, type, created_at) VALUES (?, ?, ?, ?, ?, "MANUAL", NOW())');
            $revStmt->execute([$revId, $id, $title, $content, $user['id']]);
        }

        Response::success([
            'id' => $id,
            'version' => $newVersion,
            'status' => $status
        ], 'Sayfa başarıyla kaydedildi');
    }

    public function create(): void
    {
        $user = AuthMiddleware::authenticate();
        $body = Router::getJsonBody();

        $title = trim($body['title'] ?? '');
        $slug = trim($body['slug'] ?? '');

        if (empty($title)) {
            Response::error('Sayfa başlığı zorunludur', 422);
        }

        $db = Database::getConnection();

        // Benzersiz slug oluştur
        if (empty($slug)) {
            $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-'));
        }

        $checkStmt = $db->prepare('SELECT COUNT(*) FROM pages WHERE slug = ?');
        $checkStmt->execute([$slug]);
        if ($checkStmt->fetchColumn() > 0) {
            $slug = $slug . '-' . time();
        }

        $id = 'page_' . uniqid();
        $content = json_encode($body['content'] ?? [], JSON_UNESCAPED_UNICODE);
        $seo = json_encode($body['seo'] ?? null, JSON_UNESCAPED_UNICODE);

        $stmt = $db->prepare('INSERT INTO pages (id, title, slug, status, template, content, seo, author_id, created_at, updated_at) 
            VALUES (?, ?, ?, "DRAFT", "default", ?, ?, ?, NOW(), NOW())');
        $stmt->execute([$id, $title, $slug, $content, $seo, $user['id']]);

        Response::success(['id' => $id, 'slug' => $slug], 'Sayfa oluşturuldu', 201);
    }

    public function trash(string $id): void
    {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        // Sistem sayfaları silinemez
        $check = $db->prepare('SELECT is_system FROM pages WHERE id = ?');
        $check->execute([$id]);
        if ($check->fetchColumn() == 1) {
            Response::error('Sistem sayfaları çöpe atılamaz veya silinemez', 400);
        }

        $stmt = $db->prepare('UPDATE pages SET status = "TRASH", trashed_at = NOW() WHERE id = ?');
        $stmt->execute([$id]);

        Response::success(null, 'Sayfa çöpe taşındı');
    }

    public function restore(string $id): void
    {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $stmt = $db->prepare('UPDATE pages SET status = "DRAFT", trashed_at = NULL WHERE id = ?');
        $stmt->execute([$id]);

        Response::success(null, 'Sayfa geri yüklendi');
    }

    public function delete(string $id): void
    {
        AuthMiddleware::requireRole('ADMIN');
        $db = Database::getConnection();

        $check = $db->prepare('SELECT is_system FROM pages WHERE id = ?');
        $check->execute([$id]);
        if ($check->fetchColumn() == 1) {
            Response::error('Sistem sayfaları silinemez', 400);
        }

        $stmt = $db->prepare('DELETE FROM pages WHERE id = ?');
        $stmt->execute([$id]);

        Response::success(null, 'Sayfa kalıcı olarak silindi');
    }

    public function publish(string $id): void
    {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $stmt = $db->prepare('UPDATE pages SET status = "PUBLISHED", published_at = NOW(), trashed_at = NULL WHERE id = ?');
        $stmt->execute([$id]);

        Response::success(null, 'Sayfa yayınlandı');
    }

    public function revisions(string $id): void
    {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $stmt = $db->prepare('SELECT id, page_id, title, author_id, type, created_at FROM page_revisions WHERE page_id = ? ORDER BY created_at DESC LIMIT 30');
        $stmt->execute([$id]);
        $rows = $stmt->fetchAll();

        Response::success($rows);
    }

    public function lock(string $id): void
    {
        $user = AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $expiresAt = date('Y-m-d H:i:s', time() + 60); // 60 saniyelik kilit
        $lockId = 'lock_' . uniqid();

        $stmt = $db->prepare('INSERT INTO page_locks (id, page_id, user_id, user_name, expires_at) 
            VALUES (?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE user_id=VALUES(user_id), user_name=VALUES(user_name), expires_at=VALUES(expires_at)');
        $stmt->execute([$lockId, $id, $user['id'], $user['name'] ?? 'Kullanıcı', $expiresAt]);

        Response::success(['pageId' => $id, 'expiresAt' => $expiresAt], 'Kilit yenilendi');
    }

    public function unlock(string $id): void
    {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $stmt = $db->prepare('DELETE FROM page_locks WHERE page_id = ?');
        $stmt->execute([$id]);

        Response::success(null, 'Kilit kaldırıldı');
    }
}
