function showModal(contentHTML) {
    const container = document.createElement('div');
    container.classList.add('modal', 'fade');
    container.tabIndex = -1;
    container.innerHTML = `${contentHTML}`;

    // Adicionar o container da modal ao body
    document.body.appendChild(container);

    // Inicializar e mostrar a modal
    const modal = new bootstrap.Modal(container);
    modal.show();

    // Opcional: Remover a modal do DOM após o fechamento
    container.addEventListener('hidden.bs.modal', function () {
        container.remove();
    });
}

window.dados_geral = function () {
    if (dadosCarregados.length === 0) {
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

    fetch('./backend/config.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({table: 'info_contabeis', data: window.dadosCarregados })
    })
        .then(response => response.json())
        .then(data => {
            const content = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Salvando...</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Seus dados foram salvos com sucesso</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        `;
            showModal(content);
        })
        .catch(error => {
            console.error('Erro ao enviar os dados:', error);
            const content = `
                    <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">Erro ao enviar arquivo!</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                    <div class="modal-body">
                                        <div class="alert alert-danger" role="alert">
                                            Erro ao salvar os dados.
                                        </div>
                                    </div>
                                    <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                            </div>
                        </div>
                    </div>
        `;
            showModal(content);
        });
}

window.dados_grupo = function () {
    if (dadosGrupo.length === 0) {
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

    fetch('./backend/config.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({table: 'grupos_contabeis', data: window.dadosGrupo })
    })
    .then(response => {
        console.log("Resposta do servidor:", response);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        return response.text();  // Alterar para 'text' para inspecionar a resposta bruta
    })
    .then(responseText => {
        console.log("Resposta em texto bruto:", responseText);
        try {
            const data = JSON.parse(responseText);  
            const content = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Salvando...</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>Seus dados foram salvos com sucesso</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            `;
            showModal(content);
            setTimeout(function () {
                document.getElementById("btnBaixar").removeAttribute("disabled");
            }, 1000);
        } catch (e) {
            console.error("Erro ao parsear o JSON:", e);
            const content = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Erro ao enviar arquivo!</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-danger" role="alert">
                                Resposta inesperada do servidor: ${e.message}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            `;
            showModal(content);
        }
    })
    .catch(error => {
        console.error('Erro ao enviar os dados:', error);
        const content = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Erro ao enviar arquivo!</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-danger" role="alert">
                            Erro ao salvar os dados.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                    </div>
                </div>
            </div>
        `;
        showModal(content);
    });    
}
window.exportarParaExcel = function () {
    if (!dadosGrupo || dadosGrupo.length === 0) {
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

const ws = XLSX.utils.json_to_sheet(dadosGrupo);

// 🎨 Define os estilos
const estiloCabecalho = {
    font: { bold: true, color: { rgb: "FFFFFF" } }, // Texto branco
    fill: { fgColor: { rgb: "4F81BD" } }, // Azul escuro de fundo
    alignment: { horizontal: "center", vertical: "center" }
};

// 🎯 Define o formato de moeda
const formatoMoeda = "R$ #,##0.00";

    // Substituindo os cabeçalhos padrão pelos novos
    const novosCabecalhos = ['Sistema operacional', 'Quantidade', 'Total de Valores por Grupo', 'Valor em %', 'Porcento', 'Data alteração'];

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
    let cellC = `C${R + 1}`; // Exemplo: C2, C3, C4...
    let cellD = `D${R + 1}`; // Exemplo: D2, D3, D4...

    if (ws[cellC] && typeof ws[cellC].v === "number") ws[cellC].z = formatoMoeda;
    if (ws[cellD] && typeof ws[cellD].v === "number") ws[cellD].z = formatoMoeda;
}

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Dados Processados");

XLSX.writeFile(wb, "dados_modificados.xlsx");
};