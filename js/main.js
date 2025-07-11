// --- APP STATE & ROUTING ---
let cart = [];
let currentPage = 'home';
let currentCarouselSlide = 0;

const mainContent = document.getElementById('main-content');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const modal = document.getElementById('quick-view-modal');
const modalContent = document.getElementById('quick-view-content');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

function navigateTo(page, param) {
    currentPage = page;
    window.scrollTo(0, 0);
    renderPage(param);
    updateActiveNav();
    if (!mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
    }
}

function updateActiveNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.dataset.page === currentPage) {
            link.classList.add('active-nav');
        } else {
            link.classList.remove('active-nav');
        }
    });
}

// --- MAIN RENDER DISPATCHER ---
function renderPage(param) {
    switch (currentPage) {
        case 'home':
            mainContent.innerHTML = renderHomePage();
            startCarousel();
            break;
        case 'catalog':
            mainContent.innerHTML = renderCatalogPage();
            applyFilters(); // Apply filters on initial load
            break;
        case 'product':
            mainContent.innerHTML = renderProductPage(param);
            break;
        case 'subscriptions':
            mainContent.innerHTML = renderSubscriptionsPage();
            break;
        case 'blog':
            mainContent.innerHTML = renderBlogPage();
            break;
        case 'blog-post':
            mainContent.innerHTML = renderBlogPostPage(param);
            break;
        case 'about':
            mainContent.innerHTML = renderAboutPage();
            break;
        case 'faq':
            mainContent.innerHTML = renderFaqPage();
            break;
        case 'checkout':
            mainContent.innerHTML = renderCheckoutPage(param);
            break;
    }
}

// --- FILTER & CATALOG LOGIC ---
function applyFilters() {
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category-filter"]:checked')).map(cb => cb.value);
    const selectedAttributes = Array.from(document.querySelectorAll('input[name="attribute-filter"]:checked')).map(cb => cb.value);
    const maxPrice = document.getElementById('price-filter').value;
    const sortOrder = document.getElementById('sort-order').value;

    let filteredProducts = db.products;

    if (selectedCategories.length > 0) {
        filteredProducts = filteredProducts.filter(p => selectedCategories.includes(p.category));
    }
    if (selectedAttributes.length > 0) {
        filteredProducts = filteredProducts.filter(p => selectedAttributes.every(attr => p.attributes.includes(attr)));
    }
    filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
    
    if (sortOrder === 'price-asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    renderProductGrid(filteredProducts);
}

function renderProductGrid(products) {
    const gridContainer = document.getElementById('product-grid-container');
    if (!gridContainer) return;

    if (products.length === 0) {
        gridContainer.innerHTML = `<p class="col-span-full text-center text-gray-500">No se encontraron productos que coincidan con tu búsqueda.</p>`;
        return;
    }
    gridContainer.innerHTML = products.map(renderProductCard).join('');
}

function updatePriceLabel(value) {
    document.getElementById('price-label').textContent = `Hasta ${formatCurrency(value)}`;
}


// --- CART LOGIC ---
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-item-count').textContent = count;
}

function addToCart(productId, quantity = 1) {
    const product = db.products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity += quantity;
    } else {
        cart.push({ ...product, quantity: quantity });
    }
    updateCartCount();
    showToast(`${product.name} agregado al carrito`);
    if (currentPage === 'checkout') {
        renderPage(1); // Re-render cart view
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    if (currentPage === 'checkout') {
        renderPage(1); // Re-render cart view
    }
}

function addIngredientsToCart(ingredientIds) {
    ingredientIds.forEach(id => addToCart(id));
    showToast('Ingredientes agregados al carrito');
}

// --- UI UTILITIES (Toast, Carousel, Modal) ---
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 right-6 bg-gray-900 text-white py-2 px-4 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function startCarousel() {
    const items = document.querySelectorAll('.carousel-item');
    const dotsContainer = document.getElementById('carousel-dots');
    if (!items.length || !dotsContainer) return;

    dotsContainer.innerHTML = '';
    items.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'w-3 h-3 rounded-full';
        dot.dataset.index = index;
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('button');

    function showSlide(index) {
        items.forEach((item, i) => item.classList.toggle('active', i === index));
        dots.forEach((dot, i) => {
            dot.classList.toggle('bg-white', i === index);
            dot.classList.toggle('bg-white/50', i !== index);
        });
        currentCarouselSlide = index;
    }

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => showSlide(parseInt(e.target.dataset.index)));
    });

    setInterval(() => {
        let nextSlide = (currentCarouselSlide + 1) % items.length;
        showSlide(nextSlide);
    }, 5000);
    
    showSlide(0);
}

function openModal(productId) {
    const product = db.products.find(p => p.id === productId);
    if (!product) return;

    modalContent.innerHTML = `
        <button onclick="closeModal()" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <img src="${product.image}" alt="${product.name}" class="w-full rounded-lg object-cover aspect-square">
            <div>
                <h2 class="text-2xl font-bold">${product.name}</h2>
                <p class="text-xl font-semibold text-blue-600 my-2">${formatCurrency(product.price)} / Libra</p>
                <p class="text-gray-600 mb-4">${product.description.substring(0, 100)}...</p>
                <button onclick="navigateTo('product', ${product.id}); closeModal();" class="text-blue-600 font-semibold mb-4">Ver detalles completos &rarr;</button>
                <div class="flex items-center space-x-4">
                    <input type="number" value="1" class="w-16 p-2 border rounded-md">
                    <button onclick="addToCart(${product.id}); closeModal();" class="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700">Agregar al Carrito</button>
                </div>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    navigateTo('home');
});