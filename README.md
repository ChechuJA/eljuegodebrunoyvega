# El Juego de Bruno y Vega 🎮

Una colección de juegos educativos e interactivos para niños, desarrollada con HTML5, JavaScript y mucho amor.

## ✨ Características

### 🎯 Juegos Individuales
- **Arkanoid**: Rompe bloques con tu pelota
- **Bruno el paracaidista**: Aventura de salto libre  
- **Vega la bailarina**: Juego de ritmo y movimiento
- **Memoria animales**: Entrena tu memoria
- **Serpiente**: El clásico juego de la serpiente
- **Laberinto de colores**: Encuentra tu camino
- Y muchos más...

### 🎮 **NUEVO: Juegos Multijugador**
- **🏓 Ping Pong**: Juego de ping pong para dos jugadores
  - **Jugador 1**: Teclas A (subir) y Z (bajar)
  - **Jugador 2**: Flechas ↑ (subir) y ↓ (bajar)
  - Primer jugador en llegar a 5 puntos gana
  - Nombres personalizables para cada jugador

### 🚀 Automatización y Testing
- **GitHub Actions**: Testing automático de todos los juegos
- **Releases automáticos**: Versionado basado en fechas
- **Playwright**: Testing de interfaz automatizado
- **Validación continua**: Asegura que todos los juegos funcionen

## 🎯 Cómo Jugar

1. Abre `index.html` en tu navegador
2. Ingresa tu nombre de jugador
3. Elige entre juegos individuales o multijugador
4. ¡Disfruta jugando!

### Controles del Ping Pong 🏓
- **Jugador 1 (Izquierda)**: 
  - `A` - Mover raqueta hacia arriba
  - `Z` - Mover raqueta hacia abajo
- **Jugador 2 (Derecha)**:
  - `↑` - Mover raqueta hacia arriba  
  - `↓` - Mover raqueta hacia abajo
- **ESC** - Volver al menú principal

## 🛠️ Desarrollo

### Estructura del Proyecto
```
/
├── index.html              # Página principal
├── script-*.js             # Scripts de juegos individuales
├── script-ping-pong.js     # Juego multijugador ping pong
├── game-utils.js           # Utilidades compartidas
├── style.css               # Estilos principales
├── tests/                  # Tests automatizados
└── .github/workflows/      # Automatización CI/CD
```

### Añadir un Nuevo Juego

1. Crear `script-mi-juego.js` con función `registerGame()`
2. Agregar entrada en el mapa de juegos en `index.html`
3. Añadir botón en la interfaz
4. Agregar test en `tests/games.spec.js`

## 🧪 Testing

```bash
# Instalar dependencias
npm install

# Ejecutar tests
npx playwright test

# Servidor de desarrollo
python3 -m http.server 8000
```

## 🏆 Características Técnicas

- **HTML5 Canvas**: Gráficos fluidos y responsivos
- **JavaScript modular**: Cada juego es independiente
- **Sistema de puntajes**: Guardado en localStorage
- **Responsive design**: Funciona en desktop y móvil
- **Testing automatizado**: Playwright + GitHub Actions
- **Releases automáticos**: Versionado y distribución automática

## 👥 Contribución

Este proyecto fue desarrollado como una prueba de colaboración entre Claude AI y GitHub Copilot, creando una experiencia de juego completa para Bruno y Vega.

---

**Creado para Bruno y Vega © 2025**
*Hecho con 💖 por la comunidad de desarrolladores*
