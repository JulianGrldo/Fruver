// --- PAGE TEMPLATES / VIEW RENDERERS ---

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
}

function renderHomePage() {
    return `
        <section class="relative h-96 md:h-[500px] rounded-lg overflow-hidden shadow-lg mb-12">
            ${renderCarousel()}
            <div class="absolute bottom-5 left-1/2 -translate-x-1/2 flex space-x-2 z-20" id="carousel-dots"></div>
        </section>

        <section class="mb-16">
            <h2 class="section-title">Categorías Populares</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                ${renderCategoryCard('Frutas para Jugo', 'https://placehold.co/300x200/FBBF24/ffffff?text=Frutas')}
                ${renderCategoryCard('Verduras para Ensalada', 'https://placehold.co/300x200/86EFAC/ffffff?text=Verduras')}
                ${renderCategoryCard('Esenciales de la Semana', 'https://placehold.co/300x200/FDE047/ffffff?text=Esenciales')}
                ${renderCategoryCard('Orgánicos Certificados', 'https://placehold.co/300x200/A3E635/ffffff?text=Orgánicos')}
            </div>
        </section>

        <section class="mb-16">
            <h2 class="section-title">Lo Más Fresco de Hoy</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                ${db.products.slice(0, 4).map(renderProductCard).join('')}
            </div>
        </section>

        <section class="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-8 md:p-12 text-center mb-16 shadow-xl">
            <h2 class="text-3xl md:text-4xl font-bold mb-2">Crea Tu Canasta Perfecta</h2>
            <p class="text-lg md:text-xl mb-6 max-w-2xl mx-auto">Ahorra tiempo, come más sano y apoya lo local con nuestras canastas programadas.</p>
            <button onclick="navigateTo('subscriptions')" class="bg-white text-blue-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-100 transition transform hover:scale-105">
                Quiero mi Canasta Programada
            </button>
        </section>

        <section>
            <h2 class="section-title">Recetas para Inspirarte</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                ${db.blogPosts.map(post => `
                    <div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer" onclick="navigateTo('blog-post', ${post.id})">
                        <img src="${post.image}" alt="${post.title}" class="w-full h-48 object-cover">
                        <div class="p-6">
                            <h3 class="font-bold text-xl mb-2 text-gray-800">${post.title}</h3>
                            <span class="text-blue-600 font-semibold hover:underline">Ver receta &rarr;</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

function renderCatalogPage() {
    const categories = [...new Set(db.products.map(p => p.category))];
    const attributes = [...new Set(db.products.flatMap(p => p.attributes))];
    const maxPrice = Math.max(...db.products.map(p => p.price));

    return `
        <div class="flex flex-col md:flex-row gap-8">
            <aside class="w-full md:w-1/4 lg:w-1/5">
                <h2 class="text-2xl font-bold mb-4">Filtros</h2>
                <div class="space-y-6">
                    <div>
                        <h3 class="font-semibold mb-2">Categoría</h3>
                        <ul class="space-y-1">
                            ${categories.map(cat => `
                                <li><label class="flex items-center"><input type="checkbox" name="category-filter" value="${cat}" onchange="applyFilters()" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"> <span class="ml-2 text-gray-700">${cat}</span></label></li>
                            `).join('')}
                        </ul>
                    </div>
                    <div>
                        <h3 class="font-semibold mb-2">Precio</h3>
                        <input type="range" id="price-filter" min="0" max="${maxPrice}" value="${maxPrice}" oninput="updatePriceLabel(this.value)" onchange="applyFilters()" class="w-full">
                        <div class="text-sm text-gray-600 text-right" id="price-label">Hasta ${formatCurrency(maxPrice)}</div>
                    </div>
                    <div>
                        <h3 class="font-semibold mb-2">Atributos</h3>
                        <ul class="space-y-1">
                            ${attributes.map(attr => `
                                <li><label class="flex items-center"><input type="checkbox" name="attribute-filter" value="${attr}" onchange="applyFilters()" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"> <span class="ml-2 text-gray-700">${attr}</span></label></li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </aside>

            <main class="w-full md:w-3/4 lg:w-4/5">
                <div class="flex justify-between items-center mb-4">
                    <h1 class="text-3xl font-bold">Todos los Productos</h1>
                    <select id="sort-order" onchange="applyFilters()" class="rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50">
                        <option value="popularity">Popularidad</option>
                        <option value="price-asc">Precio: Menor a Mayor</option>
                        <option value="price-desc">Precio: Mayor a Menor</option>
                    </select>
                </div>
                <div id="product-grid-container" class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    </div>
            </main>
        </div>
    `;
}

function renderProductPage(id) {
    const product = db.products.find(p => p.id === id);
    if (!product) return `<p>Producto no encontrado.</p>`;
    return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div>
                <img src="${product.image}" alt="${product.name}" class="w-full rounded-lg shadow-lg aspect-square object-cover">
                <div class="grid grid-cols-4 gap-2 mt-4">
                    <img src="${product.image}" class="border-2 border-blue-500 rounded-md cursor-pointer">
                    <img src="https://placehold.co/100x100/CCCCCC/ffffff?text=+" class="border rounded-md cursor-pointer opacity-70 hover:opacity-100">
                    <img src="https://placehold.co/100x100/CCCCCC/ffffff?text=+" class="border rounded-md cursor-pointer opacity-70 hover:opacity-100">
                    <img src="https://placehold.co/100x100/CCCCCC/ffffff?text=+" class="border rounded-md cursor-pointer opacity-70 hover:opacity-100">
                </div>
            </div>

            <div>
                <h1 class="text-4xl font-bold text-gray-800 mb-2">${product.name}</h1>
                <p class="text-3xl font-semibold text-blue-600 mb-4">${formatCurrency(product.price)} / Libra</p>
                <p class="text-gray-600 mb-6">${product.description}</p>
                
                <div class="mb-6">
                    <label class="font-bold text-gray-700">Selector de Madurez:</label>
                    <div class="flex space-x-2 mt-2">
                        <button class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md">Para Hoy</button>
                        <button class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md">Para 2-3 días</button>
                    </div>
                </div>

                <div class="flex items-center space-x-4 mb-6">
                    <div class="flex items-center border border-gray-300 rounded-md">
                        <button class="px-3 py-2 text-lg font-bold">-</button>
                        <span class="px-4 py-2">1</span>
                        <button class="px-3 py-2 text-lg font-bold">+</button>
                    </div>
                    <button onclick="addToCart(${product.id})" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md text-lg transition transform hover:scale-105">
                        Agregar al Carrito
                    </button>
                </div>
                
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
                    <h3 class="font-bold text-lg text-green-800 mb-2">Origen del Producto</h3>
                    <div class="flex items-center gap-4">
                        <img src="https://placehold.co/80x80/22C55E/ffffff?text=Finca" class="rounded-full w-20 h-20 object-cover border-2 border-white shadow-sm">
                        <div>
                            <p class="text-gray-700"><strong>Agricultor:</strong> ${product.farmer}</p>
                            <p class="text-gray-700"><strong>Finca:</strong> ${product.farm}</p>
                            <p class="text-gray-700"><strong>Ubicación:</strong> ${product.location}, Antioquia</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-16">
             </div>
        
        <section class="mt-16">
            <h2 class="section-title">Completa tu Compra</h2>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                ${db.products.filter(p => p.id !== product.id).slice(0, 4).map(renderProductCard).join('')}
            </div>
        </section>
    `;
}

function renderSubscriptionsPage() {
    return `
        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-800">Canastas Programadas</h1>
            <p class="text-xl text-gray-600 mt-2">Tu frescura semanal, garantizada. Sin complicaciones.</p>
        </div>

        <section class="mb-16 bg-white p-8 rounded-lg shadow-md">
            <h2 class="section-title">¿Cómo Funciona?</h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div class="flex flex-col items-center">
                    <div class="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4">1</div>
                    <h3 class="font-bold text-lg mb-2">Elige tu Tamaño</h3>
                    <p class="text-gray-600">Selecciona la canasta que mejor se adapte a tu hogar.</p>
                </div>
                <div class="flex flex-col items-center">
                    <div class="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4">2</div>
                    <h3 class="font-bold text-lg mb-2">Define la Frecuencia</h3>
                    <p class="text-gray-600">Recibe tus productos cada semana, quincena o mes.</p>
                </div>
                <div class="flex flex-col items-center">
                    <div class="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4">3</div>
                    <h3 class="font-bold text-lg mb-2">Personaliza tus Gustos</h3>
                    <p class="text-gray-600">Indícanos qué te encanta y qué prefieres no recibir.</p>
                </div>
                <div class="flex flex-col items-center">
                    <div class="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4">4</div>
                    <h3 class="font-bold text-lg mb-2">Recibe y Disfruta</h3>
                    <p class="text-gray-600">La frescura del campo llega directamente a tu puerta.</p>
                </div>
            </div>
        </section>

        <section class="mb-16">
            <h2 class="section-title">Nuestras Canastas</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                ${renderSubscriptionCard('Pequeña', '1-2 personas', 70000, ['5-7 variedades de fruta', '6-8 variedades de verdura'])}
                ${renderSubscriptionCard('Mediana', '2-4 personas', 110000, ['7-9 variedades de fruta', '8-10 variedades de verdura', '1 hierba aromática'], true)}
                ${renderSubscriptionCard('Grande', '4+ personas', 150000, ['9-12 variedades de fruta', '10-14 variedades de verdura', '2 hierbas aromáticas'])}
            </div>
        </section>
        
        <section class="bg-white p-8 rounded-lg shadow-md">
            <h2 class="section-title">Personaliza tu Experiencia</h2>
            <div class="max-w-2xl mx-auto">
                <div class="mb-6">
                    <label class="font-bold text-lg text-gray-700">Productos que <span class="text-red-600">NUNCA</span> quieres recibir:</label>
                    <p class="text-gray-500 mb-2">Nos aseguraremos de no incluirlos en tu canasta.</p>
                    <input type="text" placeholder="Ej: Remolacha, apio..." class="w-full p-2 border border-gray-300 rounded-md">
                </div>
                <div>
                    <label class="font-bold text-lg text-gray-700">Tus productos <span class="text-green-600">FAVORITOS</span>:</label>
                    <p class="text-gray-500 mb-2">Priorizaremos estos productos cuando estén en temporada.</p>
                    <input type="text" placeholder="Ej: Aguacate, mango, fresas..." class="w-full p-2 border border-gray-300 rounded-md">
                </div>
            </div>
        </section>
    `;
}

function renderBlogPage() {
    return `
        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-800">Blog & Recetas</h1>
            <p class="text-xl text-gray-600 mt-2">Inspiración para llevar la frescura del campo a tu plato.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${db.blogPosts.map(post => `
                <div class="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer" onclick="navigateTo('blog-post', ${post.id})">
                    <img src="${post.image}" alt="${post.title}" class="w-full h-56 object-cover">
                    <div class="p-6">
                        <h3 class="font-bold text-xl mb-2 text-gray-800">${post.title}</h3>
                        <p class="text-gray-600 mb-4">Descubre cómo preparar este delicioso plato con ingredientes frescos de nuestras fincas aliadas.</p>
                        <span class="text-blue-600 font-semibold hover:underline">Leer más &rarr;</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderBlogPostPage(id) {
    const post = db.blogPosts.find(p => p.id === id);
    if (!post) return `<p>Artículo no encontrado.</p>`;
    
    const ingredients = post.ingredients.map(ingId => db.products.find(p => p.id === ingId));

    return `
        <div class="bg-white p-6 md:p-10 rounded-lg shadow-xl max-w-4xl mx-auto">
            <h1 class="text-4xl font-bold text-gray-800 mb-4">${post.title}</h1>
            <img src="${post.image}" alt="${post.title}" class="w-full h-96 object-cover rounded-lg mb-8">

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2">
                    <h2 class="text-2xl font-bold mb-4">Instrucciones</h2>
                    <div class="prose max-w-none text-gray-700 space-y-4">
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                        <p><strong>Paso 1:</strong> Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                        <p><strong>Paso 2:</strong> Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.</p>
                        <p><strong>Paso 3:</strong> Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam.</p>
                    </div>
                </div>
                <div>
                    <div class="bg-gray-100 p-6 rounded-lg sticky top-24">
                        <h3 class="text-xl font-bold mb-4">Ingredientes Frescos</h3>
                        <ul class="space-y-3">
                            ${ingredients.map(ing => `
                                <li class="flex justify-between items-center">
                                    <span class="text-gray-800">${ing.name}</span>
                                    <button onclick="addToCart(${ing.id})" class="text-blue-600 hover:text-blue-800 text-sm font-semibold">Agregar</button>
                                </li>
                            `).join('')}
                        </ul>
                        <button onclick="addIngredientsToCart([${post.ingredients.join(',')}])" class="w-full mt-6 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700">
                            Agregar Todo al Carrito
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderAboutPage() {
    return `
        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-800">Sobre Nosotros</h1>
            <p class="text-xl text-gray-600 mt-2 max-w-3xl mx-auto">Somos el puente directo entre los agricultores apasionados de Antioquia y tu mesa. Creemos en la comida real, transparente y llena de sabor.</p>
        </div>
        
        <div class="bg-white p-8 rounded-lg shadow-md mb-12">
            <p class="text-lg text-gray-700 leading-relaxed">
                Origen Fresco nació de una idea simple: ¿por qué es tan difícil saber de dónde viene nuestra comida? En una región tan rica y diversa como la nuestra, queríamos acortar la distancia entre la tierra y la mesa, creando una conexión real entre quienes cultivan los alimentos y quienes los disfrutan. Nuestra misión es ofrecer productos de la más alta calidad, con total trazabilidad, apoyando a los agricultores locales y promoviendo prácticas sostenibles.
            </p>
        </div>

        <section>
            <h2 class="section-title">Nuestros Aliados Agricultores</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="bg-white p-6 rounded-lg shadow-md text-center">
                    <img src="https://placehold.co/150x150/22C55E/ffffff?text=CR" class="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-lg">
                    <h3 class="text-xl font-bold">Carlos Rojas</h3>
                    <p class="text-gray-500">Finca La Esperanza, Sopetrán</p>
                    <p class="text-gray-700 mt-2">"Especialista en mangos y frutas tropicales. Mi pasión es ver el sol de Antioquia convertirse en dulzura."</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-md text-center">
                    <img src="https://placehold.co/150x150/16A34A/ffffff?text=AG" class="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-lg">
                    <h3 class="text-xl font-bold">Ana Gómez</h3>
                    <p class="text-gray-500">Hacienda Verde, El Retiro</p>
                    <p class="text-gray-700 mt-2">"Cultivo los aguacates más cremosos que probarás. Para mí, la agricultura es cuidar la tierra que nos da todo."</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-md text-center">
                    <img src="https://placehold.co/150x150/86EFAC/ffffff?text=SC" class="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-lg">
                    <h3 class="text-xl font-bold">Sofía Cadavid</h3>
                    <p class="text-gray-500">Finca El Manantial, La Ceja</p>
                    <p class="text-gray-700 mt-2">"Mis hortalizas y fresas son 100% orgánicas. Creo en una alimentación limpia, saludable y deliciosa."</p>
                </div>
            </div>
        </section>
    `;
}

function renderFaqPage() {
    return `
        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-800">Preguntas Frecuentes</h1>
            <p class="text-xl text-gray-600 mt-2">Resolvemos tus dudas para que compres con total confianza.</p>
        </div>
        <div class="max-w-3xl mx-auto space-y-4">
            ${renderFaqItem(
                '¿Cómo funciona la suscripción? ¿Puedo pausarla?',
                'Es muy fácil. Eliges el tamaño de tu canasta y la frecuencia de entrega. Te enviaremos una selección de los productos más frescos de la semana. ¡Claro que sí! Puedes pausar, cancelar o cambiar tu suscripción en cualquier momento desde tu panel de "Mi Cuenta" sin penalizaciones.'
            )}
            ${renderFaqItem(
                '¿Qué pasa si un producto llega en mal estado?',
                'Nuestra garantía de frescura es total. Si algún producto no cumple con tus expectativas, contáctanos a través de WhatsApp o correo electrónico con una foto y te lo repondremos en tu próximo pedido o te devolveremos el dinero. Tu satisfacción es nuestra prioridad.'
            )}
            ${renderFaqItem(
                '¿Cuáles son sus zonas y horarios de entrega?',
                'Actualmente entregamos en todo el Valle de Aburrá. Las entregas se realizan de martes a viernes entre las 9:00 a.m. y las 5:00 p.m. Recibirás una notificación por WhatsApp cuando tu pedido esté en camino.'
            )}
            ${renderFaqItem(
                '¿Cómo sé de dónde vienen mis productos?',
                'Esta es la magia de Origen Fresco. En la página de cada producto, encontrarás una sección de "Origen del Producto" con información sobre la finca, la ubicación y el agricultor que lo cultivó. ¡Transparencia total!'
            )}
        </div>
    `;
}

function renderCheckoutPage(step = 1) {
    return `
        <div class="max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold text-center mb-8">Finalizar Compra</h1>
            <div class="flex justify-center items-center mb-8">
                <div class="flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-500'}">
                    <div class="rounded-full h-8 w-8 flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}">1</div>
                    <span class="ml-2 font-semibold">Carrito</span>
                </div>
                <div class="flex-1 h-px ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'} mx-4"></div>
                <div class="flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-500'}">
                    <div class="rounded-full h-8 w-8 flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}">2</div>
                    <span class="ml-2 font-semibold">Envío</span>
                </div>
                <div class="flex-1 h-px ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'} mx-4"></div>
                <div class="flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-500'}">
                    <div class="rounded-full h-8 w-8 flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}">3</div>
                    <span class="ml-2 font-semibold">Pago</span>
                </div>
                 <div class="flex-1 h-px ${step >= 4 ? 'bg-blue-600' : 'bg-gray-300'} mx-4"></div>
                <div class="flex items-center ${step >= 4 ? 'text-blue-600' : 'text-gray-500'}">
                    <div class="rounded-full h-8 w-8 flex items-center justify-center ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-300'}">✓</div>
                    <span class="ml-2 font-semibold">Confirmación</span>
                </div>
            </div>

            <div id="checkout-content">
                ${renderCheckoutStep(step)}
            </div>
        </div>
    `;
}

// --- HELPER & COMPONENT RENDERERS ---

function renderCheckoutStep(step) {
    if (step === 1) return renderCartStep();
    if (step === 2) return renderShippingStep();
    if (step === 3) return renderPaymentStep();
    if (step === 4) return renderConfirmationStep();
}

function renderCarousel() {
    const slides = [
        { img: 'https://placehold.co/1200x500/FBBF24/ffffff?text=Mango+Tommy', title: 'El Sabor de la Temporada: Mangos Tommy de Sopetrán', button: 'Comprar Ahora', onclick: `MapsTo('product', 1)` },
        { img: 'https://placehold.co/1200x500/86EFAC/14532D?text=Familia+Feliz', title: 'Tu Frescura Semanal, Garantizada. Programa tu Canasta', button: 'Descubrir Canastas', onclick: `MapsTo('subscriptions')` },
        { img: 'https://placehold.co/1200x500/22C55E/ffffff?text=Agricultor', title: 'Conoce a Quien Cultiva Tu Comida', button: 'Nuestros Aliados', onclick: `MapsTo('about')` }
    ];

    return slides.map((slide, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}" data-index="${index}">
            <img src="${slide.img}" class="w-full h-full object-cover absolute inset-0">
            <div class="absolute inset-0 bg-black bg-opacity-40"></div>
            <div class="relative z-10 flex flex-col items-center justify-center h-full text-white text-center p-4">
                <h2 class="text-3xl md:text-5xl font-bold mb-4">${slide.title}</h2>
                <button onclick="${slide.onclick}" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition transform hover:scale-105">
                    ${slide.button}
                </button>
            </div>
        </div>
    `).join('');
}

function renderCategoryCard(name, image) {
    return `
        <div class="group relative rounded-lg overflow-hidden cursor-pointer" onclick="navigateTo('catalog')">
            <img src="${image}" alt="${name}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300">
            <div class="absolute inset-0 bg-black bg-opacity-40"></div>
            <h3 class="absolute bottom-4 left-4 text-white text-xl font-bold">${name}</h3>
        </div>
    `;
}

function renderProductCard(product) {
    return `
        <div class="product-card bg-white rounded-lg shadow-md overflow-hidden group relative flex flex-col">
            <div class="relative">
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover cursor-pointer" onclick="navigateTo('product', ${product.id})">
                <div class="product-hover-buttons absolute bottom-2 left-2 right-2 flex flex-col gap-2">
                     <button onclick="openModal(${product.id})" class="w-full bg-white text-gray-800 text-sm font-bold py-2 px-4 rounded-md shadow-md hover:bg-gray-100">Vista Rápida</button>
                     <button onclick="addToCart(${product.id})" class="w-full bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-md shadow-md hover:bg-blue-700">Agregar al Carrito</button>
                </div>
            </div>
            <div class="p-4 flex-grow flex flex-col">
                <h3 class="font-bold text-lg text-gray-800 flex-grow">${product.name}</h3>
                <p class="text-gray-600 mt-1">${formatCurrency(product.price)} / Libra</p>
            </div>
        </div>
    `;
}

function renderSubscriptionCard(size, people, price, features, popular = false) {
    return `
        <div class="border rounded-lg p-8 text-center relative ${popular ? 'border-blue-500 border-2' : 'border-gray-300'}">
            ${popular ? '<span class="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">MÁS POPULAR</span>' : ''}
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Canasta ${size}</h3>
            <p class="text-gray-500 mb-4">${people}</p>
            <p class="text-4xl font-bold text-blue-600 mb-6">${formatCurrency(price)}<span class="text-lg font-normal text-gray-500">/semana</span></p>
            <ul class="space-y-2 text-gray-600 mb-8">
                ${features.map(f => `<li>✓ ${f}</li>`).join('')}
            </ul>
            <button class="w-full ${popular ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} font-bold py-3 px-6 rounded-md hover:opacity-90">
                Seleccionar Plan
            </button>
        </div>
    `;
}

function renderFaqItem(question, answer) {
    return `
        <details class="bg-white p-4 rounded-lg shadow-sm cursor-pointer">
            <summary class="font-semibold text-lg text-gray-800">${question}</summary>
            <p class="mt-2 text-gray-600">
                ${answer}
            </p>
        </details>
    `;
}

function renderCartStep() {
    if (cart.length === 0) {
        return `
            <div class="text-center bg-white p-8 rounded-lg shadow-md">
                <h2 class="text-2xl font-semibold mb-2">Tu carrito está vacío</h2>
                <p class="text-gray-600 mb-6">Parece que aún no has agregado productos. ¡Explora nuestro catálogo!</p>
                <button onclick="navigateTo('catalog')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md">
                    Ir a Productos
                </button>
            </div>
        `;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 5000;
    const total = subtotal + shipping;

    return `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-2xl font-semibold mb-4">Resumen del Carrito</h2>
                <div class="space-y-4">
                    ${cart.map(item => `
                        <div class="flex items-center justify-between border-b pb-4">
                            <div class="flex items-center gap-4">
                                <img src="${item.image}" class="w-20 h-20 rounded-md object-cover">
                                <div>
                                    <h3 class="font-semibold">${item.name}</h3>
                                    <p class="text-sm text-gray-500">${formatCurrency(item.price)}</p>
                                    <button onclick="removeFromCart(${item.id})" class="text-red-500 text-sm hover:underline">Eliminar</button>
                                </div>
                            </div>
                            <div class="flex items-center gap-4">
                                <div class="flex items-center border border-gray-300 rounded-md">
                                    <button class="px-2 py-1">-</button>
                                    <span class="px-3">${item.quantity}</span>
                                    <button class="px-2 py-1">+</button>
                                </div>
                                <p class="font-semibold w-24 text-right">${formatCurrency(item.price * item.quantity)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md h-fit sticky top-24">
                <h3 class="text-xl font-semibold mb-4">Resumen de la Orden</h3>
                <div class="space-y-2 mb-4">
                    <div class="flex justify-between"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
                    <div class="flex justify-between"><span>Envío</span><span>${formatCurrency(shipping)}</span></div>
                    <div class="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>${formatCurrency(total)}</span></div>
                </div>
                <div class="mb-4">
                    <input type="text" placeholder="Cupón de descuento" class="w-full p-2 border rounded-md">
                </div>
                <button onclick="navigateTo('checkout', 2)" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md">
                    Continuar con el Envío
                </button>
            </div>
        </div>
    `;
}

function renderShippingStep() {
    return `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-2xl font-semibold mb-4">Información de Envío</h2>
                <form class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Nombre" class="w-full p-2 border rounded-md">
                        <input type="text" placeholder="Apellido" class="w-full p-2 border rounded-md">
                    </div>
                    <input type="email" placeholder="Correo electrónico" class="w-full p-2 border rounded-md">
                    <input type="text" placeholder="Dirección" class="w-full p-2 border rounded-md">
                    <input type="text" placeholder="Apartamento, suite, etc. (opcional)" class="w-full p-2 border rounded-md">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <input type="text" placeholder="Ciudad" value="Medellín" class="w-full p-2 border rounded-md bg-gray-100" readonly>
                       <input type="text" placeholder="Teléfono" class="w-full p-2 border rounded-md">
                    </div>
                </form>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md h-fit sticky top-24">
                  <h3 class="text-xl font-semibold mb-4">Resumen de la Orden</h3>
                  <p class="text-gray-600 mb-4">Fecha estimada de entrega: Mañana</p>
                  <button onclick="navigateTo('checkout', 3)" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md">
                      Continuar al Pago
                  </button>
                  <button onclick="navigateTo('checkout', 1)" class="w-full mt-2 text-blue-600 font-semibold py-2 rounded-md">
                      &larr; Volver al carrito
                  </button>
            </div>
        </div>
    `;
}

function renderPaymentStep() {
    return `
        <div class="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 class="text-2xl font-semibold mb-6 text-center">Elige tu Método de Pago</h2>
            <div class="space-y-4">
                <div class="border p-4 rounded-lg flex items-center justify-between">
                    <label class="flex items-center gap-4">
                        <input type="radio" name="payment" class="h-5 w-5 text-blue-600">
                        <span class="font-semibold">Tarjeta de Crédito/Débito</span>
                    </label>
                    <img src="https://placehold.co/100x25/ffffff/cccccc?text=Visa+Mastercard" class="h-6">
                </div>
                 <div class="border p-4 rounded-lg flex items-center justify-between">
                    <label class="flex items-center gap-4">
                        <input type="radio" name="payment" class="h-5 w-5 text-blue-600">
                        <span class="font-semibold">PSE</span>
                    </label>
                    <img src="https://placehold.co/50x25/ffffff/cccccc?text=PSE" class="h-6">
                </div>
                 <div class="border p-4 rounded-lg flex items-center justify-between">
                    <label class="flex items-center gap-4">
                        <input type="radio" name="payment" class="h-5 w-5 text-blue-600">
                        <span class="font-semibold">Efectivo (Baloto/Efecty)</span>
                    </label>
                     <img src="https://placehold.co/100x25/ffffff/cccccc?text=Baloto+Efecty" class="h-6">
                </div>
            </div>
            <div class="mt-8 flex gap-4">
                <button onclick="navigateTo('checkout', 2)" class="flex-1 text-blue-600 font-semibold py-3 rounded-md border border-blue-600 hover:bg-blue-50">
                    &larr; Volver a Envío
                </button>
                <button onclick="navigateTo('checkout', 4)" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md">
                    Pagar Ahora
                </button>
            </div>
        </div>
    `;
}

function renderConfirmationStep() {
    cart = []; // Clear cart on successful order
    updateCartCount();
    return `
        <div class="text-center bg-white p-8 md:p-12 rounded-lg shadow-xl">
            <div class="bg-green-100 text-green-600 rounded-full h-20 w-20 flex items-center justify-center text-4xl font-bold mx-auto mb-6">✓</div>
            <h2 class="text-3xl font-bold text-gray-800 mb-2">¡Gracias por tu pedido!</h2>
            <p class="text-gray-600 mb-4">Hemos recibido tu orden y ya la estamos preparando con los productos más frescos.</p>
            <p class="text-gray-800 font-semibold mb-6">Tu número de orden es: <span class="text-blue-600">#OF120724A</span></p>
            <p class="text-gray-600 mb-8">Recibirás un correo electrónico y una notificación de WhatsApp con los detalles de tu compra y el seguimiento del envío.</p>
            <button onclick="navigateTo('home')" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md">
                Seguir Comprando
            </button>
        </div>
    `;
}