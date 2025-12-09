import { chartColors, chartFontSizes, chartPluginsConfig } from '../chartConfig.js';

document.addEventListener("DOMContentLoaded", function () {
    const canvasContainer = document.getElementById('canvas-container-wrapper');
    
    // Verifique se o container está disponível
    if (canvasContainer) {
        const containerDiv = document.createElement('div');
        containerDiv.className = 'canvas-container'; // Aplica o estilo correto

        const canvas = document.createElement('canvas');
        canvas.id = 'myChart';

        containerDiv.appendChild(canvas);
        canvasContainer.appendChild(containerDiv);

        // Agora que o canvas foi adicionado, podemos continuar com a criação do gráfico
        const ctx = canvas.getContext('2d');

        // Exemplo de dados
        const dataJSON = JSON.parse(document.getElementById('data-json').textContent);

        // Agrupando os dados por ano
        const groupedData = {};

        dataJSON.forEach(item => {
            const year = new Date(item.data).getFullYear(); // Extrai o ano da data

            if (!groupedData[year]) {
                groupedData[year] = 0;
            }

            // Soma as projeções por ano, substituindo valores negativos por 0
            groupedData[year] += item.projecao_fates < 0 ? 0 : item.projecao_fates;
        });

        const labels = Object.keys(groupedData); // Anos
        const values = Object.values(groupedData); // Valores de projeção somados

        // Configuração do gráfico
        const chart = new Chart(ctx, {
            type: 'line', // Tipo de gráfico
            data: {
                labels: labels, // Anos no eixo X
                datasets: [{
                    label: 'Projeção do FATES (R$ mil)',
                    data: values, // Projeções no eixo Y
                    backgroundColor: chartColors.lightSecondaryColor2,
                    borderColor: chartColors.darkSecondaryColor2,
                    borderWidth: 2,
                    fill: true // Habilita a renderização da área
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Isso permite que o gráfico preencha o container
                scales: {
                    x: {
                        ticks: { font: { size: 16 } },
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true, // Começar o eixo Y no zero
                        font: {
                            size: 16 // Aumenta o tamanho do texto no eixo y
                        },
                        ticks: {
                            display: false // Não exibir os ticks (números) do eixo Y
                        },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: {
                        labels: { font: { size: 20 } },
                        display: true,
                        position: 'top',
                    },
                    datalabels: {
                        align: 'end',
                        anchor: 'end',
                        font: { size: 16 },
                        formatter: (value) => Math.floor(value / 1000) // Divide os valores dos rótulos por 1000 e arredonda
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    } else {
        console.error("Canvas container not found.");
    }
});

