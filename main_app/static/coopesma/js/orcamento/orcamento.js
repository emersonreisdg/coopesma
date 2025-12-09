import {  chartColors, chartFontSizes, chartPluginsConfig } from '../chartConfig.js';

// Chart.register(ChartDataLabels);

document.addEventListener('DOMContentLoaded', function () {
    // console.log(document.getElementById('data_previsao-json').textContent);
    // console.log(document.getElementById('data_despesa_receita-json').textContent);

    const dataPrevisaoJson = JSON.parse(document.getElementById('data_previsao-json').textContent);
    const dataDespesaReceitaJson = JSON.parse(document.getElementById('data_despesa_receita-json').textContent);
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
    const saldoContainer = document.getElementById('saldoCard');

    console.log('dataPrevisaoJson',dataPrevisaoJson);
    console.log('dataDespesaReceitaJson',dataDespesaReceitaJson);

    let currentSortColumn = '';
    let sortAscending = true;

    const headers = [
        'Mês', 'Tipo', 'Subtipo', 'Categoria', 
        'Item', 'Valor', 'Entrada/Saída', '% Entrada/Saída'
    ];

    const alignmentMap = {
        'Mês': 'center',
        'Tipo': 'center',
        'Subtipo': 'center',
        'Categoria': 'center',
        'Item': 'left',
        'Valor': 'center',
        'Entrada/Saída': 'center',
        '% Entrada/Saída': 'center'
    };


    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Função para encontrar o maior ano nos dados
    function getMaxYear() {
        const years = dataPrevisaoJson.map(item => new Date(item.data).getUTCFullYear());
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

        const sortedData = [...dataPrevisaoJson].sort((a, b) => {
            const valA = a[key]?.toString().toLowerCase() || '';  
            const valB = b[key]?.toString().toLowerCase() || '';

            if (valA < valB) return sortAscending ? -1 : 1;
            if (valA > valB) return sortAscending ? 1 : -1;
            return 0;
        });

        populateTable(sortedData);
    }

    // Função para calcular distância de Levenshtein (medida de diferença entre strings)
    function levenshteinDistance(a, b) {
        const matrix = [];
        let i, j;

        // Inicializa a matriz
        for (i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        // Preenche a matriz
        for (i = 1; i <= b.length; i++) {
            for (j = 1; j <= a.length; j++) {
                if (b.charAt(i-1) === a.charAt(j-1)) {
                    matrix[i][j] = matrix[i-1][j-1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i-1][j-1] + 1, // Substituição
                        matrix[i][j-1] + 1,    // Inserção
                        matrix[i-1][j] + 1     // Deleção
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }

    // Função para normalizar strings antes da comparação
    function normalizarString(str) {
        return str
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
            .replace(/[^A-Z0-9]/g, ' ')       // Remove caracteres especiais
            .replace(/\s+/g, ' ')             // Espaços múltiplos para único
            .trim();
    }
    
    function populateTable(filteredData) {
        tbody.innerHTML = '';

        // Remover categorias indesejadas
        filteredData = filteredData.filter(item =>
            item.categoria !== "Reversão Contábil" &&
            item.categoria !== "Despesas Financeiras"
        );

        // Agrupar e somar "Encargos e Salário" por ano e mês
        const agrupados = {};
        const outrosItens = [];

        filteredData.forEach(item => {
            const date = new Date(item.data);
            const ano = date.getUTCFullYear();
            const mes = date.getUTCMonth() + 1;
            const chave = `${ano}-${mes}`;

            if (item.categoria === "Encargos e Salários") {
                if (!agrupados[chave]) {
                    agrupados[chave] = {
                        tipo: item.tipo,
                        categoria: "Encargos e Salários",
                        subtipo: "Custo com Pessoal",
                        item: "Custo com Pessoal",
                        valor: 0,
                        data: item.data
                    };
                }
                agrupados[chave].valor += parseFloat(item.valor) || 0;
            } else {
                outrosItens.push(item);
            }
        });

        // Transformar agrupados em array e adicionar aos itens
        const itensAgrupados = Object.entries(agrupados).map(([_, item]) => {
            return {
                tipo: item.tipo,
                categoria: item.categoria,
                subtipo: item.subtipo,
                item: item.item,
                valor: item.valor,
                data: item.data
            };
        });

        const dadosFinais = [...outrosItens, ...itensAgrupados].filter(item => item.tipo && item.tipo.trim() !== '');

        // Ordenar por mês (crescente), tipo (decrescente), subtipo (priorizar "Custo com Pessoal")
        dadosFinais.sort((a, b) => {
            const dataA = new Date(a.data);
            const dataB = new Date(b.data);

            const mesA = dataA.getUTCMonth();
            const mesB = dataB.getUTCMonth();
            if (mesA !== mesB) return mesA - mesB;

            const tipoA = (a.tipo || '').toLowerCase();
            const tipoB = (b.tipo || '').toLowerCase();
            if (tipoA !== tipoB) return tipoB.localeCompare(tipoA); // tipo decrescente

            const isCustoA = a.subtipo === 'Custo com Pessoal' ? 0 : 1;
            const isCustoB = b.subtipo === 'Custo com Pessoal' ? 0 : 1;
            return isCustoA - isCustoB; // subtipo: Custo com Pessoal vem primeiro
        });

        dadosFinais.forEach(item => {
            const row = document.createElement('tr');

            const itemDate = new Date(item.data);
            const itemAno = itemDate.getUTCFullYear();
            const itemMes = itemDate.getUTCMonth() + 1;

            // Fuzzy matching para entrada/saída
            let bestMatch = null;
            let bestScore = Infinity;
            const normalizedItem = normalizarString(item.item || '');

            dataDespesaReceitaJson.forEach(dr => {
                const drDate = new Date(dr.data);
                const drAno = drDate.getUTCFullYear();
                const drMes = drDate.getUTCMonth() + 1;

                if (drAno === itemAno && drMes === itemMes) {
                    const normalizedPlano = normalizarString(dr.plano_de_contas);
                    const distance = levenshteinDistance(normalizedItem, normalizedPlano);
                    if (distance < bestScore) {
                        bestScore = distance;
                        bestMatch = dr;
                    }
                }
            });


            if (item.subtipo === 'Custo com Pessoal') {
                const normalizar = (str) => (str || '')
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');

                const subtiposAlvo = ['ordenados e salarios', 'beneficios', 'encargos trabalhistas'];

                const soma = dataDespesaReceitaJson.reduce((acc, dr) => {
                    const drDate = new Date(dr.data);
                    const drAno = drDate.getUTCFullYear();
                    const drMes = drDate.getUTCMonth() + 1;

                    const subtipo = normalizar(dr.subtipo);

                    if (drAno === itemAno && drMes === itemMes && subtiposAlvo.includes(subtipo)) {
                        acc += parseFloat(dr.valor) || 0;
                        console.log('subtipo:',subtipo);
                        console.log('itemAno:',itemAno);
                        console.log('itemMes:',itemMes);
                        console.log('acc:',acc);
                    }

                    return acc;
                }, 0);

                item.entrada_saida = soma;
            } else {
                const threshold = 3;
                if (bestMatch && bestScore <= threshold) {
                    item.entrada_saida = parseFloat(bestMatch.valor) || 0;
                } else {
                    item.entrada_saida = 0;
                }
            }


            if (item.entrada_saida !== undefined) {
                const valorNumerico = parseFloat(item.valor) || 1;
                const percentual = (item.entrada_saida / valorNumerico) * 100;
                item.percentual_entrada_saida = percentual.toFixed(2) + '%';
            }

            headers.forEach((header, index) => {
                const cell = document.createElement('td');
                const normalizedHeader = header
                    .toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s/g, '_')
                    .replace(/%/g, 'percentual')
                    .replace(/\//g, '_');

                let value;

                if (normalizedHeader === 'valor') {
                    value = new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    }).format(parseFloat(item.valor) || 0);
                } else if (normalizedHeader === 'mes') {
                    const date = new Date(item.data);
                    value = capitalize(date.toLocaleString('pt-BR', { month: 'long' }));
                } else if (normalizedHeader === 'entrada_saida') {
                    value = new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    }).format(parseFloat(item.entrada_saida) || 0);
                } else if (normalizedHeader === 'percentual_entrada_saida') {
                    const entradaSaida = parseFloat(item.entrada_saida) || 0;
                    const valor = parseFloat(item.valor) || 1;
                    value = (entradaSaida / valor * 100).toFixed(2) + '%';
                } else {
                    value = item[normalizedHeader] || '';
                }

                cell.textContent = value;
                cell.style.textAlign = alignmentMap[header];

                const manualEdition = false;

                if (manualEdition === true && header === 'Entrada/Saída') {
                    cell.setAttribute('contenteditable', 'true');

                    cell.addEventListener('input', (e) => {
                        cell.textContent = e.target.textContent.replace(/[^0-9,.-]/g, '');
                    });

                    cell.addEventListener('blur', () => {
                        const numericValue = parseFloat(cell.textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
                        item.entrada_saida = numericValue;
                        cell.textContent = new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                        }).format(numericValue);

                        const percentIndex = headers.findIndex(h => h === '% Entrada/Saída');
                        if (percentIndex !== -1) {
                            const valor = parseFloat(item.valor) || 1;
                            const percentual = (numericValue / valor * 100).toFixed(2) + '%';
                            row.cells[percentIndex].textContent = percentual;
                        }
                        filterData();
                    });

                    cell.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            cell.blur();
                        }
                    });
                }

                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });
    }

    // Adiciona um objeto para armazenar as instâncias dos gráficos
    const chartInstances = {
        combinedChart: null,
        saldoCard: null
    };

    // Função para criar os gráficos modificados
    function createCharts(filteredData) {
        // Separa receitas e despesas
        const receitas = filteredData.filter(item => item.tipo?.toLowerCase() === 'receita');
        const despesas = filteredData.filter(item => item.tipo?.toLowerCase() === 'despesa');

        // Calcula totais
        const totalReceita = receitas.reduce((sum, item) => sum + (parseFloat(item.valor) || 0), 0);

        const totalEntradaReceita = receitas.reduce((sum, item) => sum + (parseFloat(item.entrada_saida) || 0), 0);
        
        const totalDespesa = despesas.reduce((sum, item) => sum + (parseFloat(item.valor) || 0), 0);
        const totalSaidaDespesa = despesas.reduce((sum, item) => sum + (parseFloat(item.entrada_saida) || 0), 0);

        // Cria ou atualiza o gráfico combinado
        updateCombinedChart(totalReceita, totalEntradaReceita, totalDespesa, totalSaidaDespesa);
        
        // Cria ou atualiza o card de saldo
        updateSaldoCard(totalEntradaReceita, totalSaidaDespesa);
    }

    function updateCombinedChart(totalReceita, totalEntradaReceita, totalDespesa, totalSaidaDespesa) {
        const canvas = document.getElementById('combinedChart');
        const container = canvas.closest('.chart-container');

        if (!canvas) {
            console.error("Canvas element with ID 'combinedChart' not found");
            return;
        }

        if (chartInstances.combinedChart) {
            chartInstances.combinedChart.destroy();
            chartInstances.combinedChart = null;
        }

        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);

        try {
            chartInstances.combinedChart = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: ['Receita', 'Despesa'],
                    datasets: [
                        {
                            label: 'Entrada/Saída',
                            data: [totalEntradaReceita, totalSaidaDespesa],
                            backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)'],
                            borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                            borderWidth: 1,
                            stack: 'Stack 0'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        ...chartPluginsConfig,
                        legend: {
                            display: false
                        },
                        title: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    let label = context.dataset.label || '';
                                    if (label) label += ': ';
                                    if (context.parsed.y !== null) {
                                        label += formatCurrency(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        },
                         datalabels: {
                            color: '#fff',
                            anchor: 'center',
                            align: 'center',
                            font: {
                                weight: 'bold'
                            },
                            formatter: function (value) {
                                return formatCurrency(value);
                            }
                        },
                        annotation: {
                            annotations: {
                                linhaReceita: {
                                    type: 'line',
                                    yMin: totalReceita,
                                    yMax: totalReceita,
                                    xMin: -0.45,
                                    xMax: 0.45,
                                    borderColor: 'rgba(54, 162, 235, 1)',
                                    borderWidth: 2,
                                    borderDash: [6, 6],
                                    label: {
                                        content: 'Limite Receita',
                                        enabled: true,
                                        position: 'end',
                                        backgroundColor: 'rgba(54, 162, 235, 0.8)',
                                        color: '#fff'
                                    }
                                },
                                linhaDespesa: {
                                    type: 'line',
                                    yMin: totalDespesa,
                                    yMax: totalDespesa,
                                    xMin: 0.55,
                                    xMax: 1.45,
                                    borderColor: 'rgba(255, 99, 132, 1)',
                                    borderWidth: 2,
                                    borderDash: [6, 6],
                                    label: {
                                        content: 'Limite Despesa',
                                        enabled: true,
                                        position: 'end',
                                        backgroundColor: 'rgba(255, 99, 132, 0.8)',
                                        color: '#fff'
                                    }
                                }
                            }
                        },
                    },
                    scales: {
                        x: {
                            stacked: true,
                            grid: {
                                display: false // Oculta grid do eixo X
                            }
                        },
                        y: {
                            beginAtZero: true,
                            stacked: false,
                            ticks: {
                                callback: function (value) {
                                    return formatCurrency(value);
                                }
                            },
                            grid: {
                                display: false // Oculta grid do eixo Y
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating combined chart:', error);
        }
    }


    function updateSaldoCard(totalEntradaReceita, totalSaidaDespesa) {
        if (!saldoContainer) {
            console.error("Elemento 'saldoCard' não encontrado");
            return;
        }

        if (isNaN(totalEntradaReceita) || isNaN(totalSaidaDespesa)) {
            console.error('Valores inválidos para cálculo do saldo:', {
                totalEntradaReceita,
                totalSaidaDespesa
            });
            return;
        }
        
        const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);

        const saldo = totalEntradaReceita - totalSaidaDespesa;
        const isPositive = saldo >= 0;
        const percentual = totalEntradaReceita > 0 ? 
            (Math.abs(saldo) / totalEntradaReceita )* 100 : 0;

        saldoContainer.innerHTML = `
            <div class="saldo-card ${isPositive ? 'positive' : 'negative'}">
                <h3>Saldo ${isPositive ? 'Positivo' : 'Negativo'}</h3>
                <div class="saldo-value">
                    ${isPositive ? '↑' : '↓'} ${formatCurrency(Math.abs(saldo))}
                </div>
                <div class="saldo-details">
                    <div><span class="label">Receitas:</span> ${formatCurrency(totalEntradaReceita)}</div>
                    <div><span class="label">Despesas:</span> ${formatCurrency(totalSaidaDespesa)}</div>
                    ${totalEntradaReceita > 0 ? 
                        `<div class="saldo-percentual">${percentual.toFixed(2)}% ${isPositive ? 'sobre receitas' : 'de deficit'}</div>` : 
                        ''}
                </div>
            </div>
        `;
    }

    // Função para ajustar gráficos ao container
    function resizeCharts() {
        Object.keys(chartInstances).forEach(chartId => {
            if (chartInstances[chartId]) {
                const canvas = document.getElementById(chartId);
                if (canvas) {
                    // Atualiza dimensões do canvas
                    canvas.width = canvas.offsetWidth;
                    canvas.height = canvas.offsetHeight;
                    // Redesenha o gráfico
                    chartInstances[chartId].resize();
                    chartInstances[chartId].update();
                }
            }
        });
    }

    // Adiciona listener para redimensionamento da janela
    window.addEventListener('resize', () => {
        resizeCharts();
    });

    // Chama a função inicialmente
    window.addEventListener('load', () => {
        resizeCharts();
    });

    function filterData() {
        const selectedYear = yearSelector.value;
        const selectedMonth = mesSelector.value;
        const tipoSelecionado = tipoSelector.value;
        const subtipoSelecionado = subtipoSelector.value;
        const categoriaSelecionada = categoriaSelector.value;
        const itemSelecionado = itemSelector.value;
        const searchQuery = searchInput.value.toLowerCase();
        let filteredData = dataPrevisaoJson;

        if (selectedYear !== 'all') {
            filteredData = filteredData.filter(item => {
                const itemYear = new Date(item.data).getUTCFullYear();
                return itemYear === parseInt(selectedYear);
            });
        }
       

        // Filtra pelo mês (se houver um selecionado)
        if (selectedMonth !== '') {
            filteredData = filteredData.filter(item => {
                const itemMonth = new Date(item.data).getMonth() + 1; // getMonth retorna 0 para Janeiro, então somamos 1
                return itemMonth === parseInt(selectedMonth);
            });
        }

        // Filtra pelo tipo (se houver um selecionado)
        if (tipoSelecionado !== 'all') {
            filteredData = filteredData.filter(item => item.tipo === tipoSelecionado);
        }

        // Filtra por subtipo (se houver um selecionado)
        if (subtipoSelecionado !== 'all') {
            filteredData = filteredData.filter(item => item.subtipo === subtipoSelecionado);
        }

        // Filtra por categoria (se houver um selecionado)
        if (categoriaSelecionada !== 'all') {
            filteredData = filteredData.filter(item => item.categoria === categoriaSelecionada);
        }

        // Filtra por item (se houver um selecionado)
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
        createCharts(filteredData); 

        //updateTotalDespesa(filteredData); //Excluir após depuração.
    }

    // Atualiza a lista de meses no seletor de meses de acordo com os dados filtrados
    function updateMesSelector(filteredData) {
        // Salva o mês atualmente selecionado antes de atualizar as opções
        const selectedMonth = mesSelector.value;
    
        // Limpa as opções do seletor e adiciona a opção "Todos"
        mesSelector.innerHTML = '<option value="">Todos</option>'; 
    
        const selectedYear = yearSelector.value;
    
        // Verifica se o ano selecionado tem meses disponíveis na variável monthsByYear
        if (selectedYear && monthsByYear[selectedYear]) {
            monthsByYear[selectedYear].forEach(mes => {
                const option = document.createElement("option");
                option.value = String(mes).padStart(2, '0'); 
                option.textContent = new Date(0, mes - 1).toLocaleString('pt-BR', { month: 'long' });
                option.textContent = capitalize(new Date(0, mes - 1).toLocaleString('pt-BR', { month: 'long' }));
                mesSelector.appendChild(option);
            });
        }
    
        // Restaura a seleção do mês previamente selecionado, se ele ainda estiver disponível
        if (selectedMonth) {
            mesSelector.value = selectedMonth;
        }
    }
    
    // Atualiza a lista de subtipo quando o tipo é alterado
    function updateSubtipoSelector() {
        const tipoSelecionado = tipoSelector.value;
    
        subtipoSelector.innerHTML = '<option value="all">Todos</option>';
        if (tipoSelecionado && subtipoPorTipo[tipoSelecionado]) {
            subtipoPorTipo[tipoSelecionado].forEach(subtipo => {
                const option = document.createElement("option");
                option.value = subtipo;
                option.textContent = subtipo;
                subtipoSelector.appendChild(option);
                console.log('Subtipo adicionado:', subtipo);
            });
        }
    }

    // Atualiza a lista de categoria quando o subtipo é alterado
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
                console.log('Categoria adicionada:', categoria);
            });
        }
    }

    // Atualiza a lista de item quando a categoria é alterada
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
                console.log('Item adicionado:', item);
            });
        }
    }

     // Função para limpar os filtros sem enviar requisição
     function clearFilters() {
        yearSelector.value = getMaxYear();
        mesSelector.innerHTML = '<option value="">Todos</option>'; 
        tipoSelector.value = "all"; 
        subtipoSelector.innerHTML = '<option value="all">Todas</option>'; 
        categoriaSelector.innerHTML = '<option value="all">Todas</option>'; 
        itemSelector.innerHTML = '<option value="all">Todos</option>'; 
        searchInput.value = "";
        
        // Se você tiver uma função para atualizar os dados com base nos filtros:
        filterData(); // Reaplica a filtragem sem enviar requisição
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
            if (item.item.toUpperCase() === 'MENSALIDADE') {
                return sum + (parseFloat(item.valor) || 0);
            }
            return sum;
        }, 0);
        const deficit = totalDespesaNum - totalReceitaNum;
        // const deficit = -totalDespesaNum;

        const percentualReajusteRateio = deficit > 0 
        ? (((totalDespesaNum - totalReceitaNum) / totalRateio) * 100).toFixed(1).replace('.', ',') + '%' 
        : '0,0%';
    
    
        console.log('totalDespesaNum:', totalDespesaNum);
        console.log('totalReceitaNum:', totalReceitaNum);
        console.log('totalRateio:', totalRateio);
        console.log('deficit:', deficit);
        console.log('percentualReajusteRateio:', percentualReajusteRateio);
    
        // Atualiza o valor do deficit
        document.getElementById('absolute-reajuste-rateio').textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deficit);
    
        // Seleciona o container onde o percentual será exibido
        const percentageElement = document.getElementById('percentage-reajuste-rateio');
        
        // Remove qualquer triângulo existente antes de adicionar o novo
        percentageElement.innerHTML = '';

        // Define a cor do texto com base no valor do deficit
        percentageElement.style.color = deficit > 0 ? 'red' : 'blue';
    
        // Cria o triângulo ascendente
        const triangle = document.createElement('span');
        triangle.classList.add('triangle', 'up');
    
        // Cria o nó de texto com o valor percentual
        const percentageText = document.createTextNode(percentualReajusteRateio);

        if (deficit>0){
            // Insere o icone e o percentual no elemento
            percentageElement.appendChild(triangle);
        }
        percentageElement.appendChild(percentageText);
    }
    
    

    function populateTipoSelector() {
        // Extrai todos os valores únicos de "tipo" do dataPrevisaoJson
        const tiposUnicos = [...new Set(dataPrevisaoJson.map(item => item.tipo))];
        
        // Limpa as opções anteriores e adiciona a opção padrão "Todos"
        tipoSelector.innerHTML = '<option value="all">Todos</option>';
        
        // Popula o selector com os tipos únicos
        tiposUnicos.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo;
            option.textContent = tipo;
            tipoSelector.appendChild(option);
        });
    }

    function updatePercentageColumn(row, entradaSaida, valor) {
        const percentualCell = row.cells[headers.indexOf('% Entrada/Saída')];
        if (valor !== 0) {
            const percentual = (entradaSaida / valor) * 100;
            percentualCell.textContent = percentual.toFixed(2).replace('.', ',') + '%';
        } else {
            percentualCell.textContent = '0,0%';
        }
    }

    // Chama a função para preencher o seletor de tipo
    populateTipoSelector();

    // Defina o maior ano como o valor inicial do yearSelector
    yearSelector.value = getMaxYear();

    // Adiciona eventos para filtrar
    yearSelector.addEventListener('change', () => {
        mesSelector.value = '';  // Atualiza para "Todos" ao mudar o ano
        updateMesSelector(yearSelector.value);
        filterData();
    });
    mesSelector.addEventListener('change', filterData);
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Impede o comportamento padrão de envio
        }
        filterData();
    });

    tipoSelector.addEventListener("change", function () {
        // const tipoSelecionado = tipoSelector.value;
    
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

    // Associar a função ao clique no botão
    clearFiltersButton.addEventListener("click", clearFilters);

    createTableHeader();
    filterData();
});











