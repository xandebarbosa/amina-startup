/* * Arquivo: mapa.js
 * Descrição: Lógica de inicialização do mapa, geolocalização e interação com APIs de rotas e busca.
 */

// Configurações da aplicação
const CONFIG = {
    DEFAULT_LOCATION: {
        lat: -23.55052,
        lon: -46.633308
    },
    SEARCH_RADIUS: 4000, // metros
    CACHE_DURATION: 5 * 60 * 1000 // 5 minutos
};

// Inicializa mapa
const map = L.map('map').setView([CONFIG.DEFAULT_LOCATION.lat, CONFIG.DEFAULT_LOCATION.lon], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 18
}).addTo(map);

// Elementos da UI
const statusEl = document.getElementById('status');
const locateBtn = document.getElementById('locateBtn');
const delegaciaListEl = document.getElementById('delegaciaList');
const sidebar = document.getElementById('sidebar');

// Estado da aplicação
let userMarker = null;
let destMarker = null;
let routeLayer = null;
let userLocation = CONFIG.DEFAULT_LOCATION;

// ----------------------------
// Funções auxiliares de UI
// ----------------------------
function setStatus(text, type = 'info') {
    statusEl.innerHTML = '';
    statusEl.className = '';

    if (type === 'loading') {
        statusEl.classList.add('status-loading');
        statusEl.innerHTML = `<div class="spinner"></div><span>${text}</span>`;
    } else if (type === 'error') {
        statusEl.classList.add('status-error');
        statusEl.textContent = text;
    } else if (type === 'success') {
        statusEl.classList.add('status-success');
        statusEl.textContent = text;
    } else {
        statusEl.textContent = text;
    }
}

function toggleButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `<div class="spinner"></div><span>Buscando...</span>`;
    } else {
        button.disabled = false;
        button.innerHTML = `<span>Buscar delegacias próximas</span>`;
    }
}

// ----------------------------
// ✅ NOVA FUNÇÃO: Buscar delegacias (usando Overpass API — sem chave!)
// ----------------------------
async function buscarDelegacias(lat, lon) {
  const overpassUrl = "https://overpass-api.de/api/interpreter";
  const query = `
    [out:json];
    (
      node["amenity"="police"](around:${CONFIG.SEARCH_RADIUS},${lat},${lon});
      way["amenity"="police"](around:${CONFIG.SEARCH_RADIUS},${lat},${lon});
      relation["amenity"="police"](around:${CONFIG.SEARCH_RADIUS},${lat},${lon});
    );
    out center;
  `;

  const response = await fetch(overpassUrl, {
    method: "POST",
    body: query,
  });

  if (!response.ok) {
    throw new Error("Falha ao buscar delegacias (Overpass API).");
  }

  const data = await response.json();
  if (!data.elements || data.elements.length === 0) {
    return [];
  }

  // Mapeia os resultados (node/way/relation)
  const delegacias = data.elements.map(el => ({
    nome: el.tags?.name || "Delegacia de Polícia",
    lat: el.lat || el.center?.lat,
    lon: el.lon || el.center?.lon
  })).filter(d => d.lat && d.lon);

  return delegacias;
}

// ----------------------------
// Buscar rota (mantemos via OpenRouteService — opcional, pode funcionar mesmo sem chave)
// ----------------------------
async function buscarRota(startCoords, endCoords) {
  // Usa a API de rotas gratuita do openrouteservice
  const apiKey = "5b3ce3597851110001cf6248f8f45a36a1e341eea5a17a4f4b4a08f8"; // 🔑 Chave pública de demonstração
  const start = `${startCoords[1]},${startCoords[0]}`;
  const end = `${endCoords[1]},${endCoords[0]}`;

  const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start}&end=${end}`);

  if (!response.ok) {
    throw new Error('Falha ao calcular a rota.');
  }

  const data = await response.json();
  const route = data.features[0];
  const coords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);

  return {
    coords: coords,
    summary: route.properties.summary
  };
}

// ----------------------------
// Obter localização do usuário
// ----------------------------
function obterLocalizacaoUsuario() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocalização não é suportada pelo seu navegador."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = "Ocorreu um erro desconhecido.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permissão de localização negada.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Informação de localização indisponível.";
            break;
          case error.TIMEOUT:
            errorMessage = "Tempo limite ao obter localização.";
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
}

// ----------------------------
// Inicializar o mapa
// ----------------------------
async function inicializarMapa() {
    try {
        setStatus('Obtendo sua localização...', 'loading');
        userLocation = await obterLocalizacaoUsuario();

        if (userMarker) map.removeLayer(userMarker);
        userMarker = L.marker([userLocation.lat, userLocation.lon])
            .addTo(map)
            .bindPopup("Sua localização atual")
            .openPopup();

        map.setView([userLocation.lat, userLocation.lon], 14);
        setStatus('Localização obtida com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao obter localização:', error);

        userLocation = CONFIG.DEFAULT_LOCATION;
        if (userMarker) map.removeLayer(userMarker);
        userMarker = L.marker([userLocation.lat, userLocation.lon])
            .addTo(map)
            .bindPopup("Localização simulada (São Paulo)")
            .openPopup();

        map.setView([userLocation.lat, userLocation.lon], 14);
        setStatus(`Usando localização padrão: ${error.message}`, 'error');
    }
}

// ----------------------------
// Evento do botão "Buscar delegacias"
// ----------------------------
locateBtn.onclick = async () => {
    try {
        toggleButtonLoading(locateBtn, true);
        setStatus('Buscando delegacias próximas...', 'loading');

        const delegacias = await buscarDelegacias(userLocation.lat, userLocation.lon);
        delegaciaListEl.innerHTML = "";

        if (delegacias.length === 0) {
            delegaciaListEl.innerHTML = '<div class="no-results">Nenhuma delegacia encontrada nesta área</div>';
            setStatus('Nenhuma delegacia encontrada.', 'info');
            return;
        }

        delegacias.forEach(d => {
            const item = document.createElement('div');
            item.className = "list-item";
            item.tabIndex = 0;
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label', `Selecionar ${d.nome}`);
            item.innerHTML = `<span>${d.nome}</span><span class="distance">-- km</span>`;

            item.onclick = async () => {
                document.querySelectorAll('.list-item').forEach(e => e.classList.remove('active'));
                item.classList.add('active');

                try {
                    setStatus(`Calculando rota para ${d.nome}...`, 'loading');

                    if (routeLayer) map.removeLayer(routeLayer);
                    if (destMarker) map.removeLayer(destMarker);

                    destMarker = L.marker([d.lat, d.lon])
                        .addTo(map)
                        .bindPopup(d.nome)
                        .openPopup();

                    const routeData = await buscarRota(
                        [userLocation.lat, userLocation.lon],
                        [d.lat, d.lon]
                    );
                    
                    const primaryColor = getComputedStyle(document.documentElement)
                        .getPropertyValue('--cor-primaria').trim() || '#7E2A53';

                    routeLayer = L.polyline(routeData.coords, {
                        color: primaryColor, 
                        weight: 5,
                        opacity: 0.8
                    }).addTo(map);

                    map.fitBounds(routeLayer.getBounds(), { padding: [40, 40] });

                    const distanciaKm = (routeData.summary.distance / 1000).toFixed(2);
                    const duracaoMin = Math.round(routeData.summary.duration / 60);
                    item.querySelector(".distance").innerText = `${distanciaKm} km`;

                    setStatus(
                        `Rota traçada até ${d.nome} — ${distanciaKm} km, ~${duracaoMin} min`,
                        'success'
                    );
                } catch (error) {
                    console.error('Erro ao traçar rota:', error);
                    setStatus(error.message, 'error');
                }
            };

            item.onkeydown = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.click();
                }
            };

            delegaciaListEl.appendChild(item);
        });

        setStatus(`${delegacias.length} delegacias encontradas. Clique em uma para traçar rota.`, 'success');
    } catch (error) {
        console.error('Erro ao buscar delegacias:', error);
        setStatus(error.message, 'error');
    } finally {
        toggleButtonLoading(locateBtn, false);
    }
};

// Inicializa o mapa
inicializarMapa();
