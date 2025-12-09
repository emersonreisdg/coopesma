import { chartColors, chartFontSizes, chartPluginsConfig } from '../chartConfig.js';


document.addEventListener('DOMContentLoaded', function() {
    const dataJson = JSON.parse(document.getElementById('data-json').textContent);
    const dataHierarchyJson = JSON.parse(document.getElementById('dataHierarchy-json').textContent);
    const subtipoPorTipo = JSON.parse(document.getElementById("subtipoPorTipo-json").textContent);
    const categoriaPorSubtipo = JSON.parse(document.getElementById("categoriaPorSubtipo-json").textContent);
    const itemPorCategoria = JSON.parse(document.getElementById("itemPorCategoria-json").textContent);
    console.log('dataHierarchyJson:',dataHierarchyJson);
    console.log('itemPorCategoria:',itemPorCategoria);
 
    const tipoSelector = document.getElementById("tipoSelector");
    const subtipoSelector = document.getElementById("subtipoSelector");
    const categoriaSelector = document.getElementById("categoriaSelector");
    const clearFiltersButton = document.getElementById("clearFiltersButton");

    let comboTreeDateInstance = null;
    let comboTreeItemInstance = null;
    let chartInstance = null;  // Para armazenar a instância do gráfico

    // Função para formatar os dados no formato esperado pelo comboTree
    function formatDataHierarchy(data) {
        return Object.keys(data)
            .sort((a, b) => b - a)  // Ordena os anos em ordem decrescente
            .map(year => ({
                id: year,
                title: year,
                subs: Object.keys(data[year]).map(trimestre => ({
                    id: `${year}-${trimestre}`,
                    title: trimestre,
                    subs: data[year][trimestre].map(mes => ({
                        id: `${year}-${trimestre}-${mes}`,
                        title: mes
                    }))
                }))
            }));
    }

    function comboTreeDateBuilder() {
        if ($("#comboTreeInput").length > 0) {
            return comboTreeDateInstance = $("#comboTreeInput").comboTree({
                source: formatDataHierarchy(dataHierarchyJson),
                isMultiple: true,
                cascadeSelect: true,
                selected: [],
                collapse: true,
                selectAll: false
            });

        } else {
            console.error("Elemento #comboTreeInput não encontrado!");
            return null;
        }
    }

    comboTreeDateInstance = comboTreeDateBuilder();

    function comboTreeItemBuilder(data) {
        console.log(' function comboTreeItemBuilder(data)');
        let source = [];
    
        if (!Array.isArray(data)) {
            console.warn("comboTreeItemBuilder recebeu dados inválidos:", data);
        } else if (data.every(item => typeof item === 'string')) {
            source = data.map((item, index) => ({ id: index + 1, title: item }));
        } else {
            // Verifica o estado dos seletores
            const datasSelecionadas = $("#comboTreeInput").val();
            console.log('datasSelecionadas:',datasSelecionadas);

            if (datasSelecionadas.length > 0) {
                
                const tipoSelecionado = $("#tipoSelector").val();
                const subtipoSelecionado = $("#subtipoSelector").val();
                const categoriaSelecionada = $("#categoriaSelector").val();

                
                console.log('tipoSelecionado:',tipoSelecionado);
                console.log('subtipoSelecionado:',subtipoSelecionado);
                console.log('categoriaSelecionada:',categoriaSelecionada);
        
                let chave = 'plano_de_contas'; // valor padrão
                    
                if (tipoSelecionado === 'all' ) {
                    chave = 'tipo';
                } else if (tipoSelecionado !== 'all' && subtipoSelecionado === 'all')  {
                    chave = 'subtipo';
                }  else if (tipoSelecionado !== 'all' && subtipoSelecionado !== 'all' && categoriaSelecionada === 'all')  {
                    chave = 'categoria';
                }

                console.log('chave:',chave);
        
                let valoresUnicos = [...new Set(data.map(item => item[chave]))];

                // Verifica se há apenas 1 ou nenhum valor único e muda a chave
                if (valoresUnicos.length <= 1 && chave === 'categoria') {
                    console.log(`Subtipo sem subdivisão em categoria.`);
                    chave = 'plano_de_contas';
                    valoresUnicos = [...new Set(data.map(item => item[chave]))];
                }

                console.log('valoresUnicos:',valoresUnicos);
        
                source = valoresUnicos.map((valor, index) => ({
                    id: index + 1,
                    title: valor
                }));
            } else{
                source = [];
            }
        }
        
        // Eliminar itens vazios do array
        source = source.filter(item => item.title && item.title.trim() !== '');
        console.log('source:', source);
    
        // Cria o ComboTree
        if ($("#comboTreeItemInput").length > 0) {
            return $("#comboTreeItemInput").comboTree({
                source: source,
                isMultiple: true,
                cascadeSelect: true,
                selected: [],
                collapse: true,
                selectAll: false
            });
    
        } else {
            console.error("Elemento #comboTreeItemInput não encontrado!");
            return {
                getSelectedIds: () => [],
                getSelectedTitles: () => [],
                destroy: () => { }
            };
        }
    }

    // comboTreeItemInstance = comboTreeItemBuilder([]);
    
    function resetSelector(selector, defaultOption = "Todos") {
        selector.innerHTML = `<option value="all">${defaultOption}</option>`;
    }

    // Função para encontrar o maior ano nos dados
    function getMaxYear() {
        const years = dataJson.map(item => new Date(item.data).getUTCFullYear());
        return Math.max(...years); // Retorna o maior ano
    }

    function filterData() {
        console.log('function filterData()');
        let filteredData = dataJson;
        console.log('filteredData:', filteredData);

        let selectedDates = comboTreeDateInstance.getSelectedIds();
        console.log("selectedDates:", selectedDates); 


        if (selectedDates){
            // Mapeia os meses para números correspondentes
            const mesesMap = {
                "Janeiro": "01", "Fevereiro": "02", "Março": "03", "Abril": "04", "Maio": "05", "Junho": "06",
                "Julho": "07", "Agosto": "08", "Setembro": "09", "Outubro": "10", "Novembro": "11", "Dezembro": "12"
            };

            // Filtra apenas datas com meses e converte para "YYYY-MM"
            const dates = selectedDates
                .map(date => {
                    const parts = date.split("-");
                    const year = parts[0]; // Primeiro elemento é o ano
                    const monthName = parts[parts.length - 1]; // Último elemento pode ser um mês
                    
                    return mesesMap[monthName] ? `${year}-${mesesMap[monthName]}` : null;
                })
                .filter(date => date !== null); // Remove valores nulos

            console.log('dates:',dates);

            if (dates.length > 0){
                console.log('Aplicar filtro de ano e mes extraídos de selectedDates em filteredData');
                filteredData = filteredData.filter(item => {
                    const dataFormatada = item.data.substring(0, 7); // Extrai 'YYYY-MM'
                    return dates.includes(dataFormatada);
                });
                console.log('filteredData:', filteredData);
            }
        }
        else{
            console.log("Nenhuma data selecionada.");
        }
            
        const tipoSelecionado = tipoSelector.value;
        const subtipoSelecionado = subtipoSelector.value;
        const categoriaSelecionada = categoriaSelector.value;
        
        // Filtra pelo tipo (se houver um selecionado)
        if (tipoSelecionado !== 'all') {
            filteredData = filteredData.filter(item => item.tipo === tipoSelecionado);
            console.log("Filtragem por tipo.")
            console.log('filteredData:', filteredData);
        }

        // Filtra por subtipo (se houver um selecionado)
        if (subtipoSelecionado !== 'all') {
            filteredData = filteredData.filter(item => item.subtipo === subtipoSelecionado);
            console.log("Filtragem por subtipo.")
            console.log('filteredData:', filteredData);
        }

        // Filtra por categoria (se houver um selecionado)
        if (categoriaSelecionada !== 'all') {
            filteredData = filteredData.filter(item => item.categoria === categoriaSelecionada);
            console.log("Filtragem por categoria.")
            console.log('filteredData:', filteredData);
        }

        // Filtra por item (se houver um selecionado)
        if (comboTreeItemInstance){
            let selectedItens = comboTreeItemInstance.getSelectedNames();
            
            clearCanvas();
            if (selectedItens && selectedItens.length > 0){
                console.log("selectedDates:", selectedDates); 
                console.log("selectedItens:", selectedItens); 

                let chave;

                if (tipoSelecionado === 'all') {
                    chave = 'tipo';
                } else if (subtipoSelecionado === 'all') {
                    chave = 'subtipo';
                } else if (categoriaSelecionada === 'all') {
                    chave = 'categoria';
                } else {
                    chave = 'plano_de_contas';
                }
    
                console.log(`Aplicando filtro por ${chave} com selectedItens:`, selectedItens);

                filteredData = filteredData.filter(item => selectedItens.includes(item[chave]));
                console.log('filteredData após filtro por itens:', filteredData);

                console.log('Pronto para graficar os itens selecionados em função das datas selecionadas.');
                
                renderizarGraficosDeBarras(filteredData, selectedDates, selectedItens);
            }
        }
        
        return filteredData;
    }


    function detectarNivelHierarquico(selectedDates) {
        const niveis = selectedDates.map(date => date.split("-").length);
        const minNivel = Math.min(...niveis);
        console.log('niveis', niveis);
        console.log('minNivel', minNivel);

        const frequencias = { 1: 0, 2: 0, 3: 0 };

        niveis.forEach(valor => {
        if (frequencias[valor] !== undefined) {
            frequencias[valor]++;
        }
        });

        console.log('frequencias',frequencias);

        if (minNivel === 1) return 'ano';
        if (minNivel === 2) return 'trimestre';
        return 'mes';
    }

    function renderizarGraficosDeBarras(filteredData, selectedDates, selectedItens) {
        console.log('function renderizarGraficosDeBarras(filteredData, selectedDates, selectedItens)');

        console.log('filteredData:', filteredData);
        console.log('selectedDates:', selectedDates);
        console.log('selectedItens:', selectedItens);

        clearCanvas();
        const wrapper = document.getElementById('canvas-container-wrapper');
        wrapper.innerHTML = '';
    
        if (!filteredData.length || !selectedDates.length || !selectedItens.length) {
            console.log("Nenhum dado suficiente para renderizar os gráficos.");
            return;
        }
    
        const mesesMap = {
            "Janeiro": "01", "Fevereiro": "02", "Março": "03", "Abril": "04", "Maio": "05", "Junho": "06",
            "Julho": "07", "Agosto": "08", "Setembro": "09", "Outubro": "10", "Novembro": "11", "Dezembro": "12"
        };
    
        const nivel = detectarNivelHierarquico(selectedDates);
        console.log("Nível detectado:", nivel);
    
        let labelsSet = new Set();
        let dadosPorItem = {};
    
        // Inicializa os dados
        selectedItens.forEach(item => {
            dadosPorItem[item] = {};
        });
    
        // Preenche os dados agrupados
        filteredData.forEach(entry => {
            const dataObj = new Date(entry.data);
            const ano = dataObj.getUTCFullYear();
            const mes = dataObj.getUTCMonth(); // 0-indexado
            const nomeMes = Object.keys(mesesMap)[mes];
            const trimestre = `Trimestre ${Math.floor(mes / 3) + 1}`;
    
            let chaveAgrupamento;
            if (nivel === 'ano') {
                chaveAgrupamento = `${ano}`;
            } else if (nivel === 'trimestre') {
                chaveAgrupamento = `${ano}-${trimestre}`;
            } else {
                chaveAgrupamento = `${ano}-${trimestre}-${nomeMes}`;
            }
    
            labelsSet.add(chaveAgrupamento);
    
            selectedItens.forEach(item => {
                if (entry.plano_de_contas === item || entry.categoria === item || entry.subtipo === item || entry.tipo === item) {
                    if (!dadosPorItem[item][chaveAgrupamento]) {
                        dadosPorItem[item][chaveAgrupamento] = 0;
                    }
                    dadosPorItem[item][chaveAgrupamento] += parseFloat(entry.valor) || 0;
                }
            });
        });
    
        const labels = Array.from(labelsSet).sort();     

        // Cria um container com classe canvas-container e adiciona o canvas dentro dele
        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'canvas-container';
    
        // Cria o gráfico
        const canvas = document.createElement('canvas');
        canvasContainer.appendChild(canvas);

        wrapper.appendChild(canvasContainer);
        wrapper.style.display = 'flex'; // ou block, se preferir

        const datasets = Object.keys(dadosPorItem).map((item, index) => {
            const valores = labels.map(label => dadosPorItem[item][label] || 0);

            let bgColor = chartColors[index % chartColors.length];
            if (item === 'RECEITAS') {
                bgColor = 'rgba(54, 162, 235, 0.7)' // Azul
            } else if (item === 'DESPESAS') {
                bgColor = 'rgba(255, 99, 132, 0.7)' // Vermelho
            }
            return {
                label: item,
                data: valores,
                backgroundColor: bgColor
            };
        });

         // Mostra o wrapper apenas se houver dados para renderizar
        wrapper.style.display = 'block';
    
            
        const chartData = {
            labels: labels,
            datasets: datasets
        };

        // Destrói o gráfico, se existir
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }
    
        chartInstance = new Chart(canvas, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...chartPluginsConfig,
                    legend: {
                        display: true
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            font: {
                                size: chartFontSizes.ticks
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: chartFontSizes.ticks
                            }
                        }
                    }
                }
            }
        });
    }
    
    function populateTipoSelector() {
        resetSelector(tipoSelector, "Todos");
    
        const tiposDisponiveis = Object.keys(subtipoPorTipo); // Pega todas as chaves do objeto subtipoPorTipo
    
        if (tiposDisponiveis.length > 0) {
            tiposDisponiveis.forEach(tipo => {
                const option = document.createElement("option");
                option.value = tipo;
                option.textContent = tipo;
                tipoSelector.appendChild(option);
            });
        } else {
            console.warn("Nenhum tipo encontrado para preencher o seletor.");
        }
    }

    // Atualiza a lista de subtipo quando o tipo é alterado
    function updateSubtipoSelector(includeDefaultOption = true) {
        resetSelector(subtipoSelector, includeDefaultOption ? "Todos" : "");
    
        const tipoSelecionado = tipoSelector.value;
    
        if (tipoSelecionado && subtipoPorTipo[tipoSelecionado]) {
            subtipoPorTipo[tipoSelecionado].forEach(subtipo => {
                const option = document.createElement("option");
                option.value = subtipo;
                option.textContent = subtipo;
                subtipoSelector.appendChild(option);
            });

            console.log('subtipoPorTipo[tipoSelecionado]:',subtipoPorTipo[tipoSelecionado]);
        }
    }
    
     // Atualiza a lista de categoria quando o subtipo é alterado
    function updateCategoriaSelector(includeDefaultOption = true) {
        resetSelector(categoriaSelector, includeDefaultOption ? "Todas" : "");
      
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

    // Atualiza a lista de Itens quando o tipo é alterado
    function updateComboTreeItemInput() {
        console.log('function updateComboTreeItemInput()');
        console.log('comboTreeItemInstance()',comboTreeItemInstance);
        if (comboTreeItemInstance){
            console.log('DESTRUINDO comboTreeItemInstance');
            comboTreeItemInstance.destroy();
        }
    
        const tipoSelecionado = tipoSelector.value;
        const subtipoSelecionado = subtipoSelector.value;
        const categoriaSelecionada = categoriaSelector.value;

        console.log('tipoSelecionado:',tipoSelecionado);
        console.log('subtipoSelecionado:',subtipoSelecionado);
        console.log('categoriaSelecionada:',categoriaSelecionada);
        
        if (tipoSelecionado && tipoSelecionado !== 'all' && subtipoSelecionado  && subtipoSelecionado !== 'all' && categoriaSelecionada  && categoriaSelecionada !== 'all' && itemPorCategoria[tipoSelecionado][subtipoSelecionado][categoriaSelecionada]) {
            console.log('itemPorCategoria[tipoSelecionado][subtipoSelecionado][categoriaSelecionada]:',itemPorCategoria[tipoSelecionado][subtipoSelecionado][categoriaSelecionada]);
            comboTreeItemInstance = comboTreeItemBuilder(itemPorCategoria[tipoSelecionado][subtipoSelecionado][categoriaSelecionada]);
        }
        else if (tipoSelecionado && tipoSelecionado !== 'all' && subtipoSelecionado  && subtipoSelecionado !== 'all' && categoriaPorSubtipo[tipoSelecionado][subtipoSelecionado]) {
            console.log('categoriaPorSubtipo[tipoSelecionado][subtipoSelecionado]:',categoriaPorSubtipo[tipoSelecionado][subtipoSelecionado]);
            comboTreeItemInstance = comboTreeItemBuilder(categoriaPorSubtipo[tipoSelecionado][subtipoSelecionado]);
        }
        else if (tipoSelecionado && tipoSelecionado !== 'all' && subtipoPorTipo[tipoSelecionado]) {
            console.log('subtipoPorTipo[tipoSelecionado]:',subtipoPorTipo[tipoSelecionado]);
            comboTreeItemInstance = comboTreeItemBuilder(subtipoPorTipo[tipoSelecionado]);
        }
        else{
            console.log('plano_de_contas');

            let filteredData = dataJson;
            let chave = 'plano_de_contas';
            
            if (subtipoSelecionado === 'all') {
                filteredData = filteredData.filter(item => item.tipo === tipoSelecionado);
               
            } else if (categoriaSelecionada === 'all') {
                filteredData = filteredData.filter(item => item.tipo === tipoSelecionado && item.subtipo === subtipoSelecionado);

            }
            const plano_de_contas = filteredData.map(item => item.plano_de_contas);

            console.log('plano_de_contas:',plano_de_contas);

            comboTreeItemInstance = comboTreeItemBuilder(plano_de_contas);
        }
        
    }
  
    // Função para limpar os filtros sem enviar requisição
    function clearFilters() {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Todos";
        tipoSelector.value = "all"; 

        console.log("Limpar filtros");

        if (comboTreeDateInstance) {
            console.log("Limpar comboTree");
            comboTreeDateInstance.destroy();
            comboTreeDateInstance = comboTreeDateBuilder();
        }

        // Limpa completamente o seletor de subtipo (sem opções)
        subtipoSelector.innerHTML = '';

        // Limpa completamente o seletor de categoria (sem opções)
        categoriaSelector.innerHTML = '';

        if (comboTreeItemInstance) {
            console.log("Limpar comboTree");
            comboTreeItemInstance.destroy();
            comboTreeItemInstance = comboTreeItemBuilder();
        }

        // updateMesSelector();
        updateSubtipoSelector(false); // Não adiciona a opção padrão
        updateCategoriaSelector(false); // Não adiciona a opção padrão

        // Destrói o gráfico, se existir
        clearCanvas();

        // Se você tiver uma função para atualizar os dados com base nos filtros:
        filterData(); // Reaplica a filtragem sem enviar requisição
    }

    function clearCanvas(){
        // Destrói o gráfico, se existir
        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }

        // Limpa o DOM do canvas
        const wrapper = document.getElementById('canvas-container-wrapper');
        wrapper.innerHTML = '';

        // Oculta o container
         wrapper.style.display = 'none';
    }
    
   
    // Adiciona eventos de mudança
    $("#comboTreeInput").on("change", function () {
        const selected = comboTreeDateInstance?.getSelectedIds() || [];
        const filteredData = filterData();

        if (selected.length > 0) {
            console.log("Há datas selecionadas. Executando populateTipoSelector...");
            populateTipoSelector();
        } else {
            console.log("Nenhuma data selecionada. Executando resetSelector...");
            resetSelector(tipoSelector, "Todos");
        }
        
        console.log("Dados filtrados", filteredData);
        if (comboTreeItemInstance){
            comboTreeItemInstance.destroy();
        }
        comboTreeItemInstance = comboTreeItemBuilder(filteredData);
    });

    let manualChange = true;
    
    tipoSelector.addEventListener("change", function () {
        console.log('tipoSelector.addEventListener("change", function ()');
        manualChange = false;
        updateSubtipoSelector();
        updateCategoriaSelector();
        updateComboTreeItemInput();
        const filteredData = filterData();
        console.log("Dados filtrados", filteredData);
    });

    subtipoSelector.addEventListener("change",  function () {
        console.log('subtipoSelector.addEventListener("change",  function ()');
        manualChange = false;
        updateCategoriaSelector();
        updateComboTreeItemInput();
        const filteredData = filterData();
        console.log("Dados filtrados", filteredData);
    });

    categoriaSelector.addEventListener("change",  function () {
        console.log('categoriaSelector.addEventListener("change",  function () ');
        manualChange = false;
        updateComboTreeItemInput();
        const filteredData = filterData();
        console.log("Dados filtrados", filteredData);
    });

    $("#comboTreeItemInput").on("change", function () {
        console.log('$("#comboTreeItemInput").on("change", function ()');
        if (manualChange){
            console.log('Mudança manual');
            filterData();
        }
        else{
            manualChange = true;
            clearCanvas();
            console.log('Mudança por script');
        }
    });
    
    // Associar a função ao clique no botão
    clearFiltersButton.addEventListener("click", clearFilters);

});