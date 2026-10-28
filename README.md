# El Juego de Bruno y Vega 🎮

Una colección de juegos educativos e interactivos para niños, desarrollada con HTML5, JavaScript y mucho amor.

## ✨ Características

### 🌍 **Proyecto "Semillas del Cambio" - No dejes que vuelva a ocurrir**
Nueva sección de juegos educativos sobre el **ODS 13: Acción por el Clima** de la Agenda 2030. Aprende sobre catástrofes ambientales del pasado, comprende el cambio climático y descubre qué podemos hacer para que no vuelvan a ocurrir:

- **🛢️ Salva la Costa**: Basado en el desastre del Prestige (España, 2002)
  - Protege los peces del petróleo con barreras ecológicas
  - Recoge peces limpios para salvarlos
  - Aprende sobre el impacto de los vertidos de petróleo
  - Controles: ← → para mover, ESPACIO para colocar barreras

- **🌲 Bosque Verde**: Prevención y control de incendios forestales
  - Apaga incendios con agua desde un helicóptero
  - Planta nuevos árboles para recuperar el bosque
  - Gestiona la humedad del suelo para prevenir fuegos
  - Controles: ← → para mover, ESPACIO para lanzar agua, P para plantar

- **🏙️ Aire Limpio**: Gestión de contaminación urbana
  - Reduce el tráfico de coches y aumenta bicicletas
  - Invierte en vehículos eléctricos y transporte público
  - Planta árboles para limpiar el aire
  - Controles: Clic en botones de acciones

- **⚡ Energía Sabia**: Fuentes de energía sostenibles
  - Construye centrales para satisfacer la demanda energética
  - Prioriza energías renovables (solar, eólica)
  - Evita energías con alto riesgo de accidentes
  - Controles: Clic para seleccionar y construir centrales

- **🌊 Planeta Azul**: Limpieza de océanos
  - Recoge plásticos y residuos del océano
  - Lleva la basura al centro de reciclaje
  - Protege la fauna marina de la contaminación
  - Controles: ⬅️➡️⬆️⬇️ mover, ESPACIO recoger, R reciclar

### 🎯 Juegos Individuales
- **🔷 Geometría en carrera**: plataformas de figuras geométricas para superar cuatro niveles usando ESPACIO para saltar.
- **Arkanoid**: Rompe bloques con tu pelota
- **Bruno el paracaidista**: Aventura de salto libre  
- **Vega la bailarina**: Juego de ritmo y movimiento
- **Memoria animales**: Entrena tu memoria
- **Serpiente**: El clásico juego de la serpiente
- **Laberinto de colores**: Encuentra tu camino
- Y muchos más...

### ⌨️ Entrena tu teclado
- **Misión mecanografía**: escribe palabras durante un minuto, gana rapidez y descubre tu precisión; cada cinco palabras subes a un nivel con palabras más largas.
- **Teclado Rápido**: practica reflejos con las teclas que aparecen durante la carrera.
- Recomendación para aprender: prioriza escribir correctamente y deja que la velocidad llegue con la práctica.

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

En **Geometría en carrera**, pulsa ESPACIO para saltar y recoger gemas; pulsa ESC para pausar. En **Misión mecanografía**, escribe la palabra que aparece y usa ESPACIO o ENTER para comenzar.

### Controles del Ping Pong 🏓
- **Jugador 1 (Izquierda)**: 
  - `A` - Mover raqueta hacia arriba
  - `Z` - Mover raqueta hacia abajo
- **Jugador 2 (Derecha)**:
  - `↑` - Mover raqueta hacia arriba  
  - `↓` - Mover raqueta hacia abajo
- **ESC** - Volver al menú principal

## 🛠️ Desarrollo

### Controles del fútbol

- **Blancos**: WASD para moverse, F para chutar y Ctrl izquierdo para controlar al jugador de su equipo más cercano al balón.
- **Azules**: flechas para moverse, Enter para chutar y Ctrl derecho para controlar al jugador de su equipo más cercano al balón.
- Un aro amarillo identifica al jugador controlado de cada equipo. El cambio se realiza una vez por pulsación, no continuamente al mantener Ctrl.
- El cambio manual solo está disponible en el modo de dos jugadores; el modo CPU contra CPU sigue siendo automático.

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
npm test

# Pruebas gráficas y del catálogo completo
npx playwright test tests/catalog-visual.spec.js --workers=2 --reporter=line

# Toda la batería, con paralelismo limitado
npx playwright test --workers=2 --reporter=line

# Servidor estático local opcional (Node, solo para desarrollo/pruebas)
node tests/static-server.cjs
```

Las pruebas requieren Node y el navegador de Playwright (`npx playwright install chromium`
si aún no está instalado). **Para jugar no se necesita instalar nada**: abre `index.html`
o visita la publicación estática. El servidor opcional sirve `http://localhost:8000/`
y también `/coleccion/`, utilizado para comprobar rutas relativas como en GitHub Pages.

## 🎨 Renovación gráfica del catálogo local

Se ha empezado por fútbol y se han renovado los **39 juegos cuyo script existe en el
mapa de carga de `index.html`**, incluido `uno`, cargable aunque no tiene botón.
No se han añadido motores, fuentes remotas, imágenes descargadas ni dependencias de ejecución.
Las reglas, teclas y rectángulos/radios de colisión se mantienen; se han corregido además
defectos de arranque, recursos y limpieza encontrados durante las pruebas.

### Inventario de cobertura

Cada identificador corresponde a `script-<identificador>.js` en la raíz:

| Identificador | Mejora gráfica |
| --- | --- |
| `futbol` | Grada de barrio con público y bufandas, tonos de piel y pelo variados, piernas corregidas; conserva camisetas, nombres y aros de control. |
| `ping-pong` | Pista de club con gradas laterales y líneas de cancha. |
| `arkanoid` | Espacio ilustrado con planeta anillado y estrellas estables. |
| `paracaidista` | Cielo con nubes, sol, colinas y arboleda. |
| `vega-bailarina` | Teatro con cortinas, focos y suelo en perspectiva. |
| `nave-exploradora` | Firmamento con planeta decorativo y tonos turquesa. |
| `memoria` | Fondo de animales con caras y textura suave detrás de las cartas. |
| `math-catcher` | Cuaderno de operaciones y números laterales. |
| `huerto` | Jardín con árboles y colores de tierra. |
| `constelaciones` | Cielo profundo ilustrado; conserva nebulosas, estrellas y figuras interactivas. |
| `laberinto` | Fondo de jardín con trazados de laberinto laterales. |
| `bloques` | Cristales y estrellas detrás del tablero. |
| `serpiente` | Jardín con colinas y arboleda; comida y serpiente siguen encima. |
| `sokoban` | Textura de almacén y motivos de cajas alrededor del tablero. |
| `carrera` | Gradas de circuito junto a la carretera; render completo de coches, marcadores e instrucciones restaurado. |
| `bubble` | Escenario acuático con ondas y vegetación en los bordes. |
| `alonso-noel` | Paisaje de nieve y abetos bajo la luna. |
| `ahorcado` | Espacio violeta con planeta anillado, sin parpadeo aleatorio del nuevo fondo. |
| `quiz` | Cuaderno de preguntas con fondo oscuro para mantener contraste. |
| `4enraya` | Mesa azul y brillo en fichas; filas completas visibles, sin recorte por la cabecera. |
| `recoge-moras` | Moreras ilustradas y recolector original con pañuelo. |
| `canaveras` | Cañaveral y personaje original de camiseta dorada. |
| `alcala-canas-tapas` | Fachadas y soportales de plaza castellana, paseante original. |
| `sonseca-camino` | Textura de costura y paseante original; pasos y datos locales conservados. |
| `juego-habilidad` | Colinas y nave original con cabina y propulsor. |
| `moto-desierto` | Dunas, cactus, carretera en perspectiva y moto con piloto y casco originales. |
| `flappy` | Cielo ilustrado; conserva edificios que son obstáculos; marcador corregido. |
| `mario-flappy` | Colinas y explorador original turquesa, sin reproducir personajes ajenos; identificador y teclas conservados. |
| `atrapa-bola` | Cancha cálida con gradas y líneas deportivas. |
| `ajedrez` | Mesa de madera cuadriculada tanto en selección como en partida. |
| `uno` | Mesa verde con textura y motivos de cartas. |
| `salva-costa` | Oleaje, costa arenosa y vegetación lateral. |
| `bosque-verde` | Colinas y arboleda de fondo; árboles interactivos y helicóptero por encima. |
| `aire-limpio` | Plaza urbana original detrás de edificios, tráfico y acciones existentes. |
| `energia-sabia` | Colinas y aerogeneradores decorativos, distintos de las centrales construibles. |
| `planeta-azul` | Océano con ondas, fondo marino y algas. |
| `teclado-rapido` | Cuaderno con teclas laterales detrás del circuito y del corredor. |
| `mecanografia` | Papel ilustrado con teclas alrededor de la palabra activa. |
| `geometria-espacio` | Estrellas y cristales; conserva suelo, montañas, figuras, gemas y obstáculos de cada nivel. |

### Arquitectura y autoría

- `game-utils.js`: `GameUI.scenery(ctx, id)` dibuja escenas vectoriales originales y
  deterministas, con caché de hasta cuatro escenas y un tamaño por juego; `explorer` y `vehicle` dibujan personajes
  y vehículos originales dentro de las mismas dimensiones de las entidades.
- Cada script llama explícitamente al arte en su capa de fondo o en el dibujo de su
  protagonista. No se intercepta Canvas, sus prototipos ni funciones globales.
- El arte nuevo se genera localmente con Canvas. **No se han descargado assets** ni
  se atribuye autoría nueva a los PNG/SVG que ya existían en `assets/`.
- `index.html` carga las utilidades antes que los juegos, reinicia el estado del Canvas
  entre juegos, evita inicializar cargas abandonadas y no duplica la limpieza al reiniciar.
- Se han corregido los bucles residuales detectados, temporizadores de dibujo y
  escuchadores de velocidad en varios juegos. Los PNG inexistentes ahora apuntan a
  sus SVG locales existentes.

### Alcance real de la verificación

`tests/catalog-visual.spec.js` obtiene el inventario del mapa real, comprueba los 39
juegos en Chromium bajo `/coleccion/`, vigila errores JS, consola y respuestas de recursos,
verifica dibujos no vacíos y llamadas a las escenas, y adjunta capturas.
Recorre el catálogo **dos veces**, inicia, reinicia y vuelve al menú comprobando que
los bucles no vuelven a pintar el lienzo vacío. También verifica repetibilidad del arte,
aislamiento del estado gráfico y otra resolución lógica. Genera `catalog-gallery.png`
en la carpeta de resultados de la prueba «lámina visual», para inspección humana.

Las pruebas anteriores de fútbol (incluido Ctrl de ambos equipos), mecanografía y
geometría siguen formando parte de la batería. Estos controles automáticos **no certifican
partidas completas de los 39 juegos**, todas las colisiones, finales, pausa/pérdida de
foco, persistencia o almacenamiento bloqueado de cada juego antiguo. No hay baselines
de comparación visual píxel a píxel, y falta probar Firefox/Safari y dispositivos reales.

Resultado de la comprobación local de esta renovación: **57 pruebas aprobadas en
Chromium** con `npx playwright test --workers=2 --reporter=line` (aprox. 1,4 minutos).
También se ejecutó `node --check` sobre los 39 scripts cargables, `game-utils.js` y
el servidor de pruebas: sin errores de sintaxis. Se inspeccionó la lámina visual de
los 39 juegos. La comprobación de whitespace no da errores al respetar los finales
CRLF existentes (`git -c core.whitespace=blank-at-eol,blank-at-eof,space-before-tab,cr-at-eol diff --check`);
el `git diff --check` sin esa opción señala los CRLF de `script-futbol.js`.

**Exclusiones auditadas:**
- `experimento-3d` y `experimento-3d-terreno` conservan referencias antiguas a scripts
  inexistentes en la raíz y no tienen botón. Sus archivos están en `EnPruebas/`, dependen
  de Three.js remoto y no se publican ni se presentan como mejorados.
- `EnPruebas/script-math-fast.js` utiliza otro contrato de registro y no está conectado
  al catálogo. Tampoco se presenta como cubierto.
- Los demás scripts sin entrada en el mapa no se consideran juegos publicados/cargables
  del catálogo actual. `index-games.html` es una página independiente con iframes de
  terceros: no se modifica ni se certifica el contenido remoto.

### Ejecución y GitHub Pages

Abre `index.html`, elige un juego y sigue sus instrucciones; no cambian los controles.
Para una comprobación equivalente al alojamiento web, usa el servidor opcional anterior.
Para actualizar GitHub Pages, revisa los cambios y súbelos mediante el flujo habitual
del repositorio. Si se configura por primera vez, selecciona en **Settings → Pages**
la rama/carpeta o el workflow estático que corresponda. Se usan rutas relativas, por lo
que también funciona bajo `https://<usuario>.github.io/<repositorio>/`.
Esta renovación no realiza commit, push, despliegue ni cambios de configuración remota.

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
