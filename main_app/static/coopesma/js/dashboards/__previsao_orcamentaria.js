import { chartColors, chartFontSizes, chartPluginsConfig } from '../chartConfig.js';

document.addEventListener('DOMContentLoaded', function () {
    const dataJson = JSON.parse(document.getElementById('data-json').textContent);
    const monthsByYear = JSON.parse(document.getElementById("monthsByYear-json").textContent);
    const subtipoPorTipo = JSON.parse(document.getElementById("subtipoPorTipo-json").textContent);
    const categoriaPorSubtipo = JSON.parse(document.getElementById("categoriaPorSubtipo-json").textContent);
    const itemPorCategoria = JSON.parse(document.getElementById("itemPorCategoria-json").textContent);

    const table = document.getElementById('dynamicTable');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    const yearSelector = document.getElementById('year_selector');
    const mesSelector = document.getElementById('mesSelector');  
    const tipoSelector = document.getElementById("tipoSelector");
    const subtipoSelector = document.getElementById("subtipoSelector");
    const categoriaSelector = document.getElementById("categoriaSelector");
    const itemSelector = document.getElementById("itemSelector");
    const searchInput = document.querySelector('.search-input');
    const totalReceita = document.getElementById('total-receita-value');
    const totalDespesa = document.getElementById('total-despesa-value');
    const clearFiltersButton = document.getElementById("clearFiltersButton");

    const headers = [
        'Mês', 'Tipo', 'Subtipo', 'Categoria', 
        'Item', 'Valor', 'Observação'
    ];

    const alignmentMap = {
        'Mês': 'center',
        'Tipo': 'center',
        'Subtipo': 'center',
        'Categoria': 'center',
        'Item': 'left',
        'Valor': 'center',
        'Observação': 'left'
    };

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function getMaxYear() {
        const years = dataJson.map(item => new Date(item.data).getUTCFullYear());
        return Math.max(...years);
    }

    function createTableHeader() {
        thead.innerHTML = '';
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            th.style.textAlign = 'center';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
    }

    function filterData() {
        const selectedYear = yearSelector.value;
        const selectedMonth = mesSelector.value;
        const tipoSelecionado = tipoSelector.value;
        const subtipoSelecionado = subtipoSelector.value;
        const categoriaSelecionada = categoriaSelector.value;
        const itemSelecionado = itemSelector.value;
        const searchQuery = searchInput.value.toLowerCase();
        let filteredData = dataJson;

        if (selectedYear !== 'all') {
            filteredData = filteredData.filter(item => {
                const itemYear = new Date(item.data).getUTCFullYear();
                return itemYear === parseInt(selectedYear);
            });

            updateTotalReceita(filteredData);
            updateTotalDespesa(filteredData);
            updateReajusteRateio(filteredData);
        }

        if (selectedMonth !== '') {
            filteredData = filteredData.filter(item => {
                const itemMonth = new Date(item.data).getMonth() + 1;
                return itemMonth === parseInt(selectedMonth);
            });
        }

        if (tipoSelecionado !== 'all') {
            filteredData = filteredData.filter(item => item.tipo === tipoSelecionado);
        }

        if (subtipoSelecionado !== 'all') {
            filteredData = filteredData.filter(item => item.subtipo === subtipoSelecionado);
        }

        if (categoriaSelecionada !== 'all') {
            filteredData = filteredData.filter(item => item.categoria === categoriaSelecionada);
        }

        if (itemSelecionado !== 'all') {
            filteredData = filteredData.filter(item => item.item === itemSelecionado);
        }

        if (searchQuery) {
            filteredData = filteredData.filter(item => 
                (item.tipo && item.tipo.toLowerCase().includes(searchQuery)) ||
                (item.subtipo && item.subtipo.toLowerCase().includes(searchQuery)) ||
                (item.categoria && item.categoria.toLowerCase().includes(searchQuery)) ||
                (item.item && item.item.toLowerCase().includes(searchQuery)) ||
                (item.observacao && item.observacao.toLowerCase().includes(searchQuery))
            );
        }

        populateTable(filteredData);
        updateMesSelector(filteredData);
    }

    function updateMesSelector(filteredData) {
        const selectedMonth = mesSelector.value;
        mesSelector.innerHTML = '<option value="">Todos</option>'; 
        const selectedYear = yearSelector.value;

        if (selectedYear && monthsByYear[selectedYear]) {
            monthsByYear[selectedYear].forEach(mes => {
                const option = document.createElement("option");
                option.value = String(mes).padStart(2, '0'); 
                option.textContent = capitalize(new Date(0, mes - 1).toLocaleString('pt-BR', { month: 'long' }));
                mesSelector.appendChild(option);
            });
        }

        if (selectedMonth) {
            mesSelector.value = selectedMonth;
        }
    }

    function updateSubtipoSelector() {
        const tipoSelecionado = tipoSelector.value;
        subtipoSelector.innerHTML = '<option value="all">Todos</option>';
        if (tipoSelecionado && subtipoPorTipo[tipoSelecionado]) {
            subtipoPorTipo[tipoSelecionado].forEach(subtipo => {
                const option = document.createElement("option");
                option.value = subtipo;
                option.textContent = subtipo;
                subtipoSelector.appendChild(option);
            });
        }
    }

    function updateCategoriaSelector() {
        categoriaSelector.innerHTML = '<option value="all">Todas</option>'; 
        const tipoSelecionado = tipoSelector.value;
        const subtipoSelecionado = subtipoSelector.value;
        if (tipoSelecionado && subtipoSelecionado && categoriaPorSubtipo[tipoSelecionado][subtipoSelecionado]) {
            categoriaPorSubtipo[tipoSelecionado][subtipoSelecionado].forEach(categoria => {
                const option = document.createElement("option");
                option.value = categoria;
                option.textContent = categoria;
                categoriaSelector.appendChild(option);
            });
        }
    }

    function updateItemSelector() {
        itemSelector.innerHTML = '<option value="all">Todos</option>'; 
        const tipoSelecionado = tipoSelector.value;
        const subtipoSelecionado = subtipoSelector.value;
        const categoriaSelecionada = categoriaSelector.value;
        if (tipoSelecionado && subtipoSelecionado && categoriaSelecionada && itemPorCategoria[tipoSelecionado][subtipoSelecionado][categoriaSelecionada]) {
            itemPorCategoria[tipoSelecionado][subtipoSelecionado][categoriaSelecionada].forEach(item => {
                const option = document.createElement("option");
                option.value = item;
                option.textContent = item;
                itemSelector.appendChild(option);
            });
        }
    }

    function clearFilters() {
        yearSelector.value = getMaxYear();
        mesSelector.innerHTML = '<option value="">Todos</option>'; 
        tipoSelector.value = "all"; 
        subtipoSelector.innerHTML = '<option value="all">Todas</option>'; 
        categoriaSelector.innerHTML = '<option value="all">Todas</option>'; 
        itemSelector.innerHTML = '<option value="all">Todos</option>'; 
        searchInput.value = "";
        filterData();
    }

    function updateTotalReceita(filteredData) {
        const receita = filteredData.reduce((sum, item) => {
            if (item.tipo.toLowerCase() === 'receita') {
                return sum + (parseFloat(item.valor) || 0);
            }
            return sum;
        }, 0);
        totalReceita.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receita);
    }

    function updateTotalDespesa(filteredData) {
        const despesa = filteredData.reduce((sum, item) => {
            if (item.tipo.toLowerCase() === 'despesa') {
                return sum + (parseFloat(item.valor) || 0);
            }
            return sum;
        }, 0);
        totalDespesa.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesa);
    }

    function updateReajusteRateio(filteredData) { 
        const totalDespesaNum = parseFloat(totalDespesa.textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
        const totalReceitaNum = parseFloat(totalReceita.textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
        const totalRateio = filteredData.reduce((sum, item) => {
            if (item.item.toLowerCase() === 'rateio mensal') {
                return sum + (parseFloat(item.valor) || 0);
            }
            return sum;
        }, 0);
        const deficit = totalDespesaNum - totalReceitaNum;

        const percentualReajusteRateio = deficit > 0 
        ? (((totalDespesaNum - totalReceitaNum) / totalRateio) * 100).toFixed(1).replace('.', ',') + '%' 
        : '0,0%';

        document.getElementById('absolute-reajuste-rateio').textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deficit);

        const percentageElement = document.getElementById('percentage-reajuste-rateio');
        percentageElement.innerHTML = '';
        percentageElement.style.color = deficit > 0 ? 'red' : 'blue';

        const triangle = document.createElement('span');
        triangle.classList.add('triangle', 'up');

        const percentageText = document.createTextNode(percentualReajusteRateio);

        if (deficit > 0) {
            percentageElement.appendChild(triangle);
        }
        percentageElement.appendChild(percentageText);
    }

    function populateTipoSelector() {
        const tiposUnicos = [...new Set(dataJson.map(item => item.tipo))];
        tipoSelector.innerHTML = '<option value="all">Todos</option>';
        tiposUnicos.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo;
            option.textContent = tipo;
            tipoSelector.appendChild(option);
        });
    }

    function populateTable(filteredData) {
        tbody.innerHTML = '';
        filteredData.forEach(item => {
            const row = document.createElement('tr');
            headers.forEach(header => {
                const cell = document.createElement('td');
                const normalizedHeader = header
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s/g, '_');

                let value = item[normalizedHeader];

                if (normalizedHeader === 'valor') {
                    value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
                } else if (normalizedHeader === 'mes') {
                    const date = new Date(item.data);
                    const month = date.toLocaleString('pt-BR', { month: 'long' }); 
                    value = capitalize(month); 
                }

                cell.textContent = value || '-';
                cell.style.textAlign = alignmentMap[header];
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        });

        // Inicializa ou re-inicializa o DataTables
        initializeDataTable('dynamicTable');
    }

    function initializeDataTable(tableId) {
        if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
            $(`#${tableId}`).DataTable().destroy();
        }

        $(`#${tableId}`).DataTable({
            order: [[0, 'asc']],
            language: {
                lengthMenu: "Mostrar _MENU_ entradas",
                zeroRecords: "Nenhum registro encontrado",
                info: "Mostrando _START_ a _END_ de _TOTAL_ entradas",
                infoEmpty: "Mostrando 0 a 0 de 0 entradas",
                infoFiltered: "(filtrado de _MAX_ entradas totais)",
                search: "Buscar:",
                paginate: {
                    first: "Primeiro",
                    last: "Último",
                    next: "Próximo",
                    previous: "Anterior"
                }
            }
        });
    }

    // Inicializa a tabela e os eventos
    createTableHeader();
    filterData();

    // Event listeners
    yearSelector.addEventListener('change', () => {
        mesSelector.value = '';
        updateMesSelector(yearSelector.value);
        filterData();
    });
    mesSelector.addEventListener('change', filterData);
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
        filterData();
    });
    tipoSelector.addEventListener("change", function () {
        updateSubtipoSelector();
        filterData();
    });
    subtipoSelector.addEventListener("change",  function () {
        updateCategoriaSelector();
        filterData();
    });
    categoriaSelector.addEventListener("change",  function () {
        updateItemSelector();
        filterData();
    });
    itemSelector.addEventListener("change", filterData);
    clearFiltersButton.addEventListener("click", clearFilters);
});


