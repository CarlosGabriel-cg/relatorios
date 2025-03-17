<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$host = "localhost";
$dbname = "contabilidade";
$username = "root";  // Altere se necessário
$password = "";      // Altere se necessário

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Erro ao conectar ao banco"]));
}

// Obtendo os dados enviados pelo frontend
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["email"]) || !isset($data["password"])) {
    echo json_encode(["success" => false, "message" => "Dados incompletos"]);
    exit;
}

$email = $data["email"];
$password = md5($data["password"]); // Comparação com o hash armazenado

// Verifica se o usuário existe no banco
$query = "SELECT id, nome, nivel_acesso FROM usuarios WHERE email = ? AND senha_hash = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("ss", $email, $password);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    echo json_encode([
        "success" => true,
        "message" => "Login realizado com sucesso",
        "user" => [
            "id" => $user["id"],
            "nome" => $user["nome"],
            "nivel_acesso" => $user["nivel_acesso"]
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "e-mail ou senha inválidos"]);
}

$stmt->close();
$conn->close();
?>