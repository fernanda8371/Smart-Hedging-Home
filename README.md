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

## 👥 Sistema de Usuarios Empresariales

### Perfil de Negocio Completo
El sistema incluye un perfil empresarial integral diseñado para proporcionar contexto específico a los análisis de riesgo de divisas:

```typescript
interface BusinessProfile {
  companyName: string;
  industry: string;
  description: string;
  annualRevenue: string;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  hedgingObjectives: string[];
  operatingCurrencies: string[];
  baseCurrency: string;
}
```

### Páginas de Usuario
- **`/login`**: Página de acceso con cuentas demo empresariales
- **`/settings`**: Configuración completa del perfil empresarial
  - Información de la empresa y industria
  - Configuración financiera (ingresos, monedas)
  - Objetivos de cobertura personalizables
  - Perfil de tolerancia al riesgo
  - Preferencias de notificaciones

### Integración MCP (Model Context Protocol)

#### Generación de URLs con Contexto Empresarial
El sistema genera automáticamente URLs con parámetros que proporcionan contexto empresarial a los modelos de IA:

```typescript
// Ejemplo de URL generada:
// https://api.smarthedging.com/analysis?company=TechCorp&industry=technology&revenue=10M-50M&risk=moderate&currencies=USD,EUR,MXN&objectives=cashflow,budget
```

#### Parámetros MCP Incluidos
- **Contexto empresarial**: Nombre, industria, descripción
- **Perfil financiero**: Ingresos anuales, moneda base
- **Configuración de riesgo**: Tolerancia, objetivos de cobertura
- **Monedas operativas**: Para análisis de impacto personalizado
- **Timestamp**: Para análisis temporal contextual

#### Beneficios para IA
- **Análisis personalizado**: Recomendaciones específicas por industria
- **Cálculos contextuales**: Impacto ajustado al tamaño y perfil de la empresa
- **Estrategias relevantes**: Sugerencias alineadas con objetivos empresariales

## 🗂️ Arquitectura del Proyecto

### Estructura de Componentes

```
Smart Hedging Home/
├── 📁 app/                      # App Router de Next.js
│   ├── layout.tsx              # Layout principal con providers
│   ├── page.tsx                # Dashboard principal
│   ├── login/                  # Sistema de autenticación
│   │   └── page.tsx           # Página de inicio de sesión
│   ├── settings/               # Configuración empresarial
│   │   └── page.tsx           # Gestión de perfil de negocio
│   ├── scenario/               # Página de constructor de escenarios
│   │   └── page.tsx           # Builder de opciones y estrategias
│   └── globals.css             # Estilos globales
├── 📁 components/              # Componentes reutilizables
│   ├── header.tsx              # Header con navegación y usuario
│   ├── analysis-row.tsx        # Componente de fila de análisis
│   ├── impact-event-card.tsx   # Tarjeta de noticia con IA
│   ├── currency-chart-card.tsx # Gráfico de divisas (legacy)
│   └── ui/                     # Componentes de UI base
│       ├── info-tooltip.tsx   # Tooltips explicativos IA
│       ├── time-filter.tsx    # Filtros de período temporal
│       └── [otros...]         # Componentes base Radix UI
├── 📁 contexts/                # Contextos de React
│   ├── user-context.tsx       # Gestión de usuarios empresariales
│   └── scenario-context.tsx    # Contexto para compartir datos
├── 📁 hooks/                   # Hooks personalizados
│   ├── use-news.ts            # Hook para obtener noticias
│   ├── use-mobile.ts          # Detección responsiva
│   └── use-toast.ts           # Sistema de notificaciones
├── 📁 lib/                     # Utilidades
│   └── utils.ts               # Funciones de utilidad
└── 📁 public/                 # Assets estáticos
    └── smarthedginglogo.png   # Logo de la empresa
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

### 🏢 Header
Componente de navegación principal con integración de usuario empresarial.

```typescript
<Header />
// Muestra: Logo + Navegación + Perfil de usuario + Contexto empresarial
```

### ℹ️ InfoTooltip
Tooltips explicativos para puntuaciones de riesgo generadas por IA.

```typescript
<InfoTooltip content="Explicación detallada del score de riesgo">
  <Button variant="ghost" size="sm">8/10</Button>
</InfoTooltip>
```

### 👤 Contextos de Usuario
Sistema completo de gestión empresarial con persistencia.

```typescript
// UserContext proporciona:
- userProfile: BusinessProfile | null
- isLoggedIn: boolean  
- login: (profile) => void
- logout: () => void
- updateProfile: (updates) => void
- generateMCPUrl: (baseUrl) => string
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

## ⚙️ Configuración y Variables de Entorno

### Variables de Entorno Requeridas
Crea un archivo `.env.local` en la raíz del proyecto:

```env
# APIs de Noticias (opcionales para demo)
NEXT_PUBLIC_NEWS_API_KEY=tu_news_api_key
NEXT_PUBLIC_BLOOMBERG_API_KEY=tu_bloomberg_key
NEXT_PUBLIC_REUTERS_API_KEY=tu_reuters_key

# MCP Configuration (opcional)
NEXT_PUBLIC_MCP_BASE_URL=https://api.smarthedging.com
NEXT_PUBLIC_MCP_API_VERSION=v1

# Configuración de la aplicación
NEXT_PUBLIC_APP_NAME=Smart Hedging Home
NEXT_PUBLIC_COMPANY_NAME=Tu Empresa
```

### Configuración de Desarrollo
```typescript
// El sistema funciona sin APIs reales usando datos de demo
// Para producción, configura las APIs reales en:
// hooks/use-news.ts - líneas 20-30

const USE_REAL_APIs = process.env.NODE_ENV === 'production';
```

### Configuración MCP
```typescript
// URLs generadas automáticamente incluyen:
// - Perfil empresarial completo
// - Monedas operativas
// - Tolerancia al riesgo
// - Timestamp para contexto temporal

// Ejemplo de URL MCP generada:
// https://api.smarthedging.com/analysis?company=TechCorp&industry=technology&revenue=10M-50M&risk=moderate&currencies=USD,EUR,MXN&objectives=cashflow,budget&timestamp=1698235200
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

## � Flujo de Usuario Completo

### 1. Onboarding Empresarial
```
/login → Selección de cuenta demo → Configuración inicial
```

### 2. Configuración del Perfil
```
/settings → Perfil empresarial → Monedas operativas → Objetivos de cobertura
```

### 3. Análisis de Riesgo
```
/ (Dashboard) → Análisis sincronizado → Filtros temporales → Insights IA
```

### 4. Creación de Estrategias
```
/scenario → Constructor de opciones → Análisis de payoff → Ejecutar estrategia
```

### 5. Integración MCP
```
Cualquier página → URL con contexto empresarial generada automáticamente
```

## 🧪 Testing y Validación

### Cuentas Demo Incluidas
```typescript
// Cuentas empresariales de prueba disponibles en /login
const DEMO_ACCOUNTS = [
  {
    id: 'tech-startup',
    companyName: 'TechCorp Solutions', 
    industry: 'Technology',
    annualRevenue: '10M-50M'
  },
  {
    id: 'manufacturing',
    companyName: 'Global Manufacturing Inc',
    industry: 'Manufacturing', 
    annualRevenue: '50M-200M'
  },
  // ... más cuentas
];
```

### Testing del Sistema MCP
```typescript
// Verifica que las URLs se generen correctamente
const mcpUrl = generateMCPUrl('https://api.smarthedging.com');
console.log(mcpUrl);
// Output esperado: URL con todos los parámetros empresariales
```

## �📊 Datos de Prueba

El proyecto incluye datos simulados para desarrollo:

- **3 noticias de ejemplo** con diferentes puntuaciones de impacto
- **5 pares de divisas** con datos históricos simulados  
- **4 estrategias de opciones** con cálculos de payoff
- **Múltiples períodos de tiempo** para filtros
- **6 cuentas demo empresariales** con perfiles completos
- **URLs MCP generadas** con contexto empresarial real

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