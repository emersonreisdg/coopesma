import { chartColors, chartFontSizes, chartPluginsConfig } from '../chartConfig.js';

document.addEventListener('DOMContentLoaded', function() {
    // Obtém o seletor de ano
    const yearSelector = document.getElementById('year_selector');

    // Verifica se o elemento yearSelector foi encontrado
    if (!yearSelector) {
        console.error('Elemento year_selector não encontrado.');
        return;
    }

    // Dados simulados para exemplo
    //const data = JSON.parse('{{ data|escapejs }}');
    const dataElement = document.getElementById('data-json');
    const data = JSON.parse(dataElement.textContent || dataElement.innerText);
    const canvasIds = ['myChart1', 'myChart2']; // Lista de IDs para os canvases

    // Atualiza o yearSelector com o maior ano disponível
    if (data.length > 0) {
        const years = data.map(item => new Date(item.data).getFullYear());
        const maxYear = Math.max(...years);
        yearSelector.value = maxYear;
    }

    // Adiciona o evento de mudança ao yearSelector
    yearSelector.addEventListener('change', function() {
        updateChart();
    });

    function updateChart() {
        const selectedYear = parseInt(yearSelector.value);

        // Filtra os dados para o ano selecionado
        const filteredData = data.filter(item => {
            const year = new Date(item.data).getFullYear();
            return year === selectedYear;
        });

        // Agrupa os dados por mês
        const groupedData = filteredData.reduce((acc, item) => {
            const month = new Date(item.data).getMonth() + 1; // Mês começa em 0
            if (!acc[month]) {
                acc[month] = { receitas: 0, despesas: 0 };
            }
            acc[month].receitas += item.receitas;
            acc[month].despesas += item.despesas;
            return acc;
        }, {});

        // Calcula as somas das receitas e despesas
        const totalReceitas = filteredData.reduce((sum, item) => sum + item.receitas, 0);
        const totalDespesas = filteredData.reduce((sum, item) => sum + item.despesas, 0);
        const saldoOrcamentario = totalReceitas - totalDespesas;
        
        // Atualiza os elementos HTML com os valores calculados
        document.getElementById('receitas-value').innerText = `R$ ${totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
        document.getElementById('despesas-value').innerText = `R$ ${totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
        document.getElementById('saldo-value').innerText = `R$ ${saldoOrcamentario.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

        // Define a cor da legenda do saldo
        const saldoLegendColor = saldoOrcamentario < 0 ? chartColors.darkAccentColor2: chartColors.darkPrimaryColor2;

        // Converte o agrupamento de dados para labels, valores de receitas, despesas e saldo
        const labels = Object.keys(groupedData).map(month =>
            new Date(0, month - 1).toLocaleString('pt-BR', { month: 'short' })
        );
        const receitasValues = labels.map((_, index) => (groupedData[index + 1]?.receitas || 0) / 1000);
        const despesasValues = labels.map((_, index) => (groupedData[index + 1]?.despesas || 0) / 1000);
        const saldoValues = labels.map((_, index) => (groupedData[index + 1]?.receitas - groupedData[index + 1]?.despesas) / 1000 || 0);

        // No gráfico de saldo, se o saldo for negativo, a cor da barra será vermelha
        const saldoBackgroundColors = saldoValues.map(value => value < 0 ? chartColors.lightAccentColor2: chartColors.lightPrimaryColor2);
        const saldoBorderColors = saldoValues.map(value => value < 0 ? chartColors.darkAccentColor2: chartColors.darkPrimaryColor2);

        // Atualiza o gráfico de receitas e despesas
        canvasIds.forEach((id, index) => {
            const canvas = document.getElementById(id);
            const ctx = canvas.getContext('2d');
            
            // Destrói o gráfico existente, se houver
            if (Chart.getChart(id)) {
                Chart.getChart(id).destroy();
            }

            if (id === 'myChart1') {
                new Chart(ctx, {
                    type: 'bar',

                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Receitas (R$ mil)',
                                data: receitasValues,
                                backgroundColor: chartColors.lightPrimaryColor1,
                                borderColor: chartColors.darkPrimaryColor1,
                                borderWidth: 4
                            },
                            {
                                label: 'Despesas (R$ mil)',
                                data: despesasValues,
                                backgroundColor: chartColors.lightAccentColor1,
                                borderColor: chartColors.darkAccentColor1,
                                borderWidth: 4
                            }
                        ]
                    },
                    options: {
                        scales: {
                            x: {
                                type: 'category',
                                position: 'bottom',
                                ticks: {
                                    font: {
                                        size: 16
                                    }
                                },
                                grid: {
                                    display: false
                                }
                            },
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    font: {
                                        size: 16
                                    },
                                    callback: function(value) {
                                        return Math.floor(value) + ' mil';
                                    },
                                    display: false
                                },
                                grid: {
                                    display: false
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                labels: {
                                    font: {
                                        size: 20
                                    }
                                }
                            },
                            datalabels: {
                                align: 'end',
                                anchor: 'end',
                                font: {
                                    size: 16
                                },
                                formatter: function(value) {
                                    return Math.floor(value);
                                }
                            }
                        }
                    },
                    plugins: [ChartDataLabels]
                });
            } else if (id === 'myChart2') {
                // Gráfico de saldo
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Saldo (R$ mil)',
                                data: saldoValues,
                                backgroundColor: saldoBackgroundColors,
                                borderColor: saldoBorderColors,
                                borderWidth: 4
                            }
                        ]
                    },
                    options: {
                        scales: {
                            x: {
                                type: 'category',
                                position: 'bottom',
                                ticks: {
                                    font: {
                                        size: 16
                                    }
                                },
                                grid: {
                                    display: false
                                }
                            },
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    font: {
                                        size: 16
                                    },
                                    callback: function(value) {
                                        return Math.floor(value) + ' mil';
                                    },
                                    display: false
                                },
                                grid: {
                                    display: false
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                labels: {
                                    font: {
                                        size: 20
                                    },
                                    generateLabels: function(chart) {
                                        const legendItems = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                        return legendItems;
                                    }
                                }
                            },
                            datalabels: {
                                align: 'end',
                                anchor: 'end',
                                font: {
                                    size: 16
                                },
                                formatter: function(value) {
                                    return Math.floor(value);
                                }
                            }
                        }
                    },
                    plugins: [ChartDataLabels]
                });
            }
        });
    }

    function resizeChart() {
        const canvasContainers = document.querySelectorAll('.canvas-container');
        canvasContainers.forEach(container => {
            const canvas = container.querySelector('canvas');
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            const chart = Chart.getChart(canvas.id); // Obtém o gráfico existente pelo ID do canvas
            if (chart) {
                chart.resize(); // Redimensiona o gráfico
            }
        });
    }

    // Cria dinamicamente os canvas-container
    const containerWrapper = document.getElementById('canvas-container-wrapper');
    canvasIds.forEach(id => {
        const div = document.createElement('div');
        div.className = 'canvas-container';
        const canvas = document.createElement('canvas');
        canvas.id = id;
        canvas.width = 800; // Largura inicial
        canvas.height = 200; // Altura inicial
        div.appendChild(canvas);
        containerWrapper.appendChild(div);
    });

    // Atualiza o gráfico na inicialização
    updateChart();

    // Ajusta o tamanho do gráfico na inicialização
    resizeChart();

    // Adiciona o evento de redimensionamento
    window.addEventListener('resize', resizeChart);
});