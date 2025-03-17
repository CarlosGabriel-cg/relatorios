import { formatCurrency } from './format_values';

let dados = [];
document.addEventListener("DOMContentLoaded", function () {
    initializeDataTable('#myTable');

    let startDate = document.getElementById('startDate');
    let endDate = document.getElementById('endDate');

    startDate.addEventListener('change', fetchData);
    endDate.addEventListener('change', fetchData);
    // Chamar fetchData ao carregar a página para exibir os dados iniciais (se necessário)
    fetchData();
});

function fetchData() {
    let startDateVal = document.getElementById('startDate').value;
    let endDateVal = document.getElementById('endDate').value;

    if (!startDateVal || !endDateVal) return;

    let apiUrl = `http://localhost/relatorios/backend/getDate.php?table=info_contabeis&startDate=${startDateVal}&endDate=${endDateVal}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro ao buscar os dados.");
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error("Erro:", data.error);
            } else if (data.message) {
                console.log("Mensagem:", data.message);
            } else {
            /*  document.getElementById('startDateSelected').innerText = startDateVal;
                document.getElementById('endDateSelected').innerText = endDateVal; */
                dados = data.data;
                displayTable(data.data, '#tableContainer3', '#myTable');
            }
        })
        .catch(error => console.error("Erro na requisição:", error));
}

function createTable(containerSelector, tableSelector, columns) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Erro: contêiner da tabela (${containerSelector}) não encontrado!`);
        return;
    }

    container.innerHTML = `
        <div class="card-body">
            <table id="${tableSelector.slice(1)}" class="table table-striped" style="width:100%">
                <thead><tr>${columns.map(col => `<th>${col}</th>`).join('')}</tr></thead>
                <tfoot><tr>${columns.map(col => `<th>${col}</th>`).join('')}</tr></tfoot>
                <tbody></tbody>
            </table>
        </div>
    `;
}

function populateTable(tableSelector, dados, columns, formatValues = false) {
    const tbody = document.querySelector(`${tableSelector} tbody`);
    if (!tbody) return;

    dados.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = columns.map(col => {
            const value = row[col] || '';
            return `<td>${formatValues && col === 'Valores' ? formatCurrency(value) : value}</td>`;
        }).join('');
        tbody.appendChild(tr);
    });

    initializeDataTable(tableSelector);
}


function displayTable(dados, containerSelector, tableSelector) {
    const columns = ['Código','Nome do servidor', 'Sistema operacional', 'Mémoria (GB)', 'HD', 'CPUs', 'Data cadastro', 'Valores'];
    createTable(containerSelector, tableSelector, columns);
    populateTable(tableSelector, dados, columns, true);
}


window.exportarParaExcelRelatorios = function () {
    if (!dados || dados.length === 0) {
    const content = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Erro ao enviar arquivo!</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                        <div class="modal-body">
                            <div class="alert alert-warning" role="alert">
                            Favor carregar um arquivo primeiro!
                        </div>
                        </div>
                        <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
         </div>
    `;
    showModal(content);
    return;
}
const newDados = dados.map(({ 
    "Código": codigo, 
    "Nome do servidor": nome, 
    "Sistema operacional": sistema, 
    "Mémoria (GB)": memoria, 
    "HD": hd, 
    "CPUs": cpus, 
    "Valores": valores, 
    "Data cadastro": dataCadastro 
}) => ({
    "Código": codigo,
    "Nome do servidor": nome,
    "Sistema operacional": sistema,
    "Mémoria (GB)": memoria,
    "HD": hd,
    "CPUs": cpus,
    "Valores": parseFloat(valores) || 0,
    "Data cadastro": dataCadastro
}));

const ws = XLSX.utils.json_to_sheet(newDados);

// 🎨 Define os estilos
const estiloCabecalho = {
    font: { bold: true, color: { rgb: "FFFFFF" } }, // Texto branco
    fill: { fgColor: { rgb: "4F81BD" } }, // Azul escuro de fundo
    alignment: { horizontal: "center", vertical: "center" }
};

// 🎯 Define o formato de moeda
const formatoMoeda = "R$ #,##0.00";

    // Substituindo os cabeçalhos padrão pelos novos
    const novosCabecalhos = ['Código', 'Nome do servidor', 'Sistema operacional', 'Mémoria (GB)', 'HD',	'CPUs',	'Valores',	'Data cadastro'];

    // Atribui os novos cabeçalhos ao Excel
    novosCabecalhos.forEach((nomeCabecalho, i) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: i }); // Primeira linha, variando as colunas
        if (ws[cellAddress]) {
            ws[cellAddress].v = nomeCabecalho; // Substitui o valor do cabeçalho
            ws[cellAddress].s = estiloCabecalho; // Aplica o estilo
        }
    });

// 🔍 Obtém o intervalo total de células na planilha
const range = XLSX.utils.decode_range(ws["!ref"]);


// 🌀 Percorre todas as linhas, aplicando a formatação na Coluna C e Coluna D
for (let R = range.s.r + 1; R <= range.e.r; R++) { // Começa na segunda linha (índice 1)
    let cellG = `G${R + 1}`; // Exemplo: C2, C3, C4...
    // let cellD = `D${R + 1}`; 
    console.debug(cellG);

    if (ws[cellG] && typeof ws[cellG].v === "number") ws[cellG].z = formatoMoeda;
    // if (ws[cellD] && typeof ws[cellD].v === "number") ws[cellD].z = formatoMoeda;
}

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Dados Processados");

XLSX.writeFile(wb, "Relatorio.xlsx");
};