import { chartColors, chartFontSizes, chartPluginsConfig } from '../chartConfig.js';

document.addEventListener('DOMContentLoaded', function() {
    const minYearInput = document.getElementById('min_year');
    const maxYearInput = document.getElementById('max_year');
    const minYearValue = document.getElementById('min_year_value');
    const maxYearValue = document.getElementById('max_year_value');
    const showMetaCheckbox = document.getElementById('show_meta');

    // Lista de IDs para os canvases
    const canvasIds = ['myChart1']; // **Aqui você define a lista de IDs**

    // Cria dinamicamente os canvas-container
    const wrapper = document.getElementById('canvas-container-wrapper');
    const charts = {}; // Objeto para armazenar instâncias de Chart

    // Cria um container com classe canvas-container e adiciona o canvas dentro dele
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'canvas-container';

    canvasIds.forEach(id => {
        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'canvas-container';
        const canvas = document.createElement('canvas');

        canvas.id = id;
        // canvas.width = 800; // Largura inicial
        // canvas.height = 400; // Altura inicial
        canvasContainer.appendChild(canvas);
        wrapper.appendChild(canvasContainer);
        wrapper.style.display = 'flex'; // ou block, se preferir

        // Cria uma nova instância de Chart e armazena em `charts`
        charts[id] = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Número de Matrículas',
                        data: [],
                        backgroundColor: chartColors.lightPrimaryColor1,
                        borderColor: chartColors.darkPrimaryColor1,
                        borderWidth: 4 // Aumenta a espessura da linha
                    },
                    {
                        label: 'Meta',
                        data: [],
                        type: 'scatter',
                        showLine: false,
                        backgroundColor: chartColors.lightHighlightColor1,
                        borderColor: chartColors.darkHighlightColor1,
                        borderWidth: 4, // Aumenta a espessura da linha
                        pointStyle: 'cross', // Define o ponto como "X"
                        pointRadius: 10 // Aumenta o tamanho do "X"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Isso permite que o gráfico preencha o container
                plugins: chartPluginsConfig,
                scales: {
                    x: {
                        type: 'linear', // Define o tipo de escala como linear para números
                        position: 'bottom',
                        ticks: { callback: (value) => Math.floor(value), font: { size: chartFontSizes.axis } },
                        grid: {
                            display: false // Remove as linhas de grade no eixo x
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: chartFontSizes.axis // Aumenta o tamanho do texto no eixo y
                            },
                            display: false
                        },
                        grid: {
                            display: false // Remove as linhas de grade no eixo y
                        }
                    }
                },
                plugins: {
                    // legend: {
                    //     labels: {
                    //         font: {
                    //             size: 20 // Aumenta o tamanho do texto da legenda
                    //         },
                    //         filter: function(legendItem) {
                    //             return legendItem.text !== 'Meta' || showMetaCheckbox.checked;
                    //         }
                    //     }
                    // },
                    datalabels: {
                        align: 'end',
                        anchor: 'end',
                        font: {
                            size: chartFontSizes.tooltip
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    });

    minYearInput.addEventListener('input', function() {
        minYearValue.textContent = minYearInput.value;
        updateCharts();
    });

    maxYearInput.addEventListener('input', function() {
        maxYearValue.textContent = maxYearInput.value;
        updateCharts();
    });

    showMetaCheckbox.addEventListener('change', function() {
        updateCharts();
    });

    window.addEventListener('resize', function() {
        canvasIds.forEach(id => {
            if (charts[id]) {
                charts[id].resize();
            }
        });
    });

    function updateCharts() {
        const minYear = parseInt(minYearInput.value);
        const maxYear = parseInt(maxYearInput.value);
        const showMeta = showMetaCheckbox.checked;

        const filteredData = data.filter(item => {
            const year = new Date(item.data).getFullYear();
            return year >= minYear && year <= maxYear;
        });

        const groupedData = filteredData.reduce((acc, item) => {
            const year = new Date(item.data).getFullYear();
            if (!acc[year]) {
                acc[year] = { numero_matriculas: 0, meta: 0 };
            }
            acc[year].numero_matriculas += item.numero_matriculas;
            acc[year].meta = item.meta; // Atualiza a meta para o último valor do ano
            return acc;
        }, {});

        const labels = Object.keys(groupedData);
        const matriculasValues = labels.map(year => groupedData[year].numero_matriculas);
        const metaValues = labels.map(year => groupedData[year].meta);

        const minValue = Math.min(...matriculasValues);
        const dynamicMinY = Math.floor(minValue / 100) * 100;

        const extendedMinYear = minYear - 1; // Adiciona um ano antes do intervalo
        const extendedMaxYear = maxYear + 0; // Adiciona um ano após o intervalo

        canvasIds.forEach(id => {
            const chart = charts[id]; // Obtém o gráfico correspondente ao ID
            chart.data.labels = labels;
            chart.data.datasets[0].data = matriculasValues;
            chart.data.datasets[1].data = metaValues;
            chart.data.datasets[1].hidden = !showMeta; // Define a visibilidade da meta
            chart.options.scales.x.min = extendedMinYear;
            chart.options.scales.x.max = extendedMaxYear;
            chart.options.scales.y.min = dynamicMinY;

            // Atualiza a legenda
            chart.options.plugins.legend.labels.filter = function(legendItem) {
                return legendItem.text !== 'Meta' || showMeta;
            };

            chart.update();
        });
    }

    //const data = JSON.parse('{{ data|escapejs }}');
    const dataElement = document.getElementById('data-json');
    const data = JSON.parse(dataElement.textContent || dataElement.innerText);
    updateCharts(); // Inicializa os gráficos
});