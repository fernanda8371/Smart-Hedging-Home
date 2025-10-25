# SmartHedging - Currency Risk Analysis Platform 📈

Una plataforma avanzada de análisis de riesgo de divisas con IA que proporciona análisis de impacto de noticias en tiempo real, gráficos de divisas sincronizados y un constructor de escenarios de opciones.

![SmartHedging Dashboard](https://img.shields.io/badge/Status-Active-green)
![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Latest-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-Latest-38bdf8)

## 🚀 Características Principales

### 📰 Análisis de Noticias en Tiempo Real
- **Integración con APIs de noticias**: Conecta con Bloomberg, Reuters, New York Times
- **Puntuación de impacto IA**: Análisis automático del impacto de noticias en pares de divisas
- **Información contextual**: Tooltips explicativos sobre las puntuaciones de riesgo generadas por IA

### 📊 Dashboard de Análisis Sincronizado
- **Layout de filas sincronizadas**: Cada fila contiene:
  - 🗞️ **Tarjeta de noticia** (columna izquierda)
  - 📈 **Gráfico interactivo** (columna central)
  - 📋 **Estadísticas y datos** (columna derecha)
- **Filtros de tiempo**: Día, semana, mes, 3 meses, 6 meses, año
- **Selección de pares de divisas**: USD/MXN, EUR/MXN, GBP/MXN, CAD/MXN, JPY/MXN

### 🎯 Constructor de Escenarios de Opciones
- **Modelo Black-Scholes**: Cálculo de precios de opciones europeas
- **Estrategias IA**: Recomendaciones automáticas basadas en:
  - Long Call, Protective Put, Covered Call, Long Straddle
- **Diagramas de payoff**: Visualización interactiva de ganancias/pérdidas
- **Parámetros personalizables**: Volatilidad, tasa libre de riesgo, precio strike

### � Sistema de Gestión Empresarial
- **Perfiles de negocio**: Información completa de la empresa y contexto empresarial
- **Configuración financiera**: Ingresos anuales, monedas operativas, perfil de riesgo
- **Autenticación sin servidor**: Sistema demo sin autenticación real para pruebas
- **Persistencia local**: Datos guardados en localStorage para sesiones continuas

### 🔗 Integración MCP (Model Context Protocol)
- **Generación automática de URLs**: Parámetros del negocio convertidos a URL params
- **Contexto empresarial para IA**: Descripción del negocio, objetivos de cobertura, perfil de riesgo
- **Análisis personalizado**: Impacto de divisas calculado según monedas operativas
- **API lista para integrar**: URLs generadas listas para conectar con servicios MCP

### �🔄 Funcionalidades de Navegación
- **Contexto compartido**: Los datos se transfieren automáticamente entre páginas
- **Persistencia**: Los parámetros se mantienen al navegar entre secciones
- **Integración fluida**: Desde análisis de noticias hasta escenarios de opciones

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| **Frontend Framework** | Next.js | 16.0.0 |
| **Language** | TypeScript | Latest |
| **Styling** | Tailwind CSS | Latest |
| **UI Components** | Radix UI | Latest |
| **Charts** | Recharts | Latest |
| **Date Handling** | date-fns | 4.1.0 |
| **Package Manager** | pnpm | Recommended |

## 📦 Instalación y Configuración

### Pre-requisitos

```bash
# Verifica que tengas Node.js instalado (versión 18+)
node --version

# Verifica que tengas pnpm instalado (recomendado)
pnpm --version

# Si no tienes pnpm, instálalo:
npm install -g pnpm
```

### 🔧 Configuración Paso a Paso

1. **Clona el repositorio**
   ```bash
   git clone [URL_DEL_REPO]
   cd "Smart Hedging Home"
   ```

2. **Instala las dependencias**
   ```bash
   # Opción 1: Con pnpm (recomendado)
   pnpm install
   
   # Opción 2: Con npm (si tienes problemas con pnpm)
   npm install --legacy-peer-deps
   ```

3. **Configura las variables de entorno** (opcional)
   ```bash
   # Crea un archivo .env.local
   cp .env.example .env.local
   
   # Edita las variables según tus necesidades:
   # NEXT_PUBLIC_NEWS_API_KEY=tu_api_key_aqui
   ```

4. **Inicia el servidor de desarrollo**
   ```bash
   # Con pnpm
   pnpm dev
   
   # Con npm
   npm run dev
   ```

5. **Abre tu navegador**
   ```
   http://localhost:3000
   ```

## 🏗️ Estructura del Proyecto

```
Smart Hedging Home/
├── 📁 app/                      # App Router de Next.js
│   ├── layout.tsx              # Layout principal con providers
│   ├── page.tsx                # Dashboard principal
│   ├── scenario/               # Página de constructor de escenarios
│   └── globals.css             # Estilos globales
├── 📁 components/              # Componentes reutilizables
│   ├── analysis-row.tsx        # Componente de fila de análisis
│   ├── impact-event-card.tsx   # Tarjeta de noticia
│   ├── currency-chart-card.tsx # Gráfico de divisas (legacy)
│   └── ui/                     # Componentes de UI base
├── 📁 contexts/                # Contextos de React
│   └── scenario-context.tsx    # Contexto para compartir datos
├── 📁 hooks/                   # Hooks personalizados
│   └── use-news.ts            # Hook para obtener noticias
├── 📁 lib/                     # Utilidades
│   └── utils.ts               # Funciones de utilidad
└── 📁 public/                 # Assets estáticos
```

## 🔧 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia el servidor de desarrollo |
| `pnpm build` | Construye la aplicación para producción |
| `pnpm start` | Inicia el servidor de producción |
| `pnpm lint` | Ejecuta el linter para verificar código |

## 🎨 Componentes Principales

### 📰 ImpactEventCard
Tarjeta compacta que muestra noticias con puntuaciones de impacto IA.

```typescript
<ImpactEventCard
  imageUrl="/path/to/image.jpg"
  title="Noticia del mercado"
  pairs={[
    { pair: "USD/MXN", direction: "up", score: "8/10" }
  ]}
  url="https://link-to-article.com"
  publishedAt="2025-10-25T10:00:00Z"
  source="Bloomberg"
/>
```

### 📊 AnalysisRow
Componente principal que sincroniza noticia, gráfico y estadísticas.

```typescript
<AnalysisRow
  newsItem={newsData}
  impactPairs={impactScores}
  onCurrencyChange={(pair) => handleChange(pair)}
  onMakeScenario={(data) => handleScenario(data)}
/>
```

### 🎯 TimeFilter
Selector de período de tiempo para filtrar datos históricos.

```typescript
<TimeFilter 
  value={timePeriod} 
  onChange={setTimePeriod}
  className="shrink-0"
/>
```

## 🔗 Integración de APIs

### 📈 API de Noticias
El proyecto está preparado para integrarse con múltiples APIs de noticias:

```typescript
// Ejemplo de configuración para NewsAPI
const response = await fetch(
  `https://newsapi.org/v2/everything?q=USD+MXN&apiKey=${API_KEY}`
);

// Ejemplo para Bloomberg API
const response = await fetch(
  `https://api.bloomberg.com/news?symbols=USDMXN&apikey=${API_KEY}`
);
```

### 💱 Datos de Divisas
Actualmente usa datos simulados, pero está preparado para APIs reales:

```typescript
// Estructura esperada para datos de divisas
interface CurrencyData {
  pair: string;
  rate: number;
  change: number;
  min: number;
  max: number;
  timestamp: string;
}
```

## 🚨 Solución de Problemas

### Problema: "pnpm: command not found"
```bash
# Solución: Instala pnpm globalmente
npm install -g pnpm
```

### Problema: Conflictos de dependencias con npm
```bash
# Solución: Usa la flag --legacy-peer-deps
npm install --legacy-peer-deps
```

### Problema: Error de importación de date-fns
```bash
# Verifica que date-fns esté en package.json
grep "date-fns" package.json

# Si no está, instálalo:
pnpm add date-fns
```

### Problema: Componentes UI no se ven correctamente
```bash
# Verifica que Tailwind CSS esté configurado
npm run build

# Verifica que los estilos se estén cargando
```

## 🔄 Flujo de Trabajo de Desarrollo

### 1. Agregar una nueva fuente de noticias
1. Modifica `hooks/use-news.ts`
2. Agrega la nueva API en la función `fetchNews`
3. Actualiza el tipo `NewsItem` si es necesario

### 2. Agregar un nuevo par de divisas
1. Actualiza el array `currencyPairs` en `components/analysis-row.tsx`
2. Agrega los datos correspondientes en las funciones de generación

### 3. Agregar una nueva estrategia de opciones
1. Modifica el array `strategies` en `app/scenario/page.tsx`
2. Actualiza la función `generatePayoffData` para la nueva estrategia

## 📊 Datos de Prueba

El proyecto incluye datos simulados para desarrollo:

- **3 noticias de ejemplo** con diferentes puntuaciones de impacto
- **5 pares de divisas** con datos históricos simulados
- **4 estrategias de opciones** con cálculos de payoff
- **Múltiples períodos de tiempo** para filtros

## 🤝 Contribución

### Estilo de Código
- **ESLint**: Configurado para mantener consistencia
- **TypeScript**: Tipado estricto para mejor calidad
- **Tailwind CSS**: Utilidades first para styling consistente

### Estructura de Commits
```
feat: nueva funcionalidad de análisis de volatilidad
fix: corrección en cálculo de Black-Scholes  
docs: actualización de README
style: mejoras en componente de gráficos
```

## 📱 Responsivo y Accesibilidad

- ✅ **Totalmente responsivo**: Desktop, tablet, móvil
- ✅ **Accesibilidad**: ARIA labels, navegación por teclado
- ✅ **Performance**: Lazy loading, optimización de imágenes
- ✅ **SEO**: Meta tags, estructura semántica

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
# Instala Vercel CLI
npm i -g vercel

# Despliega
vercel --prod
```

### Docker
```dockerfile
# Dockerfile incluido para containerización
docker build -t smart-hedging .
docker run -p 3000:3000 smart-hedging
```

## 📞 Soporte

Si tienes problemas o preguntas:

1. **Revisa la documentación** en este README
2. **Verifica la consola** del navegador para errores
3. **Ejecuta los linters** para verificar el código
4. **Consulta los logs** del servidor de desarrollo

---

## 📝 Notas Adicionales

- **Datos en tiempo real**: Actualmente usa datos simulados, pero está preparado para APIs reales
- **Autenticación**: Estructura preparada para agregar login/logout
- **Internacionalización**: Fácil de extender para múltiples idiomas
- **Testing**: Estructura preparada para agregar tests unitarios

¡Feliz desarrollo! 🚀📈