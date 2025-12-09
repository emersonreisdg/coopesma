import { chartColors, chartFontSizes, chartPluginsConfig } from '../chartConfig.js';

document.addEventListener('DOMContentLoaded', function() {
    // Obtém o seletor de ano
    const yearSelector = document.getElementById('year_selector');
    const admCostSelector = document.getElementById('adm_cost_selector');

    if (!yearSelector || !admCostSelector) {
        console.error('Elemento year_selector não encontrado.');
        return;
    }

    // Dados simulados para exemplo
    //const data = JSON.parse('{{ data|escapejs }}');
    const dataElement = document.getElementById('data-json');
    const data = JSON.parse(dataElement.textContent || dataElement.innerText);
    const canvasIds = ['myChart1']; // Lista de IDs para os canvases

    // Atualiza o yearSelector e admCostSelector
    if (data.length > 0) {
        const years = data.map(item => new Date(item.data).getFullYear());
        const maxYear = Math.max(...years);
        yearSelector.value = maxYear;

        // Extraindo a lista_adms do array de objetos data
        const lista_adms = [...new Set(data.map(item => item.descricao))];
        console.log('ADMS:', lista_adms);

        // Preencher o admCostSelector com as opções de lista_adms
        admCostSelector.innerHTML = '';  // Limpar qualquer opção existente


        lista_adms.forEach(adm => {
            const option = document.createElement('option');
            option.value = adm;
            option.text = adm;
            admCostSelector.appendChild(option);
        });
    }

    // Adiciona o evento de mudança ao yearSelector
    yearSelector.addEventListener('change', function() {
        updateChart();
    });

    admCostSelector.addEventListener('change', function() {
        updateChart();
    });
    

    function updateChart() {
        const selectedYear = parseInt(yearSelector.value);
        const selectedAdmCost = admCostSelector.value;

            // Filtra os dados para o ano selecionado
        const yearFilteredData = data.filter(item => {
            const year = new Date(item.data).getFullYear();
            return year === selectedYear;
        });
    
        // Filtra os dados para o ano e descrição selecionados
        const filteredData = yearFilteredData.filter(item => {
            return item.descricao === selectedAdmCost;
        });
    
        // Agrupa os dados por mês
        const groupedData = filteredData.reduce((acc, item) => {
            const month = new Date(item.data).getMonth() + 1; // Mês começa em 0
            if (!acc[month]) {
                acc[month] = { valor: 0 };
            }
            acc[month].valor += item.valor;
            return acc;
        }, {});
    
        // Calcula as somas das despesas administrativas
        const despesaAdm = filteredData.reduce((sum, item) => sum + item.valor, 0);
        const totalDespesasAdm = yearFilteredData.reduce((sum, item) => sum + item.valor, 0);

        const percentualDespesaAdm = (despesaAdm / totalDespesasAdm) * 100;
    
        // Atualiza os elementos HTML com os valores calculados
        document.getElementById('gasto-adm-total-value').innerText = `R$ ${totalDespesasAdm.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
        document.getElementById('gasto-adm-value').innerText = `R$ ${despesaAdm.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
        document.getElementById('gasto-adm-relativo-value').innerText = `${percentualDespesaAdm.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} %`;
    
        // Converte o agrupamento de dados para labels e valores de despesas administrativas
        const labels = Object.keys(groupedData).map(month =>
            new Date(0, month - 1).toLocaleString('pt-BR', { month: 'short' })
        );
        const despesasAdmTotaisValues = labels.map((_, index) => (groupedData[index + 1]?.valor || 0));
    
        // Atualiza o gráfico de despesa administrativa
        canvasIds.forEach(id => {
            const canvas = document.getElementById(id);
            const ctx = canvas.getContext('2d');
            
            // Destrói o gráfico existente, se houver
            if (Chart.getChart(id)) {
                Chart.getChart(id).destroy();
            }
    
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: selectedAdmCost + ' (R$)',
                            data: despesasAdmTotaisValues,
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
                                    return Math.floor(value);
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