// ================================================================
// ÍNDICE DE ESTE ARCHIVO (para no perderte buscando funciones):
// 1. Visor de producto (modal): abrir, cerrar, extraer datos, render
// 2. Filtro de categorías (acordeón/catálogo)
// 3. Carrito de compras: agregar, quitar, actualizar, guardar
// 4. WhatsApp: armar y enviar el pedido
// 5. Encabezado: scroll suave del logo
// 6. Inicialización: qué se ejecuta al cargar la página
// ================================================================

// ========================================
// DESCUENTOS 4LIFE — EDITA SOLO AQUÍ
// ========================================
// Para activar el botón turquesa "Cómpralo con descuento" en un producto,
// rellena su "link" (tu enlace de plataforma 4Life) y su "discountPrice"
// (precio con descuento, número, sin signo de $).
// Mientras un producto tenga link vacío o discountPrice en 0, el botón
// simplemente no aparece en ese producto — no rompe nada dejarlo así.
// El "id" de cada producto es el mismo que ya usa el carrito, y coincide
// con data-product-id en el HTML de esa tarjeta.
const FOURLIFE_DISCOUNTS = {
    '4life-belle-vie':                  { link: 'HTTPS://mexico.4life.com/12665095', discountPrice: 897 },
    '4life-transfer-factor-plus':       { link: 'HTTPS://mexico.4life.com/12665095', discountPrice: 1071 },
    '4life-gold-factor':                { link: 'HTTPS://mexico.4life.com/12665095', discountPrice: 1087 },
    '4life-colageno':                   { link: 'HTTPS://mexico.4life.com/12665095', discountPrice: 690 },
    '4life-vistari':                    { link: 'HTTPS://mexico.4life.com/12665095', discountPrice: 965 },
    '4life-reflexion':                  { link: 'HTTPS://mexico.4life.com/12665095', discountPrice: 1039 },
    '4life-tfbcv-trifactor-formula':    { link: 'HTTPS://mexico.4life.com/12665095', discountPrice: 1092 },
    '4life-glutamine-prime':            { link: 'HTTPS://mexico.4life.com/12665095', discountPrice: 619 },
    '4life-tfa-g-pro':                  { link: 'HTTPS://mexico.4life.com/12665095', discountPrice: 1051 },
    '4life-prezoom':                    { link: 'HTTPS://mexico.4life.com/12665095', discountPrice: 1017 },
    '4life-nutrastart':                 { link: 'https://mexico.4life.com/12665095', discountPrice: 962 },
    '4life-bioefa':                     { link: 'https://mexico.4life.com/12665095', discountPrice: 442 },
    '4life-aloe-vera-stix-tropical':    { link: 'https://mexico.4life.com/12665095', discountPrice: 577 },
    '4life-pasta-dental':               { link: 'https://mexico.4life.com/12665095', discountPrice: 306 },
    '4life-enummi-formula-concentrada': { link: 'https://mexico.4life.com/12665095', discountPrice: 326 },
    '4life-energy-go-sticks':           { link: 'https://mexico.4life.com/12665095', discountPrice: 570 },
    '4life-renuvo':                     { link: 'HTTPS://mexico.4life.com/12665095', discountPrice: 944 },
    '4life-riovida-burst':              { link: 'https://mexico.4life.com/12665095', discountPrice: 739 },
    '4life-tform-man':                  { link: 'https://mexico.4life.com/12665095', discountPrice: 0 },
    '4life-tform-shprite':              { link: 'https://mexico.4life.com/12665095', discountPrice: 0 },
    '4life-rio-vida':                   { link: 'https://mexico.4life.com/12665095', discountPrice: 787 },
};

// ========================================
// COLOR POR CATEGORÍA — identidad visual
// Cada categoría de bienestar tiene su propio tono, así el texto
// ya no es un solo morado plano para todo el catálogo.
// ========================================
const CATEGORY_COLORS = {
    '4life':                 '#2dd4bf', // teal — bienestar general
    'bienestar-integral':    '#a78bfa', // violeta
    'salud-femenina':        '#f472b6', // rosa
    'salud-masculina':       '#60a5fa', // azul acero
    'sistema-inmunologico':  '#facc15', // ámbar
    'energia-vitalidad':     '#fb923c', // naranja
    'salud-digestiva':       '#a3e635', // verde lima
    'postres':                '#ff6ec7', // magenta postres
    'accesorios':             '#22d3ee', // turquesa
    'servicios':               '#38bdf8', // azul claro
};

function applyCategoryColors() {
    document.querySelectorAll('.product-card').forEach(card => {
        const subtitle = card.querySelector('.product-subtitle');
        if (!subtitle) return;
        const color = CATEGORY_COLORS[card.dataset.category];
        if (color) subtitle.style.color = color;
    });
}

// ========================================
// FAMILIA "4LIFE" — para el filtro de categorías
// Muchos productos 4Life están etiquetados con su categoría de
// bienestar específica (ej. "salud-femenina") en vez de "4life"
// a secas. Sin esto, el botón de filtro "4life" los deja fuera.
// ========================================
const FOURLIFE_FAMILY = new Set([
    '4life',
    'bienestar-integral',
    'salud-femenina',
    'salud-masculina',
    'sistema-inmunologico',
    'energia-vitalidad',
    'salud-digestiva',
]);


const viewerState = {
    isOpen: false,
    scrollPosition: 0,
    currentProductElement: null,
};

// ========================================
// PRODUCT VIEWER - EXTRACT DATA
// ========================================
function extractProductData(cardElement) {
    const title = cardElement.querySelector('.product-basic-info h3')?.textContent.trim() || 'Producto';
    const priceText = cardElement.querySelector('.price')?.textContent.trim() || '$0.00';
    const imageEl = cardElement.querySelector('img.product-img');
    const imageSrc = imageEl?.src || '';
    const category = cardElement.dataset.category || 'General';
    const productId = cardElement.dataset.productId || slugify(title);

    // Extract description
    const descriptionEl = cardElement.querySelector('.product-description');
    let description = '';
    let note = '';
    if (descriptionEl) {
        const paraEl = descriptionEl.querySelector('p:first-of-type');
        description = paraEl?.innerHTML.trim() || '';
        // Aviso/nota chiquita (ej. "*Precio de referencia...") que antes se perdía
        const noteEl = descriptionEl.querySelector('small');
        note = noteEl?.textContent.trim() || '';
    }

    // Extract benefits (ul with li items)
    let benefits = [];
    const benefitsUl = cardElement.querySelector('.product-description ul');
    if (benefitsUl) {
        benefits = Array.from(benefitsUl.querySelectorAll('li')).map(li => 
            li.textContent.replace(/^•\s*/, '').trim()
        );
    }

    return {
        id: productId,
        title,
        priceText,
        price: parsePriceText(priceText),
        imageSrc,
        category: formatCategoryLabel(category),
        description,
        note,
        benefits,
    };
}

// ========================================
// PRODUCT VIEWER - ETIQUETA DE CATEGORÍA
// Convierte el slug interno (ej. "sistema-inmunologico")
// en un texto de vitrina legible. Así la categoría se ve
// como parte de la identidad de la tienda, no como un dato crudo.
// ========================================
function formatCategoryLabel(categorySlug) {
    const labels = {
        '4life': '4Life · Bienestar',
        'postres': 'Postres',
        'accesorios': 'Accesorios',
        'servicios': 'Servicios',
        'bienestar-integral': 'Bienestar Integral',
        'energia-vitalidad': 'Energía y Vitalidad',
        'salud-digestiva': 'Salud Digestiva',
        'salud-femenina': 'Salud Femenina',
        'salud-masculina': 'Salud Masculina',
        'sistema-inmunologico': 'Sistema Inmunológico',
        'all': 'Polarcsx',
    };
    return labels[categorySlug] || 'Polarcsx';
}

// ========================================
// PRODUCT VIEWER - PRICE PARSER
// ========================================
function parsePriceText(priceText) {
    if (!priceText) return 0;
    let cleaned = priceText.replace(/[^0-9.,]/g, '');
    const hasComma = cleaned.includes(',');
    const hasDot = cleaned.includes('.');

    if (hasComma && hasDot) {
        cleaned = cleaned.replace(/,/g, '');
    } else if (hasComma && !hasDot) {
        cleaned = cleaned.replace(/,/g, '.');
    }

    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
}

// ========================================
// PRODUCT VIEWER - SLUG GENERATOR
// ========================================
function slugify(text) {
    return text
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
}

// ========================================
// PRODUCT VIEWER - RENDER
// ========================================
function renderProductViewer(productData) {
    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('modal-body');

    if (!modal || !modalBody) {
        console.error('Modal elements not found');
        return;
    }

    // Build benefits HTML
    let benefitsHtml = '';
    if (productData.benefits.length > 0) {
        benefitsHtml = `
            <div class="viewer-benefits">
                <h4>Puntos clave de bienestar:</h4>
                <ul>
                    ${productData.benefits.map(b => `<li>${b}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    // Build 4Life discount button HTML (solo si está configurado)
    let discountHtml = '';
    const discountInfo = FOURLIFE_DISCOUNTS[productData.id];
    if (discountInfo && discountInfo.link && discountInfo.discountPrice > 0) {
        discountHtml = `
            <a class="viewer-discount-btn" href="${discountInfo.link}" target="_blank" rel="noopener noreferrer">
                <span class="viewer-discount-label">Cómpralo con descuento en 4Life</span>
                <span class="viewer-discount-prices">
                    <span class="viewer-discount-old">${productData.priceText}</span>
                    <span class="viewer-discount-new">$${discountInfo.discountPrice.toFixed(2)}</span>
                </span>
            </a>
        `;
    }

    // Render complete viewer
    modalBody.innerHTML = `
        <div class="viewer-card">
            <div class="viewer-image-section">
                <div class="viewer-image">
                    <img src="${productData.imageSrc}" alt="${productData.title}">
                </div>
            </div>
            <div class="viewer-info">
                <div class="viewer-header">
                    <span class="viewer-category">${productData.category}</span>
                    <h2 class="viewer-title">${productData.title}</h2>
                </div>
                
                <div class="viewer-price">${productData.priceText}</div>

                <div class="viewer-trust-badge">
                    <span class="viewer-trust-check">✓</span>
                    Vendido y garantizado por <strong>Polarcsx</strong>
                </div>

                ${discountHtml}
                
                <div class="viewer-description">${productData.description}</div>
                
                ${benefitsHtml}
                
                ${productData.note ? `<p class="viewer-note">${productData.note}</p>` : ''}

                <div class="viewer-perks">
                    <span><i class="fa-solid fa-truck-fast"></i> Envío a todo México</span>
                    <span><i class="fa-solid fa-lock"></i> Pago seguro</span>
                    <span><i class="fa-brands fa-whatsapp"></i> Soporte directo</span>
                </div>
                
<div class="viewer-actions">
    <button class="viewer-buy-btn" onclick="buyNowWhatsApp('${productData.title.replace(/'/g, "\\'")}', ${productData.price}, viewerState.currentQty)">
        Comprar ahora
    </button>
    <button class="viewer-cart-btn" onclick="addToCart('${productData.title.replace(/'/g, "\\'")}', ${productData.price}, '${productData.id}', viewerState.currentQty); this.textContent='✓ Añadido';setTimeout(()=>{this.textContent='Añadir al carrito';},1500);">
        Añadir al carrito
    </button>
</div>
<div class="viewer-qty-controls">
    <button class="qty-btn" onclick="changeViewerQty(-1)">−</button>
    <span id="viewer-qty-value" class="qty-value">1</span>
    <button class="qty-btn" onclick="changeViewerQty(1)">+</button>
</div>
                
                <p class="viewer-hint">Toca cualquier parte fuera del producto para continuar.</p>
            </div>
        </div>
    `;

    // Show modal with animation
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    viewerState.isOpen = true;
}

// ========================================
// PRODUCT VIEWER - OPEN
// ========================================
function openProductViewer(cardElement) {
    if (viewerState.isOpen) return;

    // Save current scroll position
    viewerState.scrollPosition = window.scrollY || window.pageYOffset;
    viewerState.currentProductElement = cardElement;

    // Extract product data from card
    const productData = extractProductData(cardElement);

    // Render viewer
    renderProductViewer(productData);
}

// ========================================
// PRODUCT VIEWER - CLOSE
// ========================================
function closeProductViewer() {
    const modal = document.getElementById('product-modal');
    if (!modal || !viewerState.isOpen) return;

    modal.classList.remove('open');
    viewerState.isOpen = false;
    const cartModal = document.getElementById('cart-modal');
    if (!cartModal || !cartModal.classList.contains('open')) {
        document.body.style.overflow = '';
    }

    // Restore scroll position with small delay for smooth animation
    setTimeout(() => {
        window.scrollTo(0, viewerState.scrollPosition);
    }, 50);
}

// ========================================
// PRODUCT VIEWER - INITIALIZE
// ========================================
function initializeProductViewer() {
    const modal = document.getElementById('product-modal');
    const modalContent = document.querySelector('.modal-content');

    // Handle product card clicks
    document.querySelectorAll('.product-summary').forEach(summary => {
        // Remove old listeners by cloning
        const newSummary = summary.cloneNode(true);
        summary.replaceWith(newSummary);
    });

    // Re-attach listeners to fresh elements
    document.querySelectorAll('.product-summary').forEach(summary => {
        summary.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            const cardElement = summary.closest('.product-card');
            if (cardElement) {
                openProductViewer(cardElement);
            }
        });
    });

    if (!modal) return;

    // Close on background click
    modal.addEventListener('click', event => {
        if (event.target === modal) {
            closeProductViewer();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && viewerState.isOpen) {
            closeProductViewer();
        }
    });

    // Close on button click
    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductViewer);
    }

    console.log('✓ Product viewer initialized successfully');
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

        const matches = category === 'all'
            || cardCategory === category
            || (category === '4life' && FOURLIFE_FAMILY.has(cardCategory));

        if (matches) {
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

// Inicializa mostrando todos los productos al cargar la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        filterCategory('all');
        updateCartUI();
        initializeProductViewer();
        initializeLogoScroll();
        initCookieBanner();
        addPriceBadges();
        applyCategoryColors();
    });
} else {
    filterCategory('all');
    updateCartUI();
    initializeProductViewer();
    initializeLogoScroll();
    initCookieBanner();
    addPriceBadges();
    applyCategoryColors();
}

// Registro del service worker — necesario para que el navegador
// considere la página "instalable" como app (PWA).
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
            console.error('No se pudo registrar el service worker:', err);
        });
    });
}

// ========================================
// BOTÓN FLOTANTE — INSTALAR APP (PWA)
// Chrome/Android disparan "beforeinstallprompt" solo cuando el sitio
// cumple los requisitos de instalación. Antes de eso no hay nada que
// mostrar — por eso el botón empieza oculto en el HTML.
// ========================================
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    const btn = document.getElementById('fab-install-btn');
    if (btn) btn.classList.add('show');
});

function installPWA() {
    const btn = document.getElementById('fab-install-btn');
    if (!deferredInstallPrompt) return;

    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.finally(() => {
        deferredInstallPrompt = null;
        if (btn) btn.classList.remove('show');
    });
}

// Si ya está instalada (o el usuario ya la instaló en esta sesión),
// no tiene caso seguir mostrando el botón.
window.addEventListener('appinstalled', () => {
    const btn = document.getElementById('fab-install-btn');
    if (btn) btn.classList.remove('show');
    deferredInstallPrompt = null;
});

// ========================================
// CARRITO DE COMPRAS
// ========================================
let cart = [];
try {
    cart = JSON.parse(localStorage.getItem('polarcsx_cart')) || [];
} catch (error) {
    cart = [];
}

function saveCart() {
    localStorage.setItem('polarcsx_cart', JSON.stringify(cart));
}
function addToCart(name, price, id, quantity = 1) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id: id, name: name, price: parseFloat(price), quantity: quantity });
    }
    saveCart();
    updateCartUI();
    const fabBtn = document.getElementById('fab-cart-btn');
    if (fabBtn) {
        fabBtn.classList.remove('pulse-animation');
        void fabBtn.offsetWidth;
        fabBtn.classList.add('pulse-animation');
    }
}

function updateCartUI() {
    const cartCountElement = document.getElementById('cart-count');
    const fabCartCount = document.getElementById('fab-cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartItemsModal = document.getElementById('cart-items-modal');
    const cartTotalElement = document.getElementById('cart-total');
    const cartTotalModal = document.getElementById('cart-total-modal');
    
    // --- LIMPIEZA DE CONTENEDORES (FIX) ---
    if (cartItemsContainer) cartItemsContainer.innerHTML = '';
    if (cartItemsModal) cartItemsModal.innerHTML = '';
    // --------------------------------------
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) cartCountElement.textContent = totalItems;
    if (fabCartCount) fabCartCount.textContent = totalItems;
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotalElement) cartTotalElement.textContent = `$${totalPrice.toFixed(2)} MXN`;
    if (cartTotalModal) cartTotalModal.textContent = `$${totalPrice.toFixed(2)} MXN`;
    
    const emptyMsg = '<div class="empty-cart">El carrito está vacío.</div>';
    if (cart.length === 0) {
        if (cartItemsContainer) cartItemsContainer.innerHTML = emptyMsg;
        if (cartItemsModal) cartItemsModal.innerHTML = emptyMsg;
        return;
    }
    
    cart.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item';
        itemRow.innerHTML = `
            <div class="cart-item-info">
                <p class="cart-item-name">${item.name}</p>
                <div class="cart-item-qty-controls">
                    <button class="qty-btn" onclick="decrementCartItem('${item.id}')">−</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="incrementCartItem('${item.id}')">+</button>
                </div>
                <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)} MXN</p>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">✕</button>
        `;
        
        // Agregar al contenedor principal y al modal
        if (cartItemsContainer) cartItemsContainer.appendChild(itemRow);
        if (cartItemsModal) {
            cartItemsModal.appendChild(itemRow.cloneNode(true));
        }
    });
}
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function incrementCartItem(id) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += 1;
    saveCart();
    updateCartUI();
}

function decrementCartItem(id) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity -= 1;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    saveCart();
    updateCartUI();
}

function toggleCart() {
    const cartModal = document.getElementById('cart-modal');
    if (!cartModal) return;
    
    if (cartModal.classList.contains('open')) {
        closeCartModal();
    } else {
        openCartModal();
    }
}

function openCartModal() {
    const cartModal = document.getElementById('cart-modal');
    if (!cartModal) return;
    
    cartModal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    const cartModal = document.getElementById('cart-modal');
    if (!cartModal) return;
    
    cartModal.classList.remove('open');
    // No liberar el scroll si el visor de producto sigue abierto encima
    if (!viewerState.isOpen) {
        document.body.style.overflow = '';
    }
}

// ========================================
// ENVÍO DE PEDIDO POR WHATSAPP
// ========================================
function buyNowWhatsApp(title, price, quantity = 1) {
    const subtotal = (parseFloat(price) * quantity).toFixed(2);
    let message = '¡Hola Polarcsx Store! Quiero comprar directamente este producto:\n\n';
    message += `• ${title} (x${quantity}) - $${subtotal} MXN\n\n`;
    message += '¿Podrían confirmarme disponibilidad y el total con envío?';
    window.open(`https://wa.me/529361577100?text=${encodeURIComponent(message)}`, '_blank');
}

function sendWhatsAppOrder() {

    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    let total = 0;

    let message = "🛒 *NUEVO PEDIDO POLARCSX*";
    message += "\n\n";

    cart.forEach((item, index) => {

        const subtotal = item.price * item.quantity;
        total += subtotal;

        message += `${index + 1}. ${item.name}\n`;
        message += `Cantidad: ${item.quantity}\n`;
        message += `Precio: $${item.price.toFixed(2)} MXN\n`;
        message += `Subtotal: $${subtotal.toFixed(2)} MXN\n\n`;

    });

    message += "-----------------------------\n";
    message += `TOTAL: $${total.toFixed(2)} MXN\n\n`;
    message += "Hola, me interesa realizar este pedido.\n";
    message += "¿Podrían confirmar disponibilidad y costo de envío?";

    window.open(
        `https://wa.me/529361577100?text=${encodeURIComponent(message)}`,
        "_blank"
    );

}

function changeViewerQty(delta) {
    const valueEl = document.getElementById('viewer-qty-value');
    if (!valueEl) return;
    let qty = parseInt(valueEl.textContent, 10) || 1;
    qty = Math.max(1, qty + delta);
    valueEl.textContent = qty;
    viewerState.currentQty = qty;
}

// ========================================
// COOKIES — banner de consentimiento
// ========================================
function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;

    const choice = localStorage.getItem('polarcsx_cookie_consent');
    if (!choice) {
        setTimeout(() => banner.classList.add('show'), 600);
    }
}

function handleCookieChoice(choice) {
    localStorage.setItem('polarcsx_cookie_consent', choice);
    const banner = document.getElementById('cookie-banner');
    if (banner) banner.classList.remove('show');
}

// ========================================
// TARJETAS: precio como badge sobre la imagen
// (no toca el HTML de cada producto, se inyecta
// en tiempo de carga)
// ========================================
function addPriceBadges() {
    document.querySelectorAll('.product-image-container').forEach(container => {
        if (container.querySelector('.price-badge')) return; // evita duplicados
        const priceEl = container.parentElement.querySelector('.price');
        if (!priceEl) return;
        const badge = document.createElement('span');
        badge.className = 'price-badge';
        badge.textContent = priceEl.textContent.trim();
        container.appendChild(badge);
    });
}

// ========================================
// LOGO SCROLL SUAVE AL INICIO
// ========================================
function initializeLogoScroll() {
    const logoLink = document.getElementById('logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}