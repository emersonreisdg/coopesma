import { chartColors, chartFontSizes, chartPluginsConfig } from '../chartConfig.js';

document.addEventListener('DOMContentLoaded', function () {
    const dataJson = JSON.parse(document.getElementById('data-json').textContent);
    const table = document.getElementById('dynamicTable');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    const yearSelector = document.getElementById('year_selector');
    const searchInput = document.querySelector('.search-input');
    const cooperadosCount = document.getElementById('total-cooperados-value');
    const alunosCount = document.getElementById('total-alunos-value');
    const rateioMensalBruto = document.getElementById('ratio-mensal-bruto-value');
    const rateioMensalLiquido = document.getElementById('ratio-mensal-liquido-value');

    let currentSortColumn = '';
    let sortAscending = true;

    const headers = [
        'Cooperado', 'Aluno', 'Turma', 'Cobrança Receita', 
        'Plano Desconto', 'Cooperar Plus', 'Benefícios', 'Rateio', 
        'Desconto Percentual', 'Desconto', 'Valor Líquido', 'Livros', 
        'Número Parcelas', 'Soma Livros', 'Indicado', 'Indicou'
    ];

    const alignmentMap = {
        'Benefícios': 'left',
        'Aluno': 'left',
        'Turma': 'center',
        'Cobrança Receita': 'center',
        'Plano Desconto': 'center',
        'Cooperar Plus': 'center',
        'Benefícios': 'center',
        'Rateio': 'center', 
        'Desconto Percentual': 'center',
        'Desconto': 'center',
        'Valor Líquido': 'center',
        'Livros': 'center',
        'Número Parcelas': 'center',
        'Soma Livros': 'center',
        'Indicado': 'center',
        'Indicou': 'center',
    };

    function getMaxYear() {
        const years = dataJson.map(item => new Date(item.data).getUTCFullYear());
        return Math.max(...years); // Retorna o maior ano
    }

    function createTableHeader() {
        thead.innerHTML = '';
        const headerRow = document.createElement('tr');
        headers.forEach((header, index) => {
            const th = document.createElement('th');
            th.textContent = header;
            th.style.cursor = 'pointer';
            th.style.textAlign = 'center';
            th.addEventListener('click', () => sortTableByColumn(index)); 
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
    }

    function sortTableByColumn(columnIndex) {
        const key = headers[columnIndex].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g, '_');
        if (currentSortColumn === key) {
            sortAscending = !sortAscending;
        } else {
            currentSortColumn = key;
            sortAscending = true;
        }

        const sortedData = [...dataJson].sort((a, b) => {
            const valA = a[key]?.toString().toLowerCase() || '';  // Usar toLowerCase apenas na comparação
            const valB = b[key]?.toString().toLowerCase() || '';

            if (valA < valB) return sortAscending ? -1 : 1;
            if (valA > valB) return sortAscending ? 1 : -1;
            return 0;
        });

        populateTable(sortedData);
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

                if (['rateio', 'desconto', 'valor_liquido', 'livros', 'soma_livros'].includes(normalizedHeader)) {
                    value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
                } else if (normalizedHeader === 'desconto_percentual') {
                    value = `${100 * value}%`;
                }

                cell.textContent = value || '-';
                cell.style.textAlign = alignmentMap[header];
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        });
    }

    function filterData() {
        const selectedYear = yearSelector.value;
        const searchQuery = searchInput.value.toLowerCase();
        let filteredData = dataJson;

        if (selectedYear !== 'all') {
            filteredData = filteredData.filter(item => {
                const itemYear = new Date(item.data).getUTCFullYear();
                return itemYear === parseInt(selectedYear);
            });
        }

        console.log('searchQuery:',searchQuery);

        if (searchQuery) {
            filteredData = filteredData.filter(item => 
                (item.cooperado && item.cooperado.toLowerCase().includes(searchQuery)) ||
                (item.aluno && item.aluno.toLowerCase().includes(searchQuery)) ||
                (item.turma && item.turma.toLowerCase().includes(searchQuery)) ||
                // (item.indicado && item.indicado.toLowerCase().includes(searchQuery)) ||
                (item.indicou && item.indicou.toLowerCase().includes(searchQuery))
            );
        }

        populateTable(filteredData);
        updateCooperadosCount(filteredData);
        updateAlunosCount(filteredData);
        updateRateioMensalBruto(filteredData);
        updateRateioMensalLiquido(filteredData);
    }

    function updateCooperadosCount(filteredData) {
        const cooperados = new Set(filteredData.map(item => item.cooperado));
        cooperadosCount.textContent = cooperados.size;
    }

    function updateAlunosCount(filteredData) {
        const alunos = new Set(filteredData.map(item => item.aluno));
        alunosCount.textContent = alunos.size;
    }

    function updateRateioMensalBruto(filteredData) {
        const totalRateio = filteredData.reduce((sum, item) => sum + (parseFloat(item.rateio) || 0), 0);
        rateioMensalBruto.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRateio);
    }

    function updateRateioMensalLiquido(filteredData) {
        const totalValorLiquido = filteredData.reduce((sum, item) => sum + (parseFloat(item.valor_liquido) || 0), 0);
        rateioMensalLiquido.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValorLiquido);
    }

    // Defina o maior ano como o valor inicial do yearSelector
    yearSelector.value = getMaxYear();

    // Adiciona eventos para filtrar
    yearSelector.addEventListener('change', () => {
        filterData();
    });

    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Impede o comportamento padrão de envio
        }
        filterData();
    });

    createTableHeader();
    filterData();
});
