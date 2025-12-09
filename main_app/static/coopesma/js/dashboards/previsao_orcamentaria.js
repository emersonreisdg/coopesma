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


    let currentSortColumn = '';
    let sortAscending = true;

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

    // Função para encontrar o maior ano nos dados
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
            const valA = a[key]?.toString().toLowerCase() || '';  
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
            if (item.item.toLowerCase() === 'mensalidade' || item.item.toLowerCase() === 'livros') {
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
        // Extrai todos os valores únicos de "tipo" do dataJson
        const tiposUnicos = [...new Set(dataJson.map(item => item.tipo))];
        
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






