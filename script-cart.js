// ========================================
// FUNCIONALIDAD DE INTERFAZ (ACORDEÓN Y FILTROS)
// ========================================
function toggleAccordion(element) {
    const card = element.parentElement;
    const details = card.querySelector('.product-details');
    
    const allCards = document.querySelectorAll('.product-card');
    allCards.forEach(c => {
        if (c !== card && c.classList.contains('active')) {
            c.classList.remove('active');
            c.querySelector('.product-details').style.maxHeight = null;
        }
    });

    card.classList.toggle('active');

    if (card.classList.contains('active')) {
        details.style.maxHeight = details.scrollHeight + "px";
    } else {
        details.style.maxHeight = null;
    }
}

function filterCategory(category) {
    const buttons = document.querySelectorAll('.category-btn');
    const cards = document.querySelectorAll('.product-card');

    buttons.forEach(button => {
        button.classList.toggle('active', button.dataset.category === category);
    });

    cards.forEach(card => {
        const cardCategory = card.dataset.category;
        const details = card.querySelector('.product-details');

        if (category === 'all' || cardCategory === category) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
            card.classList.remove('active');
            if (details) {
                details.style.maxHeight = null;
            }
        }
    });
}

// ========================================
// CARRITO FUNCIONALIDAD
// ========================================
let cart = JSON.parse(localStorage.getItem('polarcsx_cart')) || [];

function saveCart() {
    localStorage.setItem('polarcsx_cart', JSON.stringify(cart));
}

// 1. Modificamos cómo se dibuja el carrito para incluir los botones + y -
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItemsModal = document.getElementById('cart-items-modal');
    const cartTotalModal = document.getElementById('cart-total-modal');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;
    
    if (cartItemsModal) cartItemsModal.innerHTML = ''; 
    
    if (cart.length === 0) {
        if (cartItemsModal) cartItemsModal.innerHTML = '<p class="empty-cart-msg">El carrito está vacío.</p>';
        if (cartTotalModal) cartTotalModal.textContent = '$0.00 MXN';
        return;
    }
    
    cart.forEach((item) => {
        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item';
        // Aquí agregamos los controles + y -
        itemRow.innerHTML = `
            <div class="cart-item-info">
                <p><strong>${item.name}</strong></p>
                <p>$${(item.price * item.quantity).toFixed(2)} MXN</p>
            </div>
            <div class="cart-controls">
                <button onclick="changeQuantity('${item.id}', -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity('${item.id}', 1)">+</button>
            </div>
        `;
        if (cartItemsModal) cartItemsModal.appendChild(itemRow);
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotalModal) cartTotalModal.textContent = `$${total.toFixed(2)} MXN`;
}

// 2. Nueva función única para manejar los cambios
function changeQuantity(id, delta) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += delta;
        // Si la cantidad llega a 0, eliminamos el producto
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
    }
    saveCart();
    updateCartUI();
}
function addToCart(name, price, id) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: name, price: parseFloat(price), id: id, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    alert(`¡${name} agregado al carrito!`);
}

function removeFromCart(id) {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
        } else {
            cart.splice(itemIndex, 1);
        }
    }
    saveCart();
    updateCartUI();
}

function toggleCart() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) cartModal.classList.toggle('open');
}

function closeCartModal() {
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) cartModal.classList.remove('open');
}

function sendWhatsAppOrder() {
    if (cart.length === 0) {
        alert('El carrito está vacío. Agrega productos primero.');
        return;
    }
    
    const phone = '529361577100'; 
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let message = '¡Hola Polarcsx Store! Me interesa realizar el siguiente pedido:\n\n';
    cart.forEach((item) => {
        message += `• ${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)} MXN\n`;
    });
    message += `\n*Total estimado:* $${total.toFixed(2)} MXN\n\nPor favor, confirma disponibilidad y opciones de envío. ¡Gracias!`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    filterCategory('all');
    updateCartUI();
});