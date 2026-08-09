<template>
  <div class="bg-body-tertiary min-vh-100 pb-5">
    
    <!-- 1. NAVBAR MODERNO CON GRADIENTE -->
    <nav class="navbar navbar-expand-lg navbar-dark header-gradient sticky-top shadow-sm">
      <div class="container py-1">
        <a class="navbar-brand fw-bold fs-3 d-flex align-items-center gap-2" href="#">
          <span class="badge bg-warning text-dark rounded-circle p-2 fs-5">
            <i class="bi bi-lightning-charge-fill"></i>
          </span>
          <span class="tracking-tight">Sport<span class="text-warning">Zone</span></span>
        </a>
        
        <div class="d-flex align-items-center gap-3 ms-auto">
          <span class="badge bg-white text-dark border px-3 py-2 rounded-pill d-none d-md-inline-block">
            <i class="bi bi-box-seam me-1 text-primary"></i> {{ productos.length }} Productos
          </span>
          <button class="btn btn-warning fw-bold rounded-pill px-4 shadow-sm text-dark hover-scale" @click="abrirModalCrear">
            <i class="bi bi-plus-lg me-1"></i> Nuevo Producto
          </button>
        </div>
      </div>
    </nav>

    <div class="container mt-4">

      <!-- 2. CARRUSEL HERO DE PRODUCTOS EN OFERTA -->
      <div v-if="productosEnOferta.length > 0" class="card border-0 rounded-4 shadow-lg overflow-hidden mb-5 hero-banner">
        <div class="row g-0 align-items-center bg-dark text-white position-relative">
          
          <!-- Lado Izquierdo: Información del Producto del Carrusel -->
          <div class="col-lg-6 p-4 p-md-5 z-1">
            <span class="badge bg-danger text-uppercase px-3 py-2 rounded-pill mb-3 fs-6">
              <i class="bi bi-fire me-1"></i> Oferta Destacada
            </span>
            <h2 class="display-6 fw-extrabold text-white mb-2 text-truncate">
              {{ productosEnOferta[carruselIndex]?.nombre }}
            </h2>
            <p class="text-light opacity-75 mb-4 text-truncate-2">
              {{ productosEnOferta[carruselIndex]?.descripcion }}
            </p>

            <div class="d-flex align-items-center gap-3 mb-4">
              <span class="display-6 fw-bold text-warning">
                ${{ Number(productosEnOferta[carruselIndex]?.precioOferta || 0).toFixed(2) }}
              </span>
              <span class="fs-5 text-secondary text-decoration-line-through">
                ${{ Number(productosEnOferta[carruselIndex]?.precio || 0).toFixed(2) }}
              </span>
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-light rounded-pill px-4 fw-bold" @click="verDetalle(productosEnOferta[carruselIndex])">
                <i class="bi bi-eye me-1"></i> Ver Producto
              </button>
              <button class="btn btn-outline-light rounded-circle" @click="prevSlide">
                <i class="bi bi-chevron-left"></i>
              </button>
              <button class="btn btn-outline-light rounded-circle" @click="nextSlide">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>

          <!-- Lado Derecho: Imagen con Gradiente -->
          <div class="col-lg-6 position-relative hero-img-container">
            <img 
              :src="productosEnOferta[carruselIndex]?.imagen || 'https://picsum.photos/600/400'" 
              class="w-100 h-100 object-fit-cover position-absolute top-0 start-0"
              alt="Producto Oferta"
              @error="(e) => e.target.src = 'https://picsum.photos/600/400'"
            />
            <div class="hero-overlay"></div>
          </div>

        </div>
      </div>

      <!-- 3. BARRA DE FILTROS Y BÚSQUEDA -->
      <div class="card border-0 rounded-4 shadow-sm mb-4 filter-bar">
        <div class="card-body p-4">
          <div class="row g-3 align-items-center">
            
            <!-- Buscador -->
            <div class="col-lg-5">
              <div class="input-group">
                <span class="input-group-text bg-light border-0 ps-3 text-muted">
                  <i class="bi bi-search"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control bg-light border-0 py-2 shadow-none" 
                  placeholder="Buscar por nombre de producto..." 
                  v-model="busqueda"
                />
              </div>
            </div>

            <!-- Selector de Categorías (DISTINCT) -->
            <div class="col-lg-4">
              <div class="input-group">
                <span class="input-group-text bg-light border-0 ps-3 text-muted">
                  <i class="bi bi-tags"></i>
                </span>
                <select class="form-select bg-light border-0 py-2 shadow-none" v-model="categoriaSeleccionada">
                  <option value="">Todas las Categorías</option>
                  <option v-for="cat in categoriasUnicas" :key="cat.id" :value="cat.id">
                    {{ cat.nombre }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Switch Ofertas -->
            <div class="col-lg-3 d-flex justify-content-lg-end">
              <div class="form-check form-switch custom-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="switchOfertas" 
                  v-model="soloOfertas"
                />
                <label class="form-check-label fw-bold ms-2" for="switchOfertas">
                  🔥 Solo Ofertas
                </label>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- 4. ESTADOS DE CARGA Y ERRORES -->
      <div v-if="cargando" class="text-center my-5 py-5">
        <div class="spinner-grow text-warning" style="width: 3rem; height: 3rem;" role="status"></div>
        <p class="mt-3 text-muted fw-bold">Cargando catálogo en tiempo real...</p>
      </div>

      <div v-else-if="errorApi" class="alert alert-danger rounded-4 text-center p-4 shadow-sm">
        <i class="bi bi-wifi-off fs-1 d-block mb-2 text-danger"></i>
        <h5 class="fw-bold">Sin Conexión</h5>
        <p class="mb-3">{{ errorApi }}</p>
        <button class="btn btn-danger rounded-pill px-4" @click="cargarProductos">
          <i class="bi bi-arrow-clockwise me-1"></i> Reintentar
        </button>
      </div>

      <div v-else-if="productosFiltrados.length === 0" class="text-center my-5 py-5 bg-white rounded-4 shadow-sm">
        <i class="bi bi-search-heart fs-1 text-muted d-block mb-2"></i>
        <h5 class="fw-bold text-secondary">No encontramos productos con esos filtros</h5>
        <p class="text-muted small">Prueba limpiando el buscador o cambiando la categoría.</p>
      </div>

      <!-- 5. REJILLA DE TARJETAS (PRODUCT CARDS) -->
      <div v-else class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div v-for="producto in productosFiltrados" :key="producto.id" class="col">
          <div class="card h-100 border-0 rounded-4 shadow-sm product-card transition-all">
            
            <!-- Badge Categoría & Oferta -->
            <div class="position-absolute top-0 start-0 end-0 p-3 d-flex justify-content-between align-items-center z-2 pointer-events-none">
              <span class="badge bg-dark bg-opacity-75 backdrop-blur text-uppercase px-3 py-2 rounded-pill small">
                {{ producto.categoriaNombre || 'General' }}
              </span>
              <span v-if="producto.enOferta" class="badge bg-danger px-3 py-2 rounded-pill shadow-sm">
                🔥 Oferta
              </span>
            </div>

            <!-- Imagen del Producto -->
            <div class="card-img-wrapper position-relative overflow-hidden rounded-top-4">
              <img 
                :src="producto.imagen || 'https://picsum.photos/400/300?random=' + producto.id" 
                class="card-img-top card-img-zoom" 
                :alt="producto.nombre"
                @error="(e) => e.target.src = 'https://picsum.photos/400/300?random=' + producto.id"
              />
            </div>

            <!-- Cuerpo de la Tarjeta -->
            <div class="card-body d-flex flex-column p-4">
              <h5 class="card-title fw-bold text-dark text-truncate mb-2">{{ producto.nombre }}</h5>
              <p class="card-text text-muted small text-truncate-2 mb-3 flex-grow-1">{{ producto.descripcion }}</p>

              <!-- Precios -->
              <div class="d-flex align-items-baseline gap-2 mb-3">
                <template v-if="producto.enOferta && producto.precioOferta">
                  <span class="fs-4 fw-extrabold text-danger">${{ Number(producto.precioOferta).toFixed(2) }}</span>
                  <span class="text-muted text-decoration-line-through small">${{ Number(producto.precio).toFixed(2) }}</span>
                </template>
                <template v-else>
                  <span class="fs-4 fw-bold text-dark">${{ Number(producto.precio).toFixed(2) }}</span>
                </template>
              </div>

              <!-- Botones CRUD -->
              <div class="d-flex gap-2">
                <button class="btn btn-light rounded-pill flex-grow-1 fw-bold text-dark border" @click="verDetalle(producto)">
                  <i class="bi bi-eye me-1"></i> Detalle
                </button>
                <button class="btn btn-outline-warning rounded-circle" @click="abrirModalEditar(producto)" title="Editar">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-outline-danger rounded-circle" @click="confirmarEliminar(producto.id)" title="Eliminar">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Swal from 'sweetalert2'

// 📍 INYECCIÓN FORZADA DE ESTILOS PARA GITHUB PAGES
useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'
    },
    {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css'
    }
  ],
  script: [
    {
      src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
      tagPosition: 'bodyClose'
    }
  ]
})
const API_URL = 'https://backservicetest-g8emcvdff0fqe2b8.canadacentral-01.azurewebsites.net/api/producto'

const productos = ref([])
const cargando = ref(true)
const errorApi = ref(null)

const busqueda = ref('')
const categoriaSeleccionada = ref('')
const soloOfertas = ref(false)

// Estado del Carrusel
const carruselIndex = ref(0)
let carruselTimer = null

// 1. CARGAR PRODUCTOS
const cargarProductos = async () => {
  cargando.value = true
  errorApi.value = null
  try {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error(`Error (${res.status})`)
    const data = await res.json()
    productos.value = data
  } catch (err) {
    errorApi.value = 'No se pudo conectar con la API de Azure.'
  } finally {
    cargando.value = false
  }
}

// 2. PRODUCTOS PARA EL CARRUSEL HERO
const productosEnOferta = computed(() => {
  const ofertas = productos.value.filter(p => p.enOferta && p.imagen)
  return ofertas.length > 0 ? ofertas.slice(0, 5) : productos.value.slice(0, 5)
})

const nextSlide = () => {
  if (productosEnOferta.value.length === 0) return
  carruselIndex.value = (carruselIndex.value + 1) % productosEnOferta.value.length
}

const prevSlide = () => {
  if (productosEnOferta.value.length === 0) return
  carruselIndex.value = (carruselIndex.value - 1 + productosEnOferta.value.length) % productosEnOferta.value.length
}

// 3. ALGORITMO DISTINCT (Categorías Únicas)
const categoriasUnicas = computed(() => {
  const mapa = new Map()
  productos.value.forEach(prod => {
    if (prod.categoriaId && prod.categoriaNombre) {
      if (!mapa.has(prod.categoriaId)) {
        mapa.set(prod.categoriaId, { id: prod.categoriaId, nombre: prod.categoriaNombre })
      }
    }
  })
  return Array.from(mapa.values())
})

// 4. FILTROS COMBINADOS
const productosFiltrados = computed(() => {
  return productos.value.filter(prod => {
    const coincideNombre = (prod.nombre || '').toLowerCase().includes(busqueda.value.toLowerCase())
    const coincideCategoria = !categoriaSeleccionada.value || prod.categoriaId == categoriaSeleccionada.value
    const coincideOferta = !soloOfertas.value || prod.enOferta === true
    return coincideNombre && coincideCategoria && coincideOferta
  })
})

// 5. OPERACIONES CRUD (GET ID, POST, PUT, DELETE)
const verDetalle = async (prod) => {
  try {
    const res = await fetch(`${API_URL}/${prod.id}`)
    const detalle = res.ok ? await res.json() : prod

    Swal.fire({
      title: detalle.nombre,
      html: `
        <img src="${detalle.imagen || 'https://picsum.photos/400/300'}" style="max-height: 220px; object-fit: cover;" class="img-fluid rounded-3 mb-3"><br>
        <div class="text-start px-2">
          <p class="mb-1"><strong>ID:</strong> #${detalle.id}</p>
          <p class="mb-1"><strong>Categoría:</strong> ${detalle.categoriaNombre || 'General'}</p>
          <p class="mb-2"><strong>Descripción:</strong> ${detalle.descripcion || 'Sin descripción'}</p>
          <hr>
          <p class="fs-5 mb-0"><strong>Precio Regular:</strong> $${Number(detalle.precio).toFixed(2)}</p>
          ${detalle.enOferta ? `<p class="fs-5 text-danger fw-bold"><strong>🔥 En Oferta:</strong> $${Number(detalle.precioOferta).toFixed(2)}</p>` : ''}
        </div>
      `,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#0f172a'
    })
  } catch (error) {
    Swal.fire('Error', 'No se pudo obtener el detalle', 'error')
  }
}

const abrirModalCrear = () => {
  Swal.fire({
    title: '➕ Registrar Producto',
    html: `
      <input id="swal-nombre" class="swal2-input" placeholder="Nombre">
      <input id="swal-desc" class="swal2-input" placeholder="Descripción">
      <input id="swal-precio" type="number" step="0.01" class="swal2-input" placeholder="Precio ($)">
      <input id="swal-cat-nombre" class="swal2-input" placeholder="Nombre Categoría">
      <input id="swal-cat-id" type="number" class="swal2-input" placeholder="ID Categoría">
      <input id="swal-imagen" class="swal2-input" placeholder="URL Imagen (https://...)">
      <div class="form-check mt-3 text-start ms-4">
        <input class="form-check-input" type="checkbox" id="swal-oferta">
        <label class="form-check-label fw-bold" for="swal-oferta">¿Producto en oferta?</label>
      </div>
      <input id="swal-precio-oferta" type="number" step="0.01" class="swal2-input" placeholder="Precio Oferta ($)">
    `,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#198754',
    preConfirm: () => {
      const nombre = document.getElementById('swal-nombre').value
      const precio = document.getElementById('swal-precio').value
      if (!nombre || !precio) {
        Swal.showValidationMessage('Nombre y precio obligatorios')
        return false
      }
      return {
        nombre,
        descripcion: document.getElementById('swal-desc').value || 'Sin descripción',
        precio: parseFloat(precio),
        categoriaNombre: document.getElementById('swal-cat-nombre').value || 'General',
        categoriaId: parseInt(document.getElementById('swal-cat-id').value) || 1,
        imagen: document.getElementById('swal-imagen').value || 'https://picsum.photos/400/300',
        enOferta: document.getElementById('swal-oferta').checked,
        precioOferta: parseFloat(document.getElementById('swal-precio-oferta').value) || null
      }
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.value)
        })
        if (!res.ok) throw new Error()
        Swal.fire('¡Éxito!', 'Producto registrado.', 'success')
        cargarProductos()
      } catch (err) {
        Swal.fire('Error', 'No se pudo guardar', 'error')
      }
    }
  })
}

const abrirModalEditar = (prod) => {
  Swal.fire({
    title: `✏️ Editar Producto`,
    html: `
      <input id="swal-nombre" class="swal2-input" value="${prod.nombre}">
      <input id="swal-desc" class="swal2-input" value="${prod.descripcion || ''}">
      <input id="swal-precio" type="number" step="0.01" class="swal2-input" value="${prod.precio}">
      <input id="swal-cat-nombre" class="swal2-input" value="${prod.categoriaNombre || ''}">
      <input id="swal-cat-id" type="number" class="swal2-input" value="${prod.categoriaId || 1}">
      <input id="swal-imagen" class="swal2-input" value="${prod.imagen || ''}">
      <div class="form-check mt-3 text-start ms-4">
        <input class="form-check-input" type="checkbox" id="swal-oferta" ${prod.enOferta ? 'checked' : ''}>
        <label class="form-check-label fw-bold" for="swal-oferta">¿En oferta?</label>
      </div>
      <input id="swal-precio-oferta" type="number" step="0.01" class="swal2-input" value="${prod.precioOferta || ''}">
    `,
    showCancelButton: true,
    confirmButtonText: 'Actualizar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ffc107',
    preConfirm: () => {
      const nombre = document.getElementById('swal-nombre').value
      const precio = document.getElementById('swal-precio').value
      return {
        id: prod.id,
        nombre,
        descripcion: document.getElementById('swal-desc').value,
        precio: parseFloat(precio),
        categoriaNombre: document.getElementById('swal-cat-nombre').value,
        categoriaId: parseInt(document.getElementById('swal-cat-id').value) || 1,
        imagen: document.getElementById('swal-imagen').value,
        enOferta: document.getElementById('swal-oferta').checked,
        precioOferta: parseFloat(document.getElementById('swal-precio-oferta').value) || null
      }
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/${prod.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.value)
        })
        if (!res.ok) throw new Error()
        Swal.fire('¡Actualizado!', 'Producto modificado.', 'success')
        cargarProductos()
      } catch (err) {
        Swal.fire('Error', 'No se pudo actualizar', 'error')
      }
    }
  })
}

const confirmarEliminar = (id) => {
  Swal.fire({
    title: '¿Eliminar producto?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    confirmButtonText: 'Sí, borrar',
    cancelButtonText: 'Cancelar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error()
        Swal.fire('¡Eliminado!', 'El producto ha sido borrado.', 'success')
        cargarProductos()
      } catch (err) {
        Swal.fire('Error', 'No se pudo eliminar', 'error')
      }
    }
  })
}

onMounted(() => {
  cargarProductos()
  // Rotación automática del carrusel cada 5 segundos
  carruselTimer = setInterval(() => {
    nextSlide()
  }, 5000)
})

onUnmounted(() => {
  if (carruselTimer) clearInterval(carruselTimer)
})
</script>

<style scoped>
/* Encabezado y Gradientes */
.header-gradient {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.fw-extrabold {
  font-weight: 800;
}

/* Carrusel Hero Banner */
.hero-banner {
  min-height: 340px;
}

.hero-img-container {
  min-height: 340px;
}

.hero-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(90deg, #212529 0%, transparent 100%);
}

@media (max-width: 991px) {
  .hero-overlay {
    background: linear-gradient(0deg, #212529 0%, transparent 100%);
  }
}

/* Animaciones y Hover Cards */
.product-card {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 1rem 2.5rem rgba(0,0,0,0.1) !important;
}

.card-img-wrapper {
  height: 220px;
  background-color: #f8f9fa;
}

.card-img-zoom {
  height: 100%;
  width: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-card:hover .card-img-zoom {
  transform: scale(1.08);
}

.backdrop-blur {
  backdrop-filter: blur(8px);
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hover-scale {
  transition: transform 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}
</style>