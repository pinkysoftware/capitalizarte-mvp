<?php
/**
 * POST /api/logout
 * Header: Authorization: Bearer {token}
 * Response: { success: true }
 * 
 * Nota: Con tokens stateless (como user_id en base64),
 * no hay nada que invalidar del lado servidor.
 * El cliente simplemente descarta el token.
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Método no permitido'], 405);
}

$user = get_auth_user($conex);
if (!$user) {
    json_response(['error' => 'No autorizado'], 401);
}

json_response(['success' => true, 'message' => 'Sesión cerrada']);
?>
