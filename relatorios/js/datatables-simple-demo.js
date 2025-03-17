window.addEventListener('DOMContentLoaded', event => {
    initializeDataTable('#datatablesSimple');
});

function initializeDataTable(selector, options = {}) {
    const table = document.querySelector(selector);
    if (table) {
        new simpleDatatables.DataTable(table, {
            searchable: true,
            fixedHeight: true,
            perPage: 20,
            labels: {
                placeholder: "Filtrar...",
                perPage: "Registros por página",
                noRows: "Nenhum registro encontrado",
                info: "Mostrando {start} a {end} de {rows} registros",
            },
            ...options // Permite passar configurações extras caso necessário
        });
    }
}