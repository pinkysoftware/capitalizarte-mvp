<?php
/**
 * GET /api/profile
 * Header: Authorization: Bearer {token}
 * Response: { user: {...} }
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Método no permitido'], 405);
}

$user = get_auth_user($conex);

if (!$user) {
    json_response(['error' => 'No autorizado'], 401);
}

json_response(['user' => $user]);
?>
