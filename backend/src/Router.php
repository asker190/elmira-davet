<?php

namespace Elmira;

use Elmira\Utils\Response;

class Router
{
    private array $routes = [];

    public function get(string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->addRoute('GET', $path, $handler, $middlewares);
    }

    public function post(string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->addRoute('POST', $path, $handler, $middlewares);
    }

    public function put(string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->addRoute('PUT', $path, $handler, $middlewares);
    }

    public function patch(string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->addRoute('PATCH', $path, $handler, $middlewares);
    }

    public function delete(string $path, callable|array $handler, array $middlewares = []): void
    {
        $this->addRoute('DELETE', $path, $handler, $middlewares);
    }

    private function addRoute(string $method, string $path, callable|array $handler, array $middlewares): void
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
            'middlewares' => $middlewares,
        ];
    }

    public function dispatch(string $method, string $uri): void
    {
        // Query string temizle
        $parsedUri = parse_url($uri, PHP_URL_PATH);
        $cleanUri = '/' . trim($parsedUri, '/');

        // /api prefix varsa temizle (örn. /api/pages -> /pages)
        if (str_starts_with($cleanUri, '/api/')) {
            $cleanUri = substr($cleanUri, 4);
        } elseif ($cleanUri === '/api') {
            $cleanUri = '/';
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $route['path']);
            $pattern = '#^' . $pattern . '$#';

            if (preg_match($pattern, $cleanUri, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);

                // Middleware'leri çalıştır
                foreach ($route['middlewares'] as $middleware) {
                    if (is_callable($middleware)) {
                        call_user_func($middleware);
                    }
                }

                $handler = $route['handler'];
                if (is_array($handler)) {
                    [$class, $action] = $handler;
                    $controller = new $class();
                    call_user_func_array([$controller, $action], $params);
                    return;
                }

                call_user_func_array($handler, $params);
                return;
            }
        }

        Response::error("Rota bulunamadı: [{$method}] {$cleanUri}", 404);
    }

    public static function getJsonBody(): array
    {
        $raw = file_get_contents('php://input');
        if (empty($raw)) {
            return [];
        }
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }
}
