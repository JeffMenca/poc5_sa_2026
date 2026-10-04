# POC · Saga Pattern vs Circuit Breaker Pattern

Flujo de compra de un e-commerce repartido en cuatro microservicios. La **Saga** (orquestada)
mantiene los datos coherentes cuando un paso falla; el **Circuit Breaker** evita que la falla de un
servicio tumbe a los demás.

```
apps/order-service      :4001  Crea la orden, orquesta la saga y protege cada llamada con su breaker
apps/payment-service    :4002  Cobra y reembolsa
apps/inventory-service  :4003  Reserva y libera stock
apps/shipping-service   :4004  Programa y cancela envíos
apps/web                :3005  Presentación (11 pantallas + 3 de código en el anexo) y demo en vivo en /demo
packages/contracts      Tipos compartidos: el contrato entre los servicios y la web
packages/service-kit    Base común de los servicios: Express, /health, /chaos, errores
docs/                   Informe técnico (md y docx) y guion del video
```

Stack: Node 22 + TypeScript, Express 5, comunicación REST, [Mollitia](https://genesys.github.io/mollitia/)
para Circuit Breaker, Retry, Timeout, Bulkhead y Fallback. Next.js 16 para la web.

## Cómo levantarlo

```bash
npm install
npm run dev
```

- <http://localhost:3005> — la presentación. La flecha → avanza paso a paso dentro de cada pantalla. El código que
  se muestra se lee del repositorio al abrir la página.
- <http://localhost:3005/demo> — la demo: escenarios, los tres breakers en vivo, la saga de cada orden
  paso a paso y la base de datos de cada servicio.

No hace falta base de datos ni Docker: cada servicio guarda en memoria.

## Pruebas

```bash
npm test          # 58 pruebas: unitarias, de cada servicio por HTTP y de integración de los cuatro
npm run typecheck
npm run lint
```

## Endpoints

| Servicio | Acción | Compensación |
| --- | --- | --- |
| Order | `POST /orders` | `DELETE /orders/{id}` |
| Payment | `POST /payments` | `POST /payments/{id}/refund` |
| Inventory | `POST /inventory/reserve` | `POST /inventory/release` |
| Shipping | `POST /shipping/schedule` | `DELETE /shipping/{id}` |

Además: `GET /orders`, `GET /resilience` (estado de los breakers), y en cada servicio `GET /health`,
`PUT /chaos` y `POST /admin/reset`.

`POST /orders` responde **201** si la compra se completó, **422** si un servicio la rechazó por una
regla de negocio (y la saga compensó), y **503** con el fallback «servicio no disponible» si una
dependencia estaba caída.

```bash
curl -X POST localhost:4001/orders -H 'Content-Type: application/json' \
  -d '{"sku":"KEYBOARD","quantity":1,"city":"Quetzaltenango"}'

curl -X PUT localhost:4003/chaos -H 'Content-Type: application/json' -d '{"mode":"failing"}'
curl localhost:4001/resilience
```

Modos de `/chaos`: `healthy`, `failing` (500), `slow` (1.2 s) y `hanging` (5 s y 503). Solo afectan
los comandos (`POST`, `DELETE`); las consultas siguen respondiendo.

## Configuración del Circuit Breaker

En [apps/order-service/src/config.ts](apps/order-service/src/config.ts):

| Parámetro | Valor |
| --- | --- |
| `failureRateThreshold` | 50% |
| `slowCallRateThreshold` | 50% (lenta = más de 1 s) |
| `waitDurationInOpenState` | 10 s |
| `slidingWindowSize` | 10 llamadas |
| `minimumNumberOfCalls` | 5 |
| `permittedNumberOfCallsInHalfOpenState` | 3 |
| Timeout · Retry · Bulkhead | 2 s · 1 reintento · 5 simultáneas |

## Documentación

| Documento | Qué es |
| --- | --- |
| [Informe técnico](docs/00-informe.md) | Investigación, diseño, implementación, pruebas y análisis |
| `docs/informe.docx` | El mismo informe en Word: `npm run report:docx` (requiere pandoc) |
| [Guion del video](docs/01-guion-video.md) | Qué decir en cada pantalla y los pasos exactos de la demo |
