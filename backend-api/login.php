<?php
/**
 * POST /api/login
 * Body: { email, password }
 * Response: { token, user: {...} }
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Método no permitido'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (!$email || !$password) {
    json_response(['error' => 'Email y contraseña son requeridos'], 400);
}

$stmt = $conex->prepare("SELECT id, nombre, email, telefono, password, aprobado, apodo, ciudad, pais, ocupacion, ingreso_mensual, gastos_fijos, gastos_variables, nivel_inversor, avatar_id FROM datos WHERE email = ? LIMIT 1");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    json_response(['error' => 'Credenciales inválidas'], 401);
}

$user = $result->fetch_assoc();

if (!$user['aprobado']) {
    json_response(['error' => 'Cuenta no aprobada'], 403);
}

if (!password_verify($password, $user['password'])) {
    json_response(['error' => 'Credenciales inválidas'], 401);
}

// Generar token simple (user_id en base64)
$token = base64_encode($user['id']);

// Remover password del response
unset($user['password']);

json_response([
    'token' => $token,
    'user' => $user
]);
?>
