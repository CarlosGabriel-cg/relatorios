<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Conexão com o banco
$host = 'localhost';
$dbname = 'contabilidade';
$user = 'root';
$pass = '';

// Conexão com o banco
$host = 'localhost';
$dbname = 'contabilidade';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Erro ao conectar com o banco de dados: ' . $e->getMessage()]);
    exit;
}
// Obtém os parâmetros enviados via GET
$table = $_GET['table'] ?? null;
$startDate = $_GET['startDate'] ?? null;
$endDate = $_GET['endDate'] ?? null;

// Validações
if (!$table) {
    echo json_encode(['error' => 'Nome da tabela não informado.']);
    exit;
}
if (!preg_match('/^[a-zA-Z0-9_]+$/', $table)) {
    echo json_encode(['error' => 'Nome da tabela inválido.']);
    exit;
}
if (!$startDate || !$endDate) {
    echo json_encode(['error' => 'Datas inválidas.']);
    exit;
}

// Mapeamento de colunas
$columnMapping = [
    'Código' => 'id',
    'Nome do servidor' => 'nome_servidor',
    'Sistema operacional' => 'sistema_operacional',
    'Mémoria (GB)' => 'memoria',
    'HD' => 'hd',
    'CPUs' => 'cpus',
    'Data cadastro' => 'data_criacao',
    'Valores' => 'valores',
    'data_criacao' => 'data_criacao',
    'data_alteracao' => 'data_alteracao',
    'data_exclusao' => 'data_exclusao',
    'usuario_exclusao' => 'usuario_exclusao',
    'quantidade_grupo' => 'quantidade_grupo',
    'valor_porcento' => 'valor_porcento',
    'Data altetação' => 'data_alteracao',
    'porcento' => 'porcento'
];

try {
    // Definir corretamente o nome da coluna de data
    $dateColumn = $columnMapping['Data cadastro'] ?? 'data_criacao';
    
    // Prepara a consulta SQL
    $stmt = $pdo->prepare("SELECT * FROM $table WHERE $dateColumn BETWEEN :startDate AND :endDate");
    $stmt->bindParam(':startDate', $startDate);
    $stmt->bindParam(':endDate', $endDate);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($result) {
        // Renomeia as chaves do resultado conforme o mapeamento
        $formattedResult = array_map(function($row) use ($columnMapping) {
            $formattedRow = [];
            foreach ($row as $key => $value) {
                $formattedKey = array_search($key, $columnMapping) ?: $key;
                $formattedRow[$formattedKey] = $value;
            }
            return $formattedRow;
        }, $result);

        echo json_encode(['data' => $formattedResult]);
    } else {
        echo json_encode(['message' => 'Nenhum dado encontrado.']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => 'Erro ao buscar os dados: ' . $e->getMessage()]);
    http_response_code(500);
}
