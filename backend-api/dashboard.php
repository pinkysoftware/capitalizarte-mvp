<?php
/**
 * GET /api/dashboard
 * Header: Authorization: Bearer {token}
 * Response: { saldo, ingresos, gastos, salud_financiera, ultimas_transacciones }
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['error' => 'Método no permitido'], 405);
}

$user = get_auth_user($conex);
if (!$user) {
    json_response(['error' => 'No autorizado'], 401);
}

$user_id = $user['id'];

// Obtener transacciones del mes actual
$mes_actual = date('Y-m');
$stmt = $conex->prepare("
    SELECT tipo, monto, fecha FROM transacciones_app 
    WHERE usuario_id = ? AND DATE_FORMAT(fecha, '%Y-%m') = ?
");
$stmt->bind_param("is", $user_id, $mes_actual);
$stmt->execute();
$result = $stmt->get_result();

$ingresos = 0;
$gastos = 0;
$ultimas = [];

while ($row = $result->fetch_assoc()) {
    if ($row['tipo'] === 'INGRESO') {
        $ingresos += floatval($row['monto']);
    } else {
        $gastos += floatval($row['monto']);
    }
    $ultimas[] = $row;
}

// Obtener últimas 8 transacciones
$stmt2 = $conex->prepare("SELECT id, tipo, naturaleza, categoria, monto, descripcion, fecha FROM transacciones_app WHERE usuario_id = ? ORDER BY fecha DESC, id DESC LIMIT 8");
$stmt2->bind_param("i", $user_id);
$stmt2->execute();
$result2 = $stmt2->get_result();
$ultimas_transacciones = [];
while ($row = $result2->fetch_assoc()) {
    $ultimas_transacciones[] = $row;
}

// Calcular salud financiera
$saldo = $ingresos - $gastos;
$ingreso_mensual = floatval($user['ingreso_mensual']) > 0 ? floatval($user['ingreso_mensual']) : $ingresos;
$salud_financiera = $ingreso_mensual > 0 ? max(0, min(100, round(($saldo / $ingreso_mensual) * 100))) : 0;

json_response([
    'saldo' => $saldo,
    'ingresos' => $ingresos,
    'gastos' => $gastos,
    'salud_financiera' => $salud_financiera,
    'ultimas_transacciones' => $ultimas_transacciones,
]);
?>
