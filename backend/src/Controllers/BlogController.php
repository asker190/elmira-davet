<?php

namespace Elmira\Controllers;

use Elmira\Config\Database;
use Elmira\Middleware\AuthMiddleware;
use Elmira\Router;
use Elmira\Utils\Response;
use PDO;

class BlogController
{
    public function index(): void
    {
        $status = $_GET['status'] ?? 'ALL';
        $db = Database::getConnection();

        $where = [];
        $params = [];
        if ($status !== 'ALL') {
            $where[] = 'status = ?';
            $params[] = $status;
        }

        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        $stmt = $db->prepare("SELECT id, title, slug, excerpt, cover_image_url, status, published_at, created_at, updated_at 
            FROM blog_posts {$whereClause} ORDER BY created_at DESC");
        $stmt->execute($params);
        $posts = $stmt->fetchAll();

        Response::success($posts);
    }

    public function show(string $slug): void
    {
        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM blog_posts WHERE slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        $post = $stmt->fetch();

        if (!$post) {
            Response::error('Blog yazısı bulunamadı', 404);
        }

        Response::success($post);
    }

    public function store(): void
    {
        AuthMiddleware::authenticate();
        $body = Router::getJsonBody();

        $title = trim($body['title'] ?? '');
        $content = trim($body['content'] ?? '');

        if (empty($title) || empty($content)) {
            Response::error('Başlık ve içerik zorunludur', 422);
        }

        $db = Database::getConnection();
        $id = 'blog_' . uniqid();
        $slug = $body['slug'] ?? strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-'));
        $excerpt = $body['excerpt'] ?? null;
        $coverImageUrl = $body['coverImageUrl'] ?? $body['cover_image_url'] ?? null;
        $status = ($body['status'] ?? 'DRAFT') === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
        $publishedAt = $status === 'PUBLISHED' ? date('Y-m-d H:i:s') : null;

        $stmt = $db->prepare('INSERT INTO blog_posts (id, title, slug, excerpt, content, cover_image_url, status, published_at, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())');
        $stmt->execute([$id, $title, $slug, $excerpt, $content, $coverImageUrl, $status, $publishedAt]);

        Response::success(['id' => $id, 'slug' => $slug], 'Blog yazısı oluşturuldu', 201);
    }

    public function update(string $id): void
    {
        AuthMiddleware::authenticate();
        $body = Router::getJsonBody();

        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM blog_posts WHERE id = ?');
        $stmt->execute([$id]);
        $post = $stmt->fetch();

        if (!$post) {
            Response::error('Blog yazısı bulunamadı', 404);
        }

        $title = $body['title'] ?? $post['title'];
        $slug = $body['slug'] ?? $post['slug'];
        $excerpt = $body['excerpt'] ?? $post['excerpt'];
        $content = $body['content'] ?? $post['content'];
        $coverImageUrl = $body['coverImageUrl'] ?? $body['cover_image_url'] ?? $post['cover_image_url'];
        $status = $body['status'] ?? $post['status'];
        $publishedAt = ($status === 'PUBLISHED' && empty($post['published_at'])) ? date('Y-m-d H:i:s') : $post['published_at'];

        $updateStmt = $db->prepare('UPDATE blog_posts SET title = ?, slug = ?, excerpt = ?, content = ?, cover_image_url = ?, status = ?, published_at = ?, updated_at = NOW() WHERE id = ?');
        $updateStmt->execute([$title, $slug, $excerpt, $content, $coverImageUrl, $status, $publishedAt, $id]);

        Response::success(null, 'Blog yazısı güncellendi');
    }

    public function delete(string $id): void
    {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $db->prepare('DELETE FROM blog_posts WHERE id = ?')->execute([$id]);
        Response::success(null, 'Blog yazısı silindi');
    }
}
