import { chartColors, chartFontSizes, chartPluginsConfig } from '../chartConfig.js';

document.addEventListener('DOMContentLoaded', function () {
    const dataJson = JSON.parse(document.getElementById('data-json').textContent);
    const table = document.getElementById('dynamicTable');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    const tfoot = document.createElement('tfoot'); // Criar elemento <tfoot> para a linha de totais
    table.appendChild(tfoot); // Anexar o <tfoot> à tabela
    const yearSelector = document.getElementById('year_selector');
    const serieSelector = document.getElementById('serie_selector');
    const turmaSelector = document.getElementById('turma_selector');
    const cooperadosCount = document.getElementById('total-cooperados-value');
    const alunosCount = document.getElementById('total-alunos-value');
    const rateioMensalBruto = document.getElementById('ratio-mensal-bruto-value');
    const rateioMensalLiquido = document.getElementById('ratio-mensal-liquido-value');
    const clearFiltersButton = document.getElementById("clearFiltersButton");

    //const data = JSON.parse('{{ data|safe }}');
    const dataElement = document.getElementById('data-json');
    const data = JSON.parse(dataElement.textContent || dataElement.innerText);
    
    let currentRateioMensalBruto = 0;
    let totalAlunosPorAno = 0;

    const headers = [
        'Benefícios', 'Nº de Alunos', 'Desconto R$', 'Desconto %'
    ];

    const alignmentMap = {
        'Benefícios': 'center',
        'Nº de Alunos': 'center',
        'Desconto R$': 'center',
        'Desconto %': 'center'
    };

    const normalizedDataJson = dataJson.map(item => ({
        ...item,
        beneficios: item.beneficios ? item.beneficios.toLowerCase().trim() : '',
        aluno: item.aluno || 0,
        desconto: item.desconto || 0,
    }));

    // const cooperarPlusCount = document.getElementById('cooperar-plus-value');

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function updateCooperarPlus(filteredData) {
        const totalCooperarPlus = filteredData.reduce((sum, item) => {
            return sum + (parseInt(item.cooperar_plus) || 0);
        }, 0);

        const alunosCountValue = parseInt(alunosCount.textContent) || 0;
        totalAlunosPorAno = totalAlunosPorAno == 0 ? alunosCountValue : totalAlunosPorAno; 
        const percentual = alunosCountValue > 0
            ? ((totalCooperarPlus / totalAlunosPorAno) * 100).toFixed(2) + '%'
            : '0.00%';

        document.getElementById('absolute-value').textContent = totalCooperarPlus;
        document.getElementById('percentage-value').textContent = percentual;
    }

    function groupByBeneficios(data) {
        const groupedData = {};

        data.forEach(item => {
            const beneficio = item.beneficios.trim();

            if (!groupedData[beneficio]) {
                groupedData[beneficio] = {
                    beneficios: beneficio,
                    total_alunos: 0,
                    total_desconto: 0,
                };
            }

            groupedData[beneficio].total_alunos += 1;
            groupedData[beneficio].total_desconto += item.desconto;
        });

        return Object.values(groupedData);
    }

    function createTableHeader() {
        thead.innerHTML = '';
        const headerRow = document.createElement('tr');
        headers.forEach((header, index) => {
            const th = document.createElement('th');
            th.textContent = header;
            th.style.cursor = 'pointer';
            th.style.textAlign = 'center';  // Aplicar alinhamento
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
    }

    function createTotalRow(totals) {
        tfoot.innerHTML = ''; // Limpar conteúdo anterior do rodapé
        const totalRow = document.createElement('tr');
        headers.forEach(header => {
            const cell = document.createElement('td');
            const normalizedHeader = header.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s/g, '_');
            let value = '-';
            
            if (normalizedHeader === 'nº_de_alunos') {
                value = totals.total_alunos;
            } else if (normalizedHeader === 'desconto_r$') {
                value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totals.total_desconto);
            } else if (normalizedHeader === 'desconto_%') {
                value = currentRateioMensalBruto > 0
                    ? `${(100 * totals.total_desconto / currentRateioMensalBruto).toFixed(2)}%`
                    : '0.00%';
            }
            cell.textContent = value;
            totalRow.appendChild(cell);
        });
        tfoot.appendChild(totalRow);
    }

    // Função para selecionar automaticamente o maior ano
    function selectMaxYear() {
        const options = Array.from(yearSelector.options);
        const years = options.map(option => parseInt(option.value)).filter(year => !isNaN(year));
        const maxYear = Math.max(...years);
        yearSelector.value = maxYear;
    }

    function populateTable(filteredData) {
        tbody.innerHTML = ''; 
        let totalAlunos = 0;
        let totalDesconto = 0;
        
        filteredData.forEach(item => {
            const row = document.createElement('tr');
            headers.forEach(header => {
                const cell = document.createElement('td');
                const normalizedHeader = header
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s/g, '_');
    
                let value;
                
                if (normalizedHeader === 'beneficios') {
                    value = capitalize(item[normalizedHeader]);
                } else if (normalizedHeader === 'nº_de_alunos') {
                    value = item.total_alunos;
                    totalAlunos += item.total_alunos; // Somar total de alunos
                } else if (normalizedHeader === 'desconto_r$') {
                    value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total_desconto);
                    totalDesconto += item.total_desconto; // Somar total de desconto
                } else if (normalizedHeader === 'desconto_%') {
                    value = currentRateioMensalBruto > 0
                        ? `${(100 * item.total_desconto / currentRateioMensalBruto).toFixed(2)}%`
                        : '0.00%';
                } else {
                    value = item[normalizedHeader] || '-';
                }
    
                cell.textContent = value;
                cell.style.textAlign = alignmentMap[header];  // Aplicar alinhamento
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        });
    
        // Adicionar a linha de total no final
        addTotalRow(totalAlunos, totalDesconto);
    }
    
    function addTotalRow(totalAlunos, totalDesconto) {
        let tfoot = table.querySelector('tfoot');
        
        // Se já houver um <tfoot>, removê-lo para recriar
        if (tfoot) {
            tfoot.remove();
        }
    
        // Criar o elemento <tfoot>
        tfoot = document.createElement('tfoot');
        const totalRow = document.createElement('tr');
        
        // Primeira célula com a palavra "Total"
        const totalCell = document.createElement('td');
        totalCell.textContent = 'Total';
        totalCell.colSpan = 1; // Colocar "Total" na coluna "Benefícios"
        totalCell.style.textAlign = 'center';
        totalRow.appendChild(totalCell);
    
        // Segunda célula para o total de alunos
        const totalAlunosCell = document.createElement('td');
        totalAlunosCell.textContent = totalAlunos;
        totalAlunosCell.style.textAlign = 'center';
        totalRow.appendChild(totalAlunosCell);
    
        // Terceira célula para o total de desconto
        const totalDescontoCell = document.createElement('td');
        totalDescontoCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDesconto);
        totalDescontoCell.style.textAlign = 'center';
        totalRow.appendChild(totalDescontoCell);
    
        // Quarta célula para o total de desconto percentual
        const totalPercentualCell = document.createElement('td');
        totalPercentualCell.textContent = currentRateioMensalBruto > 0
            ? `${(100 * totalDesconto / currentRateioMensalBruto).toFixed(2)}%`
            : '0.00%';
        totalPercentualCell.style.textAlign = 'center';
        totalRow.appendChild(totalPercentualCell);
    
        // Adicionar a linha de total ao <tfoot>
        tfoot.appendChild(totalRow);
        table.appendChild(tfoot); // Adicionar o <tfoot> à tabela
    }
    

    function filterData() {
        const selectedYear = yearSelector.value;
        let selectedSerie = serieSelector.value;
        let selectedTurma = turmaSelector.value;
        let filteredData = normalizedDataJson;

        console.log("Dados antes da filtragem por ano:", filteredData);
        console.log('selectedYear:',selectedYear)

        if (selectedYear !== 'all') {
            filteredData = filteredData.filter(item => {
                const itemYear = new Date(item.data).getUTCFullYear();
                console.log('itemYear:',itemYear);
                return itemYear === parseInt(selectedYear);
            });
        }

        updateCooperarPlus(filteredData);

        console.log("Dados antes da filtragem por ´serie:", filteredData);
        
        selectedSerie = selectedSerie.trim().toLowerCase();
        console.log('selectedSerie:',selectedSerie);

        if (selectedSerie !== 'all') {
            // Filtrar por série selecionada, se não for 'all'
            filteredData = filteredData.filter(item => {
                // console.log('item.turma:',item.turma);
                // console.log('item.turma.trim().toLowerCase(): ',item.turma.trim().toLowerCase());
                return item.turma.trim().toLowerCase().includes(selectedSerie.trim().toLowerCase());
            });
        }

        console.log("Dados após a filtragem por série:", filteredData);

        selectedTurma = selectedTurma.trim().toLowerCase();
        console.log('selectedTurma:',selectedTurma);

        if (selectedTurma !== 'all') {
            // Filtrar por série selecionada, se não for 'all'
            filteredData = filteredData.filter(item => {
                // console.log('item.turma:',item.turma);
                // console.log('item.turma.trim().toLowerCase(): ',item.turma.trim().toLowerCase());
                return item.turma.trim().toLowerCase().includes(selectedTurma.trim().toLowerCase());
            });
        }

        console.log("Dados após a filtragem por turma:", filteredData);

        const groupedData = groupByBeneficios(filteredData);

        updateCooperadosCount(filteredData);
        updateAlunosCount(filteredData);
        updateRateioMensalBruto(filteredData);
        updateRateioMensalLiquido(filteredData);
        //updateCooperarPlus(filteredData);
        populateTable(groupedData);
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
        currentRateioMensalBruto = totalRateio;
        rateioMensalBruto.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRateio);
    }

    function updateRateioMensalLiquido(filteredData) {
        const totalValorLiquido = filteredData.reduce((sum, item) => sum + (parseFloat(item.valor_liquido) || 0), 0);
        rateioMensalLiquido.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValorLiquido);
    }

    let series = [];  // Declarando series fora do bloco condicional
    let turmas = [];  // Declarando turmas fora do bloco condicional

    // Função para preencher o serieSelector dinamicamente com base no ano selecionado
    function updateSerieSelector(year) {
        console.log('function updateSerieSelector(year)');
        if (!year){
            year = parseInt(yearSelector.value, 10);
        }
        const filteredData = data.filter(item => new Date(item.data).getFullYear() === year);
        console.log('year:', year);
        console.log('filteredData:', filteredData)

        totalAlunosPorAno = [...new Set(filteredData.map(item => item.aluno))].length;
        console.log('totalAlunosPorAno:', totalAlunosPorAno);

        // Extraindo as séries do array de objetos filtrados por ano
        const seriesTurmas  = [...new Set(filteredData.map(item => item.turma))];
        console.log('seriesTurmas:', seriesTurmas);

        series = [...new Set(seriesTurmas.map(item => item.split(' - ')[0]))].sort();

        console.log('Séries:',series);

        // Preencher o turmaSelector com as opções de series e adicionar "Todas" no início
        turmaSelector.innerHTML = '';  // Limpar qualquer opção existente
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.text = 'TODAS';
        allOption.selected = true;  // Selecionar "Todas" como padrão
        turmaSelector.appendChild(allOption);

        series.forEach(serie => {
            const option = document.createElement('option');
            option.value = serie;
            option.text = serie;
            serieSelector.appendChild(option);
        });

        const filteredDataPorSerie = data.filter(item => item.turma === year);

        filterData();

        updateTurmaSelector();
       
        
    }

    // Função para preencher o turmaSelector dinamicamente com base no ano selecionado
    function updateTurmaSelector() {
        console.log('function updateTurmaSelector(year, seriesTurmas)');
        const year = parseInt(yearSelector.value, 10);
        console.log('data:', data)
        const filteredData = data.filter(item => new Date(item.data).getFullYear() === year);
        console.log('year:', year);
        console.log('filteredData:', filteredData)

        totalAlunosPorAno = [...new Set(filteredData.map(item => item.aluno))].length;
        console.log('totalAlunosPorAno:', totalAlunosPorAno);

         // Extraindo as turmas do array de objetos filtrados por ano
        const seriesTurmas = [...new Set(filteredData
            .filter(item => item.turma.includes(serieSelector.value))
            .map(item => item.turma)
        )];
        console.log('seriesTurmas:', seriesTurmas);
 
        turmas = [...new Set(seriesTurmas.map(item => item.split(' - ')[1]))].sort();
 
        console.log('Turmas:',turmas);

        // Preencher o turmaSelector com as opções de turmas e adicionar "Todas" no início
        turmaSelector.innerHTML = '';  // Limpar qualquer opção existente
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.text = 'TODAS';
        allOption.selected = true;  // Selecionar "Todas" como padrão
        turmaSelector.appendChild(allOption);
        
        if (serieSelector.value != 'all'){
            turmas.forEach(turma => {
                const option = document.createElement('option');
                option.value = turma;
                option.text = turma;
                turmaSelector.appendChild(option);
            });
        }

        filterData();
    }

    // Preencher o yearSelector com os anos disponíveis nos dados e definir o ano mais recente como padrão
    if (data.length > 0) {
        const years = data.map(item => new Date(item.data).getFullYear());
        const uniqueYears = [...new Set(years)];
        const maxYear = Math.max(...uniqueYears);
        
        // Preencher o yearSelector com as opções de anos
        yearSelector.innerHTML = '';
        uniqueYears.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.text = year;
            yearSelector.appendChild(option);
        });

        // Definir o ano mais recente como selecionado
        yearSelector.value = maxYear;
        
        // Chamar a função para preencher o turmaSelector com base no ano mais recente
        updateSerieSelector(maxYear);
    }

    // Adicionar um event listener ao yearSelector para atualizar o turmaSelector quando o ano for alterado
    yearSelector.addEventListener('change', function() {
        serieSelector.value = 'all';
        turmaSelector.value = 'all';
        updateSerieSelector();
    });

    serieSelector.addEventListener('change',function() {
        const selectedSerie = this.value;
        updateTurmaSelector(selectedSerie);
    });

    turmaSelector.addEventListener('change', filterData);

// Função para resetar os filtros ao clicar no botão "Limpar Filtros"
clearFiltersButton.addEventListener('click', function () {
    const years = data.map(item => new Date(item.data).getFullYear());
    const uniqueYears = [...new Set(years)];
    yearSelector.value = Math.max(...uniqueYears);
    Array.from(serieSelector.options).forEach(option => option.selected = option.value === 'all');
    Array.from(turmaSelector.options).forEach(option => option.selected = option.value === 'all');
    
    serieSelector.value = 'all';
    turmaSelector.value = 'all';
    
    updateSerieSelector();
});

    createTableHeader();
    selectMaxYear();
    filterData();
});
