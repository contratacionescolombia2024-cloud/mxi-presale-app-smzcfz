
# MXI Presale App

Aplicación de preventa de tokens MXI construida con React Native y Expo 54.

## Características Principales

- **Sistema de Preventa por Etapas**: 3 etapas de 30 días cada una con precios progresivos
- **Sistema de Vesting**: Rendimiento del 3% mensual calculado en tiempo real
- **Comisiones Multinivel**: Sistema de referidos con 3 niveles (5%, 2%, 1%)
- **Verificación KYC**: Sistema robusto de verificación de identidad
- **Panel de Administración**: Control completo de métricas y usuarios
- **Pagos Crypto**: Integración con PayPal y Binance
- **Juegos y Torneos**: Sistema de minijuegos con recompensas
- **Multiidioma**: Soporte para español e inglés

## Estructura del Proyecto

```
├── app/                    # Rutas de la aplicación (Expo Router)
│   ├── (auth)/            # Pantallas de autenticación
│   ├── (tabs)/            # Pantallas principales con navegación
│   ├── ecosystem/         # Información del ecosistema MXI
│   └── games/             # Minijuegos
├── components/            # Componentes reutilizables
├── contexts/              # Contextos de React (Auth, Language, PreSale, Wallet)
├── constants/             # Constantes y configuraciones
├── styles/                # Estilos compartidos
├── utils/                 # Utilidades y helpers
└── types/                 # Definiciones de TypeScript

```

## Tecnologías

- **React Native 0.81.5**
- **Expo 54**
- **Supabase**: Base de datos y autenticación
- **Expo Router**: Navegación basada en archivos
- **TypeScript**: Tipado estático
- **Web3Modal/Wagmi**: Integración de wallets (solo web)

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npm run dev

# Plataformas específicas
npm run ios
npm run android
npm run web
```

## Configuración

### Supabase

El proyecto está conectado a Supabase con el siguiente proyecto:
- **Project ID**: kllolspugrhdgytwdmzp
- **URL**: https://kllolspugrhdgytwdmzp.supabase.co

### Variables de Entorno

Las credenciales de Supabase están configuradas en `app/integrations/supabase/client.ts`.

## Arquitectura

### Plataformas Específicas

El proyecto utiliza archivos específicos por plataforma:
- `.native.tsx` - iOS y Android
- `.web.tsx` - Web
- `.ios.tsx` - Solo iOS
- `.android.tsx` - Solo Android
- `.tsx` - Fallback para todas las plataformas

### Contextos Principales

1. **AuthContext**: Manejo de autenticación y sesión de usuario
2. **LanguageContext**: Internacionalización (i18n)
3. **PreSaleContext**: Estado de la preventa y compras
4. **WalletContext**: Conexión de wallets (específico por plataforma)
5. **WidgetContext**: Estado de widgets y UI

### Navegación

- Navegación basada en archivos con Expo Router
- Tabs nativos en iOS usando `expo-router/unstable-native-tabs`
- FloatingTabBar personalizado en Android

## Base de Datos

### Tablas Principales

- `users`: Información de usuarios
- `purchases`: Compras de tokens MXI
- `referrals`: Sistema de referidos
- `vesting_records`: Registros de vesting
- `kyc_verifications`: Verificaciones KYC
- `tournaments`: Torneos y competencias
- `messages`: Mensajería con administradores

Todas las tablas implementan Row Level Security (RLS) para seguridad.

## Estado Actual

✅ **Funcional y Estable**

La aplicación ha sido restaurada a un estado limpio y funcional con:
- Configuración simplificada de Metro
- Manejo correcto de plataformas específicas
- Providers organizados y optimizados
- Archivos de documentación innecesarios eliminados
- Estructura de código limpia y mantenible

## Próximos Pasos

1. Configurar WalletConnect Project ID en `config/web3Config.web.ts`
2. Verificar y actualizar las políticas RLS en Supabase
3. Configurar las credenciales de pago (PayPal, Binance)
4. Realizar pruebas exhaustivas en todas las plataformas

## Soporte

Para problemas o preguntas, consultar la documentación en la carpeta `docs/`.
