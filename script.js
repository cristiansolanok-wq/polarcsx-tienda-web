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
// ENLACES DE MARCA (TECNOLOGÍA) — EDITA SOLO AQUÍ
// ========================================
// Muestra un botón "Ver más de [marca]" en productos de Tecnología cuya
// marca tenga tienda oficial verificada. Igual que arriba: si "link" está
// vacío, el botón simplemente no aparece — no rompe nada dejarlo así.
// IMPORTANTE: solo pon aquí URLs que hayas confirmado tú mismo. No inventes
// links de "tienda oficial" — si está mal, se ve peor que no tener botón.
const BRAND_LINKS = {
    'tecnologia-cargador-gan-1hora': { brand: '1Hora', link: 'https://www.1hora.com' },
    // Agrega aquí más productos 1Hora del lote nuevo cuando tengan su
    // data-product-id definitivo, ej:
    // 'tecnologia-audifonos-aut213': { brand: '1Hora', link: 'https://www.1hora.com' },
    //
    // Pendientes de URL confirmada (no inventar, dejar vacío hasta saberla):
    // XbTod, FOL, Ridgeway, KaiPing, Buytiti
};

// ========================================
// COLOR POR CATEGORÍA — identidad visual
// Cada categoría de bienestar tiene su propio tono, así el texto
// ya no es un solo morado plano para todo el catálogo.
// ========================================
const CATEGORY_COLORS = {
    '4life':                 '#2dd4bf', // turquesa 4Life
    'bienestar-integral':    '#2dd4bf', // mismo turquesa 4Life
    'salud-femenina':        '#2dd4bf', // mismo turquesa 4Life
    'salud-masculina':       '#2dd4bf', // mismo turquesa 4Life
    'sistema-inmunologico':  '#2dd4bf', // mismo turquesa 4Life
    'energia-vitalidad':     '#2dd4bf', // mismo turquesa 4Life
    'salud-digestiva':       '#2dd4bf', // mismo turquesa 4Life
    'postres':                '#ff6ec7', // magenta postres
    'accesorios':             '#ff5555', // rojo de la identidad actual
    'refaccionaria':          '#f97316', // naranja de refaccionaria
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

let productsCatalog = [];

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeJsString(value) {
    return String(value || '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ');
}

const AUTH_USERS_KEY = 'polarcsx_users';
const AUTH_ACTIVE_USER_KEY = 'polarcsx_active_user';

function getStoredUsers() {
    try {
        return JSON.parse(localStorage.getItem(AUTH_USERS_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function saveStoredUsers(users) {
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function getActiveUser() {
    try {
        return JSON.parse(localStorage.getItem(AUTH_ACTIVE_USER_KEY));
    } catch (error) {
        return null;
    }
}

function saveActiveUser(user) {
    localStorage.setItem(AUTH_ACTIVE_USER_KEY, JSON.stringify(user));
}

function clearActiveUser() {
    localStorage.removeItem(AUTH_ACTIVE_USER_KEY);
}

function showAuthMessage(message, type = 'error') {
    const messageBox = document.getElementById('auth-message');
    if (!messageBox) return;
    messageBox.textContent = message;
    messageBox.className = `auth-message ${type}`;
}

function setAuthMode(mode) {
    const tabs = document.querySelectorAll('.auth-tab');
    const nameGroup = document.getElementById('auth-name-group');
    const submitBtn = document.getElementById('auth-submit-btn');
    const title = document.getElementById('auth-modal-title');

    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    if (nameGroup) {
        nameGroup.style.display = mode === 'register' ? 'flex' : 'none';
    }

    if (submitBtn) {
        submitBtn.textContent = mode === 'register' ? 'Crear cuenta' : 'Entrar';
    }

    if (title) {
        title.textContent = mode === 'register' ? 'Crear tu cuenta' : 'Iniciar sesión';
    }

    showAuthMessage('');
}

function openAuthModal(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setAuthMode(mode);
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function updateAuthUI() {
    const authBtn = document.getElementById('auth-btn');
    const logoutBtn = document.getElementById('auth-logout-btn');
    const activeUser = getActiveUser();

    if (authBtn) {
        authBtn.innerHTML = '<i class="fa-solid fa-user"></i><span id="auth-btn-label"></span>';
    }

    const btnLabel = document.getElementById('auth-btn-label');
    if (btnLabel) {
        btnLabel.textContent = activeUser ? `Hola, ${activeUser.name.split(' ')[0]}` : 'Iniciar sesión';
    }

    if (logoutBtn) {
        logoutBtn.style.display = activeUser ? 'inline-flex' : 'none';
    }
}

function logoutUser() {
    clearActiveUser();
    updateAuthUI();
    closeAuthModal();
    showAuthMessage('Sesión cerrada correctamente.', 'success');
}

function handleAuthFormSubmit(event) {
    event.preventDefault();

    const mode = document.querySelector('.auth-tab.active')?.dataset.mode || 'login';
    const nameInput = document.getElementById('auth-name');
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!email || !password) {
        showAuthMessage('Completa el correo y la contraseña.', 'error');
        return;
    }

    if (mode === 'register') {
        if (!name) {
            showAuthMessage('Agrega tu nombre para crear la cuenta.', 'error');
            return;
        }

        if (password.length < 6) {
            showAuthMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
            return;
        }

        const users = getStoredUsers();
        if (users.some(user => user.email === email)) {
            showAuthMessage('Ese correo ya está registrado.', 'error');
            return;
        }

        const newUser = { name, email, password };
        users.push(newUser);
        saveStoredUsers(users);
        saveActiveUser(newUser);
        updateAuthUI();
        closeAuthModal();
        showAuthMessage('Cuenta creada correctamente.', 'success');
        return;
    }

    const users = getStoredUsers();
    const matchedUser = users.find(user => user.email === email && user.password === password);

    if (!matchedUser) {
        showAuthMessage('Correo o contraseña incorrectos.', 'error');
        return;
    }

    saveActiveUser(matchedUser);
    updateAuthUI();
    closeAuthModal();
    showAuthMessage('Bienvenido de nuevo.', 'success');
}

function initializeAuth() {
    const authBtn = document.getElementById('auth-btn');
    const logoutBtn = document.getElementById('auth-logout-btn');
    const tabs = document.querySelectorAll('.auth-tab');
    const authForm = document.getElementById('auth-form');

    if (authBtn) {
        authBtn.addEventListener('click', () => {
            openAuthModal('login');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => setAuthMode(tab.dataset.mode));
    });

    if (authForm) {
        authForm.addEventListener('submit', handleAuthFormSubmit);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeAuthModal();
        }
    });

    updateAuthUI();
}

function createProductCard(product) {
    const priceText = product.price || '$0.00 MXN*';
    const priceNumber = parsePriceText(priceText);
    const descriptionHtml = escapeHtml(product.description || '').replace(/\n/g, '<br>');
    const noteHtml = product.note ? `<p><small><em>${escapeHtml(product.note)}</em></small></p>` : '';
    const imageHtml = product.imageSrc
        ? `<div class="product-image-container"><img src="${escapeHtml(product.imageSrc)}" alt="${escapeHtml(product.title)}" class="product-img" loading="lazy"></div>`
        : `<div class="product-image-container placeholder"><span>Imagen disponible</span></div>`;

    return `
        <div class="product-card" data-category="${escapeHtml(product.category)}" data-product-id="${escapeHtml(product.id)}">
            <div class="product-summary">
                ${imageHtml}
                <div class="product-basic-info">
                    <h3>${escapeHtml(product.title)}</h3>
                    <p class="product-subtitle">${escapeHtml(product.subtitle)}</p>
                    <p class="price">${escapeHtml(priceText)}</p>
                </div>
                <span class="expand-icon"><i class="fa-solid fa-chevron-down"></i></span>
            </div>
            <div class="product-details">
                <div class="details-content">
                    <p class="description">${descriptionHtml}</p>
                    ${noteHtml}
                    <button class="buy-btn" onclick="addToCart('${escapeJsString(product.title)}', ${priceNumber}, '${escapeJsString(product.id)}')">
                        Añadir al carrito
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderProductsGrid() {
    const container = document.querySelector('.products-grid');
    if (!container) return;
    container.innerHTML = '';

    productsCatalog.forEach(product => {
        const productCardHtml = createProductCard(product);
        container.insertAdjacentHTML('beforeend', productCardHtml);
    });
}

async function loadProducts() {
    const container = document.querySelector('.products-grid');
    if (!container) return;

    try {
        const response = await fetch('productos.json', { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        productsCatalog = await response.json();
    } catch (error) {
        console.error('Error cargando productos:', error);
        container.innerHTML = '<p class="load-error">No se pudieron cargar los productos. Vuelve a cargar la página o revisa tu conexión.</p>';
        return;
    }

    renderProductsGrid();
    sortProductsByCategory();
    decorateProductCards();
    applyCategoryColors();
    filterCategory('all');
    initializeProductViewer();
    addPriceBadges();
}

function sortProductsByCategory() {
    const order = ['accesorios', '4life', 'refaccionaria', 'hogar-extras', 'servicios'];
    const container = document.querySelector('.products-grid');
    if (!container) return;

    const cards = Array.from(container.querySelectorAll('.product-card'));
    cards.sort((a, b) => {
        const indexA = order.indexOf(a.dataset.category) >= 0 ? order.indexOf(a.dataset.category) : order.length;
        const indexB = order.indexOf(b.dataset.category) >= 0 ? order.indexOf(b.dataset.category) : order.length;
        return indexA - indexB;
    });

    cards.forEach(card => container.appendChild(card));
}

function decorateProductCards() {
    document.querySelectorAll('.product-card').forEach(card => {
        const subtitle = card.querySelector('.product-subtitle');
        if (!subtitle) return;

        const detailsContent = card.querySelector('.details-content');
        const priceEl = card.querySelector('.product-summary .price');
        if (detailsContent && priceEl && !card.querySelector('.details-price')) {
            const detailsPrice = document.createElement('p');
            detailsPrice.className = 'details-price';
            detailsPrice.textContent = priceEl.textContent.trim();
            detailsContent.insertBefore(detailsPrice, detailsContent.firstChild);
        }
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

    // Extract description — soporta dos formatos de tarjeta:
    // 1) 4Life: <div class="product-description"> con <p> y <small> adentro.
    // 2) Tecnología/otros: <p class="description"> y <small><em> sueltos, sin wrapper.
    // Antes solo se leía el formato 1, por eso Tecnología se veía sin texto en el visor.
    const descriptionWrapEl = cardElement.querySelector('.product-description');
    let description = '';
    let note = '';
    if (descriptionWrapEl) {
        const paraEl = descriptionWrapEl.querySelector('p:first-of-type');
        description = paraEl?.innerHTML.trim() || '';
        const noteEl = descriptionWrapEl.querySelector('small');
        note = noteEl?.textContent.trim() || '';
    } else {
        const simpleDescEl = cardElement.querySelector('p.description');
        description = simpleDescEl?.innerHTML.trim() || '';
        const simpleNoteEl = cardElement.querySelector('.details-content small');
        note = simpleNoteEl?.textContent.trim() || '';
    }

    // Extract benefits (ul with li items) — solo existe en formato 4Life
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
        'refaccionaria': 'Refaccionaria',
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

    // SERVICIOS usa su propia plantilla simple: sin precio, sin cantidad,
    // sin "comprar ahora" — un servicio se cotiza, no se compra con un clic.
    if (productData.category === formatCategoryLabel('servicios')) {
        modalBody.innerHTML = `
            <div class="viewer-card viewer-card-servicio">
                <div class="viewer-info viewer-info-servicio">
                    <div class="viewer-header">
                        <span class="viewer-category">${productData.category}</span>
                        <h2 class="viewer-title">${productData.title}</h2>
                    </div>

                    <div class="viewer-trust-badge">
                        <span class="viewer-trust-check">✓</span>
                        Atendido directamente por <strong>Polarcsx</strong>
                    </div>

                    <div class="viewer-description">${productData.description}</div>

                    <div class="viewer-actions">
                        <button class="viewer-buy-btn" onclick="window.open('https://wa.me/529361577100?text=' + encodeURIComponent('Hola, quiero cotizar: ${productData.title.replace(/'/g, "\\'")}'), '_blank')">
                            <i class="fa-brands fa-whatsapp"></i> Solicitar cotización por WhatsApp
                        </button>
                    </div>

                    <p class="viewer-hint">Presiona la X para cerrar este panel.</p>
                </div>
            </div>
        `;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        viewerState.isOpen = true;
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

    // Build brand link button HTML (Tecnología — solo si está configurado)
    let brandLinkHtml = '';
    const brandInfo = BRAND_LINKS[productData.id];
    if (brandInfo && brandInfo.link) {
        brandLinkHtml = `
            <a class="viewer-brand-btn" href="${brandInfo.link}" target="_blank" rel="noopener noreferrer">
                <i class="fa-solid fa-shield-halved"></i>
                <span>Ver más de ${brandInfo.brand}, marca oficial</span>
            </a>
        `;
    }

    // Render complete viewer
    viewerState.currentQty = 1;
    modalBody.innerHTML = `
        <div class="viewer-card">
            <div class="viewer-image-section">
                <div class="viewer-image">
                    <img src="${productData.imageSrc}" alt="${productData.title}">
                </div>
                <button class="viewer-close-circle" onclick="closeProductViewer()" aria-label="Cerrar visor">
                    <img src="img/logo.jpeg" alt="Polarcsx logo" class="viewer-close-logo">
                </button>
                <div class="viewer-gallery-placeholder">
                    <span>Espacio para imágenes adicionales</span>
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
                ${brandLinkHtml}
                
                <div class="viewer-description">${productData.description}</div>
                
                ${benefitsHtml}
                
                ${productData.note ? `<p class="viewer-note">${productData.note}</p>` : ''}

                <div class="viewer-perks">
                    <span><i class="fa-solid fa-truck-fast"></i> Envío a todo México</span>
                    <span><i class="fa-solid fa-lock"></i> Pago seguro</span>
                    <span><i class="fa-brands fa-whatsapp"></i> Soporte directo</span>
                </div>

                <div class="viewer-actions">
                    <button class="viewer-viewcart-btn" onclick="openCartModal()">
                        Ver Carrito
                    </button>
                    <button class="viewer-cart-btn" onclick="addToCart('${productData.title.replace(/'/g, "\\'")}', ${productData.price}, '${productData.id}', viewerState.currentQty); this.textContent='✓ Añadido';setTimeout(()=>{this.textContent='Añadir al carrito';},1500);">
                        Añadir al carrito
                    </button>
                    <button class="viewer-buy-btn" onclick="buyNowWhatsApp('${productData.title.replace(/'/g, "\\'")}', ${productData.price}, viewerState.currentQty)">
                        Comprar ahora
                    </button>
                </div>
                <div class="viewer-qty-controls">
                    <button class="qty-btn" onclick="changeViewerQty(-1)">−</button>
                    <span id="viewer-qty-value" class="qty-value">1</span>
                    <button class="qty-btn" onclick="changeViewerQty(1)">+</button>
                </div>
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


let currentCategory = 'all';
let currentSearchTerm = '';

function filterCategory(category) {
    currentCategory = category;
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(button => {
        button.classList.toggle('active', button.dataset.category === category);
    });
    applyProductFilters();
}

function searchProducts(term) {
    currentSearchTerm = term.trim().toLowerCase();
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) {
        clearBtn.style.display = currentSearchTerm ? '' : 'none';
    }
    applyProductFilters();
}

function clearSearch() {
    const input = document.getElementById('product-search');
    if (input) input.value = '';
    searchProducts('');
}

// Combina el filtro de categoría activo con el texto de búsqueda.
// Ambos se aplican juntos: si buscas "cargador" con la categoría "4life"
// activa, solo verás cargadores dentro de 4life (o nada, si no hay).
function applyProductFilters() {
    const cards = document.querySelectorAll('.product-card');
    let visibleCount = 0;

    cards.forEach(card => {
        const cardCategory = card.dataset.category;
        const details = card.querySelector('.product-details');

        const matchesCategory = currentCategory === 'all'
            || cardCategory === currentCategory
            || (currentCategory === '4life' && FOURLIFE_FAMILY.has(cardCategory));

        let matchesSearch = true;
        if (currentSearchTerm) {
            const title = card.querySelector('h3');
            const subtitle = card.querySelector('.product-subtitle');
            const text = ((title ? title.textContent : '') + ' ' + (subtitle ? subtitle.textContent : ''))
                .toLowerCase();
            matchesSearch = text.includes(currentSearchTerm);
        }

        const matches = matchesCategory && matchesSearch;

        if (matches) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
            card.classList.remove('active');
            if (details) {
                details.style.maxHeight = null;
            }
        }
    });

    const emptyMsg = document.getElementById('search-empty-msg');
    if (emptyMsg) {
        emptyMsg.style.display = (currentSearchTerm && visibleCount === 0) ? '' : 'none';
    }
}

// Inicializa mostrando todos los productos al cargar la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadProducts();
        updateCartUI();
        initializeLogoScroll();
        initCookieBanner();
        initializeAuth();
        initFabCartVisibility();
        registerServiceWorker();
    });
} else {
    loadProducts();
    updateCartUI();
    initializeLogoScroll();
    initCookieBanner();
    initializeAuth();
    initFabCartVisibility();
    registerServiceWorker();
}

// ========================================
// BOTÓN FLOTANTE — INSTALAR APP (PWA)
// Chrome/Android disparan "beforeinstallprompt" solo cuando el sitio
// cumple los requisitos de instalación. Antes de eso no hay nada que
// mostrar — por eso el botón empieza oculto en el HTML.
// ========================================
let deferredInstallPrompt = null;

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Si no se puede registrar el service worker, no rompemos la página.
        });
    }
}

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

function initFabCartVisibility() {
    const productsGrid = document.querySelector('.products-grid');
    const fabCart = document.getElementById('fab-cart-btn');
    if (!productsGrid || !fabCart) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            fabCart.style.display = entry.isIntersecting ? 'flex' : 'none';
        });
    }, {
        threshold: 0.1
    });

    observer.observe(productsGrid);
}