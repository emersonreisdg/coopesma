document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('monitoramento-button').addEventListener('click', function (e) {
        e.preventDefault(); // Impede o envio do formulário padrão

        const monitoramentoUrl = this.getAttribute('data-url'); // Obtém a URL do atributo
        console.log("monitoramentoUrl:", monitoramentoUrl);

        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        // console.log('csrfToken:', csrfToken);

        fetch(monitoramentoUrl, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'monitoramento' })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao realizar a requisição');
            }
            return response.json();
        })
        .then(data => {
            if (data.redirect_url) {
                console.log("Redirecionando para:", data.redirect_url);
                window.open(data.redirect_url, '_blank');

                // // Verifica se o usuário está autenticado no sistema remoto
                // fetch('/api/check-authentication/', {
                //     method: 'GET',
                //     headers: {
                //         'X-CSRFToken': csrfToken,
                //         'Content-Type': 'application/json',
                //     },
                // })
                // .then(authResponse => {
                //     if (!authResponse.ok) {
                //         throw new Error('Erro ao verificar autenticação');
                //     }
                //     return authResponse.json();
                // })
                // .then(authData => {
                //     if (authData.is_authenticated) {
                //         console.log('Usuário já autenticado. Redirecionando...');
                //         window.open('https://monitoramento.sicessolar.com.br/monitoramento', '_blank');
                //     } else {
                //         console.log('Usuário não autenticado. Redirecionando para login...');
                               
                //         // Faz uma requisição para o endpoint Django que aciona o Selenium
                //         fetch('/selenium-login/', { 
                //             method: 'GET' // Faz uma requisição GET para a URL configurada no Django
                //         })
                //         .then(response => {
                //             if (!response.ok) {
                //                 throw new Error('Erro no login automático');
                //             }
                //             return response.json(); // Processa a resposta JSON
                //         })
                //         .then(data => {
                //             if (data.redirect_url) {
                //                 console.log('Usuário já autenticado. Redirecionando. para ', data.redirect_url);
                //                 // Abre a página monitorada em uma nova aba
                //                 window.open(data.redirect_url, '_blank');
                //             } else if (data.error) {
                //                 console.error("Erro:", data.error);
                //                 alert(data.error);
                //             } else {
                //                 console.error("Resposta inesperada:", data);
                //             }
                //         })
                //         .catch(error => {
                //             console.error('Erro:', error);
                //             alert('Erro ao realizar login automático.');
                //         });
                //     }
                // })
                // .catch(error => {
                //     console.error('Erro ao verificar autenticação:', error);
                // });
            } else {
                console.error("Erro ao acessar o monitoramento da Usina Fotovoltaica.");
                alert('Erro ao acessar o monitoramento da Usina Fotovoltaica.');
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Ocorreu um problema ao processar sua solicitação.');
        });
    });
}); 