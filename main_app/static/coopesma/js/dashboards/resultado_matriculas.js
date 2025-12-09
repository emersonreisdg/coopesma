import { chartColors, chartFontSizes, chartPluginsConfig } from '../chartConfig.js';

document.addEventListener('DOMContentLoaded', function() {
    Chart.defaults.animation.duration = 0; // Desativa animações globalmente
    const charts = {}; // Objeto para armazenar instâncias dos gráficos
    const yearSelector = document.getElementById('year_selector');
    const serieSelector = document.getElementById('serie_selector');
    const canvasContainerWrapper = document.getElementById('canvas-container-wrapper');
    const dataElement = document.getElementById('data-json');

    if (!yearSelector || !serieSelector || !canvasContainerWrapper || !dataElement) {
        console.error('Elemento necessário não encontrado.');
        return;
    }

    const data = JSON.parse(dataElement.textContent || dataElement.innerText);
    const canvasIds = ['myChart1', 'myChart2', 'myChart3', 'myChart4', 'myChart5'];

    // Função para encontrar o maior ano nos dados
    function getMaxYear() {
        const years = data.map(item => new Date(item.data).getFullYear());
        return Math.max(...years); // Retorna o maior ano
    }

    // Função para criar os elementos canvas dinamicamente
    function createCanvasElements() {
        canvasIds.forEach(id => {
            const div = document.createElement('div');
            div.className = 'canvas-container';
            const canvas = document.createElement('canvas');
            canvas.id = id;
            // Usar style.width/height em vez de atributos width/height
            canvas.style.width = '800px';
            canvas.style.height = '400px';
            // Definir atributos width/height para a resolução correta
            canvas.width = 800 * window.devicePixelRatio;
            canvas.height = 400 * window.devicePixelRatio;
            div.appendChild(canvas);
            canvasContainerWrapper.appendChild(div);
        });
    }


    createCanvasElements();

    let series = [];
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
        

        // Preenchendo o `serieSelector` com séries e a opção "Todas"
        series = [...new Set(data.map(item => item.serie))];
        serieSelector.innerHTML = '<option value="all" selected>Todas</option>';
        series.forEach(serie => {
            const option = document.createElement('option');
            option.value = serie;
            option.text = serie;
            serieSelector.appendChild(option);
        });
    }

    yearSelector.addEventListener('change', updateChart);
    serieSelector.addEventListener('change', handleSerieChange);

    function handleSerieChange() {
        const selectedOptions = Array.from(serieSelector.selectedOptions).map(option => option.value);
        if (selectedOptions.includes('all')) {
            Array.from(serieSelector.options).forEach(option => {
                if (option.value !== 'all') option.selected = false;
            });
        } else {
            serieSelector.querySelector('option[value="all"]').selected = false;
        }
        updateChart();
    }

    function updateChart() {
        const selectedYear = parseInt(yearSelector.value);
        const selectedSeries = Array.from(serieSelector.selectedOptions).map(option => option.value);
        const filteredData = data.filter(item => {
            const year = new Date(item.data).getFullYear();
            return year + 1 === selectedYear && (selectedSeries.includes('all') || selectedSeries.includes(item.serie));
        });
    
        // Atualiza os valores exibidos
        updateValues(filteredData);
    
        // Dados para os gráficos
        const ociosasOferta = getOciosasPorSerie(filteredData, 'vagas_ociosas');
        const ociosasIdeal = getOciosasPorSerie(filteredData, 'saldo_oocupacao_ideal');
        const ociosasLotacao = getOciosasPorSerie(filteredData, 'saldo_ocupacao_maxima');
        const alunos = getOciosasPorSerie(filteredData, 'alunos');
        const capacidadeIdeal = getOciosasPorSerie(filteredData, 'capacidade_ideal_alunos');
        const capacidadeMaxima = getOciosasPorSerie(filteredData, 'capacidade_maxima_alunos');
    
        // Atualiza os gráficos de barras
        updateCanvas('myChart1', series, ociosasIdeal, 'Ocupação Ideal: Vagas Ociosas', chartColors.lightSecondaryColor1, chartColors.darkSecondaryColor1);
        updateCanvas('myChart2', series, ociosasOferta, 'Vagas Ofertadas Não Preenchidas', chartColors.lightPrimaryColor1, chartColors.darkPrimaryColor1);
        updateCanvas('myChart3', series, ociosasLotacao, 'Lotação: Vagas Ociosas', chartColors.lightAccentColor2, chartColors.darkAccentColor2);
    
        // Atualiza o gráfico de área
        updateAreaChart('myChart4', series, alunos, capacidadeIdeal, capacidadeMaxima, 'Ocupação de Vagas');
       
         // Atualiza os gráficos de barras horizontais
         updateHorizontalBarChartWithMultipleLimits('myChart5', series, alunos, capacidadeIdeal, capacidadeMaxima, 'Ocupação de Vagas');
        //  updateHorizontalBarChartWithMultipleLimits('myChart6', series, alunos, capacidadeMaxima, 'Ocupação Máxima de Vagas'); 
    }    
   
    function updateAreaChart(id, labels, data1, data2, data3, title) {
        const canvas = document.getElementById(id);
        if (!canvas) return;

        if (charts[id]) {
            // Atualiza os dados e configurações do gráfico existente
            charts[id].data.labels = labels;
            charts[id].data.datasets[0].data = data1;
            charts[id].data.datasets[1].data = data2;
            charts[id].data.datasets[2].data = data3;
            charts[id].options.plugins.title.text = title;
            charts[id].update();
            return;
        }

        const ctx = canvas.getContext('2d');

        charts[id] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alunos Matriculados',
                        data: data1,
                        backgroundColor: chartColors.lightPrimaryColor1,
                        borderColor: chartColors.darkPrimaryColor1,
                        fill: true
                    },
                    {
                        label: 'Ideal',
                        data: data2,
                        backgroundColor: chartColors.lightHighlightColor2,
                        borderColor: chartColors.darkHighlightColor2,
                        fill: true
                    },
                    {
                        label: 'Lotação',
                        data: data3,
                        backgroundColor: chartColors.lightAccentColor2,
                        borderColor: chartColors.darkAccentColor2,
                        fill: true
                    }
                ]
            },
            options: {
                plugins: {
                    legend: { 
                        display: true,
                        font: {size: chartFontSizes.legend},
                        labels: {
                            boxWidth: 20,     // ajuste para a largura da caixa da legenda
                            boxHeight: 12     // ajuste para a altura da caixa da legenda (experimente 12, 14, 16...)
                        }
                    },
                    title: {
                        display: true,
                        text: title,
                        font: { size: chartFontSizes.title }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        grid: { display: false },
                        ticks: {
                            font: {
                                size: chartFontSizes.axis
                            }
                        },
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: {
                                size: chartFontSizes.axis
                            }
                        },
                    }
                }
            }
        });
    }

    // Certifique-se de que o Chart.js e o plugin foram corretamente incluídos
    if (typeof Chart !== 'undefined' && typeof ChartAnnotation !== 'undefined') {
        Chart.register(ChartAnnotation); // Registra o plugin corretamente
    }

    function updateHorizontalBarChartWithMultipleLimits(id, labels, data1, ideallimits, maxlimits, title) {
        const canvas = document.getElementById(id);
        if (!canvas) return;

        if (charts[id]) {
            charts[id].data.labels = labels;
            charts[id].data.datasets[0].data = data1;
            charts[id].data.datasets[1].data = ideallimits;
            charts[id].data.datasets[2].data = maxlimits;
            charts[id].options.plugins.title.text = title;
            charts[id].update();
            return;
        }

        const ctx = canvas.getContext('2d');

        charts[id] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Alunos Matriculados',
                        data: data1,
                        backgroundColor: chartColors.darkPrimaryColor1,
                        borderColor: chartColors.darkPrimaryColor1,
                        borderWidth: 1,
                        barThickness: 5
                    },
                    {
                        label: 'Ideal',
                        data: ideallimits,
                        backgroundColor: chartColors.lightHighlightColor2,
                        borderColor: chartColors.darkHighlightColor2,
                        type: 'scatter',
                        pointStyle: 'line',
                        pointRadius: 1,
                        borderWidth: 15,
                        showLine: false
                    },
                    {
                        label: 'Lotação',
                        data: maxlimits,
                        backgroundColor: chartColors.darkAccentColor2,
                        borderColor: chartColors.darkAccentColor2,
                        type: 'scatter',
                        pointStyle: 'line',
                        pointRadius: 2,
                        borderWidth: 15,
                        showLine: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: true,
                        labels: {
                            boxWidth: 20,
                            boxHeight: 12,
                            font: {
                                size: chartFontSizes.legend
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: title,
                        font: { size: chartFontSizes.title }
                    }
                },
                indexAxis: 'y',
                
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: { display: false },
                        ticks: {
                            font: {
                                size: chartFontSizes.axis
                            }
                        },
                    },
                    y: {
                        grid: { display: false },
                        ticks: {
                            font: {
                                size: chartFontSizes.axis
                            }
                        },
                    }
                }
            }
        });
    }

    // Atualiza os valores exibidos no documento
    function updateValues(filteredData) {
        const totalAlunos = getTotal(filteredData, 'alunos');
        const totalIdealAlunos = getTotal(filteredData, 'capacidade_ideal_alunos');
        const totalVagasOfertadas = getTotal(filteredData, 'vagas_ofertadas');
        const totalCapacidadeAlunos = getTotal(filteredData, 'capacidade_maxima_alunos');

        setInnerText('alunos-value', totalAlunos);
        setInnerText('ideal-alunos-value', totalIdealAlunos);
        setInnerText('vagas-ofertadas-value', totalVagasOfertadas);
        setInnerText('capacidade-alunos-value', totalCapacidadeAlunos);
    }

    // Função utilitária para obter o total de um campo
    function getTotal(data, field) {
        return data.reduce((sum, item) => sum + item[field], 0);
    }

    // Função utilitária para definir o texto de um elemento
    function setInnerText(id, value) {
        document.getElementById(id).innerText = value.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
    }

    // Função para obter os valores de vagas ociosas por série
    function getOciosasPorSerie(data, field) {
        return series.map(serie => data.filter(item => item.serie === serie).reduce((sum, item) => sum + item[field], 0));
    }

    // Atualiza um gráfico específico
    function updateCanvas(id, labels, data, title, bgColor, borderColor) {
        const canvas = document.getElementById(id);
        if (!canvas) return;

        // Calcula o total dos valores das barras
        const total = data.reduce((sum, value) => sum + value, 0);

        if (charts[id]) {
            // Atualiza o gráfico existente
            charts[id].data.labels = labels;
            charts[id].data.datasets[0].data = data;
            charts[id].options.plugins.title.text = `${title} (Total: ${total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })})`;
            charts[id].update({
                duration: 0 // Atualiza sem animação para evitar flickering
            });
            return;
        }

        const ctx = canvas.getContext('2d');

        charts[id] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: data,
                    backgroundColor: bgColor || chartColors.lightPrimaryColor1,
                    borderColor: borderColor || chartColors.darkPrimaryColor1,
                    borderWidth: 1,
                    barThickness: 50
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0 // Desativa animações para evitar flickering
                },
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: `${title} (Total: ${total.toLocaleString('pt-BR', { minimumFractionDigits: 0 })})`,
                        font: { size: chartFontSizes.title }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        font: { size: chartPluginsConfig.datalabels },
                        formatter: value => value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        grid: { display: false },
                        ticks: {
                            font: { size: chartFontSizes.axis },
                            display: false
                        }
                    },
                    x: { 
                        grid: { display: false },
                        ticks: {
                            font: { size: chartFontSizes.axis }
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }
        
    function debounce(func, timeout = 100){
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout);
        };
    }

    // yearSelector.addEventListener('change', debounce(updateChart));
    // serieSelector.addEventListener('change', debounce(handleSerieChange));

    updateChart();
});
