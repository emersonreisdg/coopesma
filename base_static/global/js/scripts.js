(() => {
  const forms = document.querySelectorAll('.form-delete');

  for (const form of forms) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const confirmed = confirm('Are you sure?');

      if (confirmed) {
        form.submit();
      }
    });
  }
})();

(() => {
  const buttonCloseMenu = document.querySelector('.button-close-menu');
  const buttonShowMenu = document.querySelector('.button-show-menu');
  const menuContainer = document.querySelector('.menu-container');

  const buttonShowMenuVisibleClass = 'button-show-menu-visible';
  const menuHiddenClass = 'menu-hidden';

  const closeMenu = () => {
    buttonShowMenu.classList.add(buttonShowMenuVisibleClass);
    menuContainer.classList.add(menuHiddenClass);
  };

  const showMenu = () => {
    buttonShowMenu.classList.remove(buttonShowMenuVisibleClass);
    menuContainer.classList.remove(menuHiddenClass);
  };

  if (buttonCloseMenu) {
    buttonCloseMenu.removeEventListener('click', closeMenu);
    buttonCloseMenu.addEventListener('click', closeMenu);
  }

  if (buttonShowMenu) {
    buttonCloseMenu.removeEventListener('click', showMenu);
    buttonShowMenu.addEventListener('click', showMenu);
  }
})();

(() => {
  const authorsLogoutLinks = document.querySelectorAll('.authors-logout-link');
  const formLogout = document.querySelector('.form-logout');

  for (const link of authorsLogoutLinks) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      formLogout.submit();
    });
  }
})();

/* Captura a seleção dos itens do menu */
(() => {
  const menuLinks = document.querySelectorAll('.menu-nav a');

  menuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Obtém o nome do link clicado
      const selectedMenuText = e.target.textContent.trim();
      console.log('Opção de menu selecionada:', selectedMenuText);

      // Armazena a opção de menu selecionada no localStorage
      localStorage.setItem('selectedMenuOption', selectedMenuText);
    });
  });

  // Recupera e exibe a última opção de menu selecionada ao carregar a página
  const lastSelectedMenu = localStorage.getItem('selectedMenuOption');
  if (lastSelectedMenu) {
    console.log('Última opção de menu selecionada:', lastSelectedMenu);
  }
})();

/* Seletor de relatórios */
document.addEventListener('DOMContentLoaded', function() {
  // Recupera a última opção de menu selecionada
  const lastSelectedMenu = localStorage.getItem('selectedMenuOption');
  console.log('A opção de menu selecionada ao acionar o seletor é:', lastSelectedMenu);

  // Referência para os seletores de relatórios e formulários
  const reportSelector = document.getElementById('report_type');
  const formSelector = document.getElementById('form_type');

  let opcaoSelecionada;

  // Define o seletor correto e a mensagem padrão de acordo com o menu selecionado
  if (lastSelectedMenu === 'Relatórios') {
    opcaoSelecionada = reportSelector;
    formSelector && (formSelector.style.display = 'none'); // Esconde o seletor de formulários
    reportSelector && (reportSelector.style.display = 'block'); // Mostra o seletor de relatórios
  } else if (lastSelectedMenu === 'Formulários') {
    opcaoSelecionada = formSelector;
    reportSelector && (reportSelector.style.display = 'none'); // Esconde o seletor de relatórios
    formSelector && (formSelector.style.display = 'block'); // Mostra o seletor de formulários
  }

  // Evita alterar a seleção padrão
  if (opcaoSelecionada) {
    opcaoSelecionada.selectedIndex = 0; // Garante que a primeira opção seja selecionada
    opcaoSelecionada.addEventListener('change', function() {
      if (opcaoSelecionada.value) {
        window.location.href = opcaoSelecionada.value;
      }
    });
  }
});


// document.addEventListener("DOMContentLoaded", function () {
//   const form_data = JSON.parse(localStorage.getItem('formData'));
//   if (form_data) {
//       document.getElementById('data').value = form_data.data || '';
//       document.getElementById('valor').value = form_data.valor || '';
//       // Preencher os selects
//       const bancoSelect = document.getElementById('banco');
//       const contaSelect = document.getElementById('conta');
//       const aplicacaoSelect = document.getElementById('aplicacao');
//       const origemSelect = document.getElementById('origem');
//       console.log('form_data.banco:',form_data.banco);

//       if (form_data.banco) {
//           bancoSelect.value = form_data.banco;
//           console.log('bancoSelect.value:',bancoSelect.value);
//       }
//       if (form_data.conta) {
//           contaSelect.value = form_data.conta;
//       }
//       if (form_data.aplicacao) {
//           aplicacaoSelect.value = form_data.aplicacao;
//       }
//       if (form_data.origem) {
//           origemSelect.value = form_data.origem;
//       }
//   }
// });
