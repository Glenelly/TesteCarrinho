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

window.onload = function() {
    const orderDetails = JSON.parse(localStorage.getItem('orderDetails'));

    // Preencher as informações do usuário
    document.getElementById('userName').value = orderDetails.userData.name;
    document.getElementById('userCPF').value = orderDetails.userData.cpf;
    document.getElementById('userPhone').value = orderDetails.userData.whatsapp;

    // Preencher os itens do carrinho e calcular o total
    let total = 0;
    const cartItems = orderDetails.cart.map((item, index) => {
        const itemPrice = prices[item.type] && prices[item.type][item.model] ? prices[item.type][item.model] : 'N/A';
        total += itemPrice !== 'N/A' ? itemPrice : 0;
        const itemHTML = `<p><label>Produto ${index + 1} - ${item.type} - ${item.model}:</label>
                          <input type="text" value="R$${itemPrice}" readonly>
                          <input type="hidden" id="product_${index}_type" value="${item.type}">
                          <input type="hidden" id="product_${index}_model" value="${item.model}">
                          <input type="hidden" id="product_${index}_price" value="${itemPrice}">
                          </p>`;
        return itemHTML;
    }).join('');
    document.getElementById('cartInfo').innerHTML = cartItems;
    document.getElementById('totalPrice').innerHTML = `<strong>Total da Compra: R$${total}</strong>`;
};

function sendDataToSheetDB(event) {
    event.preventDefault(); // Evitar recarregamento da página
    const url = 'https://sheetdb.io/api/v1/mne7q41q7t34h'; // Substitua YOUR_API_ID pela sua ID de API real

    // Preparar dados para envio
    const orderDetails = JSON.parse(localStorage.getItem('orderDetails'));
    const products = orderDetails.cart.map(item => ({
        Nome: document.getElementById('userName').value,
        CPF: document.getElementById('userCPF').value,
        WhatsApp: document.getElementById('userPhone').value,
        TipoProduto: item.type,
        ModeloProduto: item.model,
        PrecoUnitario: prices[item.type][item.model],
        Quantidade: 1 // Se tiver quantidade em orderDetails, use-a aqui
    }));

    const data = { data: products };

    // Fazer requisição POST para SheetDB
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Dados enviados com sucesso!');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Erro ao enviar dados!');
    });
}