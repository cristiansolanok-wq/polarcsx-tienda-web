const products = [
  {
    id: 'postres',
    name: 'Postre Clásico',
    category: 'Postres',
    description: 'Deliciosos postres caseros con sabor auténtico y presentación premium.',
    price: 'S/ 45.90',
    image: 'img/postres.jpg',
    whatsappMessage: 'Hola, quiero comprar el postre clásico de Polarcsx Store. ¿Está disponible?'
  },
  {
    id: 'accesorios',
    name: 'Accesorio Gamer',
    category: 'Accesorios',
    description: 'Teclado y mouse con iluminación RGB para una experiencia de juego profesional.',
    price: 'S/ 120.00',
    image: 'img/accesorios.jpg',
    whatsappMessage: 'Hola, quiero comprar el accesorio gamer de Polarcsx Store. ¿Me ayudas con el pedido?'
  },
  {
    id: 'servicios',
    name: 'Servicio Web',
    category: 'Servicios',
    description: 'Diseño web y soporte técnico para tu proyecto digital en tiempo récord.',
    price: 'S/ 299.00',
    image: 'img/servicios.jpg',
    whatsappMessage: 'Hola, quiero contratar el servicio web de Polarcsx Store. ¿Podrían enviarme más detalles?'
  }
];

function buildAccordionCard(product) {
  const card = document.createElement('article');
  card.className = 'accordion-card';
  card.dataset.productId = product.id;

  const header = document.createElement('button');
  header.type = 'button';
  header.className = 'accordion-card-header';
  header.id = `header-${product.id}`;
  header.setAttribute('aria-expanded', 'false');
  header.setAttribute('aria-controls', `panel-${product.id}`);

  header.innerHTML = `
    <div class="card-summary">
      <img src="${product.image}" alt="${product.category}" />
      <div class="card-text">
        <span class="product-badge">${product.category}</span>
        <h3>${product.name}</h3>
        <p class="product-short">${product.description}</p>
      </div>
    </div>
    <div class="card-right">
      <p class="precio">${product.price}</p>
      <span class="accordion-arrow">›</span>
    </div>
  `;

  const body = document.createElement('div');
  body.className = 'accordion-card-body';
  body.id = `panel-${product.id}`;
  body.setAttribute('role', 'region');
  body.setAttribute('aria-labelledby', header.id);

  body.innerHTML = `
    <p class="product-details">${product.description} Disfruta de entrega rápida y atención personalizada por WhatsApp.</p>
    <button type="button" class="btn-whatsapp">Comprar</button>
  `;

  header.addEventListener('click', () => toggleCard(card, body, header));

  const actionButton = body.querySelector('.btn-whatsapp');
  actionButton.addEventListener('click', () => {
    const phone = '529361577100';
    const message = encodeURIComponent(product.whatsappMessage);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  });

  card.appendChild(header);
  card.appendChild(body);
  return card;
}

function toggleCard(card, body, header) {
  const isOpen = header.getAttribute('aria-expanded') === 'true';
  const accordion = document.getElementById('productAccordion');
  const allCards = accordion.querySelectorAll('.accordion-card');

  allCards.forEach(otherCard => {
    const otherHeader = otherCard.querySelector('.accordion-card-header');
    const otherBody = otherCard.querySelector('.accordion-card-body');
    if (otherBody !== body) {
      otherHeader.setAttribute('aria-expanded', 'false');
      otherBody.style.maxHeight = null;
      otherCard.classList.remove('open');
      otherBody.classList.remove('open');
    }
  });

  if (!isOpen) {
    header.setAttribute('aria-expanded', 'true');
    card.classList.add('open');
    body.classList.add('open');
    body.style.maxHeight = body.scrollHeight + 'px';
  } else {
    header.setAttribute('aria-expanded', 'false');
    card.classList.remove('open');
    body.classList.remove('open');
    body.style.maxHeight = null;
  }
}

function renderAccordion() {
  const container = document.getElementById('productAccordion');
  if (!container) return;
  products.forEach(product => container.appendChild(buildAccordionCard(product)));
}

function initSlider() {
  const slider = document.querySelector('.sliderBlock_items');
  if (!slider) return;

  const slides = slider.querySelectorAll('.sliderBlock_items__itemPhoto');
  const next = document.querySelector('.sliderBlock_controls__arrowForward');
  const previous = document.querySelector('.sliderBlock_controls__arrowBackward');
  const paginator = document.querySelector('.sliderBlock_positionControls');
  const dots = paginator ? Array.from(paginator.children) : [];

  let currentSlide = 0;
  let slideInterval = setInterval(nextSlide, 5000);

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function previousSlide() {
    goToSlide(currentSlide - 1);
  }

  function goToSlide(n) {
    slides[currentSlide].classList.remove('sliderBlock_items__showing');
    if (dots[currentSlide]) dots[currentSlide].classList.remove('sliderBlock_positionControls__active');

    currentSlide = (n + slides.length) % slides.length;

    slides[currentSlide].classList.add('sliderBlock_items__showing');
    if (dots[currentSlide]) dots[currentSlide].classList.add('sliderBlock_positionControls__active');
  }

  function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 5000);
  }

  if (next) next.addEventListener('click', () => { nextSlide(); resetInterval(); });
  if (previous) previous.addEventListener('click', () => { previousSlide(); resetInterval(); });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      resetInterval();
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  renderAccordion();
  initSlider();
});
