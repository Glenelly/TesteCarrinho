let userData = JSON.parse(localStorage.getItem('userData')) || {};
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let selectedSizes = {};

window.onload = function() {
    // Se existirem dados salvos, atualiza a UI adequadamente
    if (Object.keys(userData).length > 0) {
        document.getElementById('userData').classList.add('hidden');
        document.getElementById('productSelection').classList.remove('hidden');
        if (cart.length > 0) {
            updateCartDisplay();
        }
    }
};

function saveUserData() {
    userData = {
        cpf: document.getElementById('cpf').value,
        name: document.getElementById('name').value,
        whatsapp: document.getElementById('whatsapp').value
    };
    localStorage.setItem('userData', JSON.stringify(userData)); // Salva no LocalStorage
    document.getElementById('userData').classList.add('hidden');
    document.getElementById('productSelection').classList.remove('hidden');
}

function toggleVisibility(productType) {
    // Esconde todos os produtos
    document.querySelectorAll('.product').forEach(p => p.classList.add('hidden'));
    // Mostra o produto selecionado
    document.getElementById(productType).classList.remove('hidden');
}

function addToCart(type, model) {
    if (type === 'Jaleco' || type === 'Camisa') { // Adicione mais tipos conforme necessário
        const size = document.querySelector(`.size-selector[data-type="${type}"][data-model="${model}"]`).value;
        if (!size) {
            alert('Por favor, escolha um tamanho para ' + type);
            return;
        }
        cart.push({ type, model, size });
    } else {
        cart.push({ type, model });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}


function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const sizeInfo = item.size ? ` - Tamanho: ${item.size}` : '';
        cartItems.innerHTML += `<li>${item.type} - ${item.model}${sizeInfo} <button onclick="removeFromCart(cart.indexOf(item))">Remover</button></li>`;
    });
    document.getElementById('cart').classList.remove('hidden');
    updateInvoice();
}

function updateSizeSelection(type, model, size) {
    if (!selectedSizes[type]) {
        selectedSizes[type] = {};
    }
    selectedSizes[type][model] = size;
    
    const selector = document.querySelector(`.size-selector[data-type="${type}"][data-model="${model}"]`);
        if (size) {
            selector.classList.add('selected');
        } else {
            selector.classList.remove('selected');
        }
}

// Mapeamento de preços para cada tipo e modelo de produto
const prices = {
    'Caneca': {
        'Master': 90,
        'Caneca Fundo do poço': 80,
        'Caneca Exército': 80,
        'Caneca Quanto Pior': 80,
        'Caneca Protocolo': 80,
        'Caneca Reprocessar': 80,
        'Caneca CITRG': 80
        // Adicione outros modelos de caneca com seus respectivos preços, se necessário
    },
    'Jaleco': {
        'Terapeuta Certificado': 290.00,
        'CITRG Azul Feminino': 290.00,
        'CITRG Azul Masculino': 290.00,
        'CITRG Branco': 290.00,
        'CITRG Rosa': 290.00,
        // Adicione outros modelos de jaleco com seus respectivos preços, se necessário
    },
    // Adicione outros tipos de produto com seus respectivos modelos e preços, se necessário
    'Camisa': {
        'Camisa Protocolo': 90,
        'Camisa Protocolo Branco': 90,
        'Camisa Impactar': 90,
        'Camisa Fundo do Poço': 90,
        'Camisa Missão': 90,
        'Camisa Polo': 160
    },
    'Garrafa':{
        'Garrafa': 160
    },
    'Botton':{
        'Botton': 25
    },
    'Livro':{
        'Livro': 50
    },
    'Caneta': {
        'Caneta': 50
    },
    'Agenda': {
        'Agenda': 60
    }
};

function updateInvoice() {
    const invoice = document.getElementById('invoice');
    invoice.innerHTML = `<h3>Nota Fiscal</h3>`;
    let total = 0;
    cart.forEach(item => {
        // Verifica se o tipo e o modelo existem no objeto de preços antes de tentar acessar o preço
        const price = prices[item.type] && prices[item.type][item.model] ? prices[item.type][item.model] : "Preço não disponível";
        invoice.innerHTML += `<p>${item.type} ${item.model}: R$${price}</p>`;
        if (!isNaN(price)) {
            total += price;  // Adiciona ao total apenas se o preço é um número
        }
    });
    invoice.innerHTML += `<p>Total: R$${total}</p>`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart)); // Atualiza o LocalStorage após remover um item
    updateCartDisplay();
}

function enviarDadosParaSheetDB() {
    const urlApi = 'SUA_URL_SHEETDB_API'; // Substitua isso pela URL fornecida pelo SheetDB
    const dados = {
        data: [{
            Nome: userData.name,
            WhatsApp: userData.whatsapp,
            CPF: userData.cpf,
            Produtos: JSON.stringify(cart.map(item => ({ tipo: item.type, modelo: item.model }))), // Serializando lista de produtos
            Quantidade: cart.reduce((acc, item) => acc + item.quantity, 0), // Somando quantidade total
            Total: cart.reduce((acc, item) => acc + item.total, 0) // Calculando total
        }]
    };

    fetch(urlApi, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(data => console.log('Dados enviados com sucesso:', data))
    .catch(error => console.error('Erro ao enviar dados:', error));
}

function finalizePurchase() {
    console.log("Finalizar compra chamada");
    const total = calculateTotal();
    const orderDetails = {
        userData: userData,
        cart: cart,
        total: total
    };
 // Salvando no localStorage temporariamente
    localStorage.setItem('orderDetails', JSON.stringify(orderDetails));

    // Limpar o carrinho no localStorage
    localStorage.removeItem('cart');
    cart = []; // Resetando o carrinho localmente
        // Envio dos dados para o SheetMonkey
      // Preparar os dados para envio

    console.log('Detalhes do pedido:', orderDetails);    

    console.log('Carrinho limpo e redirecionando para a página de detalhes do pedido.');
    window.location.href = "orderDetails.html";

    console.log('Carrinho limpo e redirecionando para a página de detalhes do pedido.');
}

function calculateTotal() {
    let total = 0;
    cart.forEach(item => {
        let price = (item.type === 'Caneca' && item.model !== 'Master') ? 80 : 90;
        total += price;
    });
    return total;
}




