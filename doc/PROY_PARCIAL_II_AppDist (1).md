

Universidad de las Fuerzas Armadas ESPE
Departamento de Ciencias de la Computaci ́on
Carrera de Ingenier ́ıa en Software
## Aplicaciones Distribuidas
Proyecto Integrador Parcial II
## Docente: Geovanny Cudco
3 de diciembre de 2025
## 1    Tema
LogiFlow  –  Plataforma  Integral  de  Gesti ́on  de  Operaciones  para  una  Empresa  de
## Delivery Multinivel.
## 2    Descripci ́on General:
La empresa EntregaExpress S.A. es una compa ̃n ́ıa de log ́ıstica y delivery que opera
en tres modalidades de servicio:
a.  Entregas urbanas r ́apidas ( ́ultima milla) mediante motorizados,
b.  Entregas  intermunicipales  dentro  de  la  provincia  con  veh ́ıculos  livianos  (autos  o
camionetas),
c.  Entregas nacionales mediante furgonetas o camiones medianos/grandes.
Actualmente,  la  empresa  gestiona  estas  operaciones  mediante  procesos  manuales,
hojas  de  c ́alculo  y  aplicaciones  independientes  no  integradas,  lo  que  genera  errores  en
la  trazabilidad,  demoras  en  la  asignaci ́on  de  rutas,  inconsistencias  en  el  estado  de  los
pedidos y baja visibilidad operativa en tiempo real.
Con  el  fin  de  modernizar  sus  operaciones,  EntregaExpress  desea  desarrollar  una
plataforma centralizada y escalable, basada en microservicios, que permita gestionar de
## 1

forma eficiente el ciclo de vida completo de un delivery: desde la recepci ́on del pedido
hasta  la  confirmaci ́on  de  entrega,  incluyendo  la  gesti ́on  de  flota,  conductores,  clientes,
zonas de cobertura y facturaci ́on.
La plataforma debe contar con un panel de control web para supervisores y gerentes,
as ́ı como APIs para integraci ́on con apps m ́oviles de repartidores y clientes, y para futuras
integraciones con sistemas de terceros (ERP, CRM, sistemas de pago, etc.).
## 3    Objetivo
Dise ̃nar  e  implementar  LogiFlow,  una  arquitectura  de  microservicios  que  soporte
las   operaciones   multinivel   de   EntregaExpress,   garantizando   alta   disponibilidad,
escalabilidad, consistencia transaccional y seguridad.
La aplicaci ́on debe:
–  Permitir el registro y seguimiento en tiempo real de pedidos, con actualizaciones
din ́amicas mediante WebSockets (p. ej., estado del pedido, ubicaci ́on del repartidor,
alertas).
–  Exponer funcionalidades  mediante  APIs  REST (para  operaciones  CRUD  simples
y sincronizaci ́on con apps m ́oviles) y APIs GraphQL (para consultas complejas y
personalizadas desde el panel de control y dashboards).
–  Utilizar un API Gateway como punto  ́unico de entrada, encargado del enrutamiento,
autenticaci ́on, rate limiting y composici ́on de servicios.
–  Implementar    autenticaci ́on    y    autorizaci ́on    basada    en    JWT,    con    roles
diferenciados:    cliente,    repartidor    (motorizado/veh ́ıculo/cami ́on),    supervisor,
gerente, administrador del sistema.
–  Asegurar  la  integridad  de  operaciones  cr ́ıticas  (p.  ej.,  asignaci ́on  de  pedido  +
reducci ́on de stock + creaci ́on de ruta) mediante transacciones ACID en contextos
locales y, cuando sea necesario, coordinar flujos distribuidos con el patr ́on Saga (p.
ej., cancelaci ́on de pedido despu ́es de despacho parcial).
–  Aplicar principios de dise ̃no orientado a objetos: usar clases abstractas para modelar
comportamientos  comunes  pero  no  instanciables  (p.  ej.:  VehiculoEntrega,  con
subclases Motorizado, VehiculoLiviano, Camion), y interfaces para definir contratos
de  comportamiento  interoperable  (p.  ej.:   IProcesableEntrega,   IRegistrableGPS,
INotificable).
–  Incorporar  al  menos  tres  patrones  de  dise ̃no  relevantes  (p.  ej.:  Factory   para
creaci ́on  de  tipos  de  entrega,  Observer  para  notificaciones  de  estado,  Command
para operaciones reversibles en sagas).
## 4    Funcionalidades
El   sistema   LogiFlow   distribuye   sus   capacidades   entre   capas   especializadas.   A
continuaci ́on, se detallan las funcionalidades por  ́ambito de responsabilidad.
## 2

4.1    Funcionalidades del Backend
El backend, basado en una arquitectura de microservicios, proporciona la l ́ogica de
negocio, garantiza consistencia transaccional y expone interfaces estandarizadas:
Autenticaci ́on y autorizaci ́on centralizada: El AuthService emite JWT con
claims  estructurados  (role, scope, zoneid, fleettype)  y  valida  todas  las
peticiones en el API Gateway. Soporta rotaci ́on y revocaci ́on de tokens.
Gesti ́on transaccional de pedidos: El PedidoService permite crear, actualizar
y cancelar pedidos. Cada operaci ́on cr ́ıtica (ej. confirmaci ́on de entrega) se ejecuta
mediante  una  transacci ́on  ACID  local;  operaciones  distribuidas  (ej.  cancelaci ́on
post-despacho) se coordinan con el patr ́on Saga Orquestada.
Asignaci ́on  din ́amica  de  flota  y  rutas:  El FleetService  y RoutingService
colaboran  para  asignar  repartidores  aptos  seg ́un  tipo  de  veh ́ıculo,  disponibilidad
y  proximidad.  Utilizan  una  jerarqu ́ıa  de  clases: VehiculoEntrega  (abstracta)  y
sus  subclases  (Motorizado, VehiculoLiviano, Camion),  adem ́as  de  la  interfaz
IRuteable para estandarizar la generaci ́on de rutas.
Seguimiento   geoespacial   en   tiempo   real:   El  TrackingService   recibe
actualizaciones  GPS  mediante  API  REST  (punto  final POST /track)  y  publica
eventos  en  un  bus  de  mensajes.  Un  WebSocket  broadcaster  (acoplado  al  API
Gateway) los redistribuye a clientes suscritos.
Notificaciones  as ́ıncronas  y  eventos  de  negocio:  El NotificationService
consume eventos desde colas (Kafka/RabbitMQ) y env ́ıa alertas por SMS, correo o
push. Tambi ́en emite eventos para dashboards y auditor ́ıa.
Facturaci ́on y reportes t ́ecnicos: El BillingService calcula tarifas din ́amicas,
genera facturas electr ́onicas y expone endpoints para reportes consolidados (diarios,
por zona, por tipo de veh ́ıculo).
Exposici ́on de APIs diferenciadas:
-  REST :  para  operaciones  CRUD  y  sincronizaci ́on  con  apps  m ́oviles  (ej. GET
/pedidos/{id}, PATCH /repartidores/{id}/estado).
-  GraphQL: para consultas complejas y eficientes desde el panel de control (evita
m ́ultiples round trips y over-fetching).
4.2    Funcionalidades del Frontend
El  frontend  se  implementa  como  una  aplicaci ́on  web  adaptativa  (responsive),  con
interfaces especializadas por rol y acoplamiento ligero al backend:
Autenticaci ́on y gesti ́on de sesi ́on: Interfaz de login con soporte para m ́ultiples
roles. Gesti ́on transparente de JWT (almacenamiento seguro en httpOnly cookies
o sessionStorage), renovaci ́on autom ́atica y logout con invalidaci ́on remota.
Panel de control por roles:
## 3

-  Cliente: historial de pedidos, seguimiento en mapa interactivo (con marcadores
en tiempo real), chat con repartidor y opci ́on de cancelaci ́on.
-  Repartidor :  lista  de  asignaciones  pendientes/en  curso,  navegaci ́on  asistida
(integraci ́on con maps), escaneo de QR en entrega, reporte de incidencias (foto
+ descripci ́on).
-  Supervisor : mapa de flota en su zona, alertas de retraso (¿15 min), herramienta
de reasignaci ́on manual con arrastrar-y-soltar, reporte diario descargable.
-  Gerente/Administrador :   dashboard   de   KPIs   (OTD,   costo   por   entrega,
satisfacci ́on), filtros por regi ́on/fecha, comparativos mensuales y visualizaci ́on
de logs de sagas fallidas.
Visualizaci ́on en tiempo real mediante WebSocket: Suscripci ́on autom ́atica
a  canales  tem ́aticos  seg ́un  rol  y  contexto  (ej.  cliente: /topic/pedido/P-123;
supervisor: /topic/zona/QUITONORTE).   Actualizaci ́on   autom ́atica   del   UI   sin
recarga.
Consultas eficientes con GraphQL: Uso de clientes GraphQL (ej. Apollo Client)
para recuperar datos estructurados y personalizados. Ejemplo: un supervisor puede
solicitar  m ́etricas  de  desempe ̃no  de  sus  repartidores  con  una   ́unica  consulta,  sin
campos innecesarios.
Gesti ́on  de  incidentes  y  retroalimentaci ́on:  Formularios  para  reporte  de
problemas   (paquete   da ̃nado,   direcci ́on   incorrecta)   con   adjunto   de   imagen   y
geolocalizaci ́on autom ́atica. Estado visible en el historial del pedido.
Exportaci ́on y accesibilidad: Botones de exportaci ́on a CSV/PDF en reportes
tabulares. Soporte para contraste alto y navegaci ́on por teclado (cumpliendo WCAG
2.1 nivel AA).
5    Fases del proyecto
El desarrollo de LogiFlow  se organiza en tres fases progresivas, que permiten validar
la  arquitectura  de  forma  incremental  y  garantizar  la  calidad  en  cada  capa.  Cada  fase
define un conjunto m ́ınimo viable de componentes funcionales, con  ́enfasis en cohesi ́on,
separaci ́on de responsabilidades y cumplimiento de requisitos t ́ecnicos.
5.1    Fase  1:  Backend  —  Servicios  REST  para  Operaciones
CRUD y API Gateway
Esta fase establece la base transaccional y de seguridad del sistema. Debe garantizar
integridad, autenticaci ́on y acceso controlado a los recursos fundamentales.
Microservicios REST con operaciones CRUD b ́asicas:
- AuthService: registro, login, refresh/revoke token; persistencia de usuarios y
roles. Endpoints: POST /login, POST /register, POST /token/refresh.
- PedidoService: creaci ́on, consulta, modificaci ́on parcial (PATCH) y cancelaci ́on
l ́ogica de pedidos. Validaci ́on de tipo de entrega y cobertura geogr ́afica.
## 4

- FleetService: gesti ́on de repartidores y veh ́ıculos (alta, baja, actualizaci ́on
de estado: DISPONIBLE, EN
## RUTA, MANTENIMIENTO).
- BillingService (m ́ınimo): c ́alculo de tarifa b ́asica y generaci ́on de factura en
estado BORRADOR.
API Gateway (ej. Spring Cloud Gateway, Kong o Apigee):
-  Enrutamiento por prefijo de ruta (ej. /api/pedidos/** → PedidoService).
-  Validaci ́on de JWT en todas las rutas protegidas; rechazo con 401/403 en caso
de error.
-  Rate limiting por cliente (ej. 100 req/min).
-  Logging centralizado de m ́etodo, URI, c ́odigo de respuesta y userId (si aplica).
Requisitos t ́ecnicos m ́ınimos:
-  Todas   las   operaciones   de   escritura   son   transacciones   ACID   (uso   de
@Transactional o equivalente).
-  Validaci ́on   de   esquema   de   entrada   (con   anotaciones   o   librer ́ıas   como
celebrate/FluentValidation).
-  Documentaci ́on OpenAPI 3.0 accesible en /swagger-ui.html o /docs.
Criterio de aceptaci ́on: Un cliente autenticado puede crear un pedido urbano, y
un supervisor puede consultarlo y ver su estado en RECIBIDO, usando  ́unicamente
endpoints REST y el API Gateway.
5.2    Fase 2: Backend — APIs GraphQL, Mensajer ́ıa As ́ıncrona
y Comunicaci ́on en Tiempo Real
Esta fase enriquece el backend con capacidades de consulta flexible, desacoplamiento
y actualizaci ́on din ́amica, prepar ́andolo para escenarios de alta concurrencia y monitoreo
operativo.
API GraphQL (ej. Apollo Server, GraphQL.NET, Spring for GraphQL):
-  Schema que exponga tipos relacionados: Pedido, Repartidor, Vehiculo, Zona,
## KPI.
-  Resolvers eficientes con data loaders  para evitar el problema N+1.
-  Consultas de ejemplo implementadas:
# Dashboard  supervisor
query  PedidosEnZona($zonaId: ID!,$estado: EstadoPedido) {
pedidos(filtro: {zonaId:$zonaId , estado:$estado }) {
id , cliente {nombre}, destino , estado ,
repartidor {nombre , vehiculo {tipo}}
tiempoTranscurrido , retrasoMin
## }
flotaActiva(zonaId:$zonaId) {
total , disponibles , enRuta
## }
## }
## 5

Sistema de Mensajer ́ıa (RabbitMQ o Kafka):
-  Colas/exchangesdefinidosparaeventosclave:   pedido.creado,
pedido.estado.actualizado,      repartidor.ubicacion.actualizada,
saga.iniciada.
-  Productores en PedidoService, FleetService y TrackingService.
-  Consumidor  en NotificationService  que  dispara  alertas  (SMS/email)  y
actualiza cach ́es.
-  Mensajes idempotentes y con messageId para deduplicaci ́on.
WebSocket Server (integrado al API Gateway o como servicio independiente):
-  Endpoint /ws  con  handshake  JWT-autenticado  (token  en  par ́ametro  de
consulta o encabezado).
-  Broadcastselectivomediantet ́opicos(ej.   /topic/pedido/P-123,
/topic/zona/Z-45).
-  Reenv ́ıo de  ́ultimos eventos al reconectar (replay  limitado por TTL).
Requisitos t ́ecnicos m ́ınimos:
-  El  WebSocket  broadcaster  consume  del  bus  de  mensajes  (no  de  peticiones
HTTP directas).
-  La   API   GraphQL   no   expone   operaciones   de   mutaci ́on   cr ́ıticas   (ej.
confirmarEntrega);  ́estas permanecen en REST para trazabilidad y control
transaccional.
-  Monitoreo de colas (lag, tasa de rechazo) con Prometheus + Grafana.
Criterio  de  aceptaci ́on:  Un  supervisor  recibe,  en  menos  de  2  segundos,  una
notificaci ́on push y una actualizaci ́on autom ́atica en su interfaz cuando un pedido
en su zona cambia a estado EN
RUTA, gracias a la cadena: REST (actualizaci ́on) →
Kafka → NotificationService + WebSocket.
5.3    Fase   3:   Frontend   —   Panel   de   Control   Funcional   y
Experiencia de Usuario
Esta fase integra todas las capas anteriores en una interfaz usable, segura y adaptada
a cada actor operativo.
Aplicaci ́on   web   monol ́ıtica   o   modular   (React,   Angular   o   Vue),   con
enrutamiento por roles:
-  Rutas protegidas: redirecci ́on autom ́atica si el JWT es inv ́alido o falta permiso.
-  Layouts diferenciados: cliente (enfocado en seguimiento), repartidor (enfocado
en tareas), supervisor (mapa + lista), gerente (KPIs).
Integraci ́on con backend:
-  Llamadas REST para mutaciones (crear pedido, cambiar estado).
## 6

-  Cliente GraphQL (ej. Apollo) para consultas complejas en dashboards.
-  Conexi ́on   WebSocket   persistente   tras   login;   suscripci ́on   autom ́atica   a
t ́opicos   relevantes   seg ́un   contexto   (ej.   al   abrir   un   pedido,   suscribe   a
## /topic/pedido/{id}).
Componentes funcionales clave:
-  Mapa interactivo (con Leaflet o Mapbox): superposici ́on de repartidores, rutas
y zonas; actualizaci ́on autom ́atica v ́ıa WebSocket.
-  Lista  de  pedidos  con  filtros  din ́amicos  (por  estado,  fecha,  zona)  y  acciones
contextuales (reasignar, marcar como entregado).
-  Formulario de incidencias : captura de foto, geolocalizaci ́on autom ́atica y env ́ıo
con adjunto base64.
-  Exportaci ́on  de  reportes : bot ́ones que generan CSV/PDF mediante llamadas
a endpoints del BillingService o PedidoService.
Requisitos t ́ecnicos m ́ınimos:
-  Almacenamiento   seguro   de   tokens   (evitando localStorage   para   JWT
sensibles).
-  Manejo de errores consistente (mensajes claros, sin exponer stack traces).
-  Pruebas de accesibilidad b ́asicas (contraste, etiquetas ARIA, navegaci ́on por
teclado).
Criterio  de  aceptaci ́on:  Un  supervisor  puede:  (1)  visualizar  en  el  mapa  a  tres
repartidores en tiempo real, (2) reasignar un pedido arrastr ́andolo a otro repartidor,
(3) ver la actualizaci ́on inmediata del estado en la lista y en el mapa, y (4) descargar
un reporte CSV de sus operaciones del d ́ıa — todo sin recargar la p ́agina.
6    Listado de Entregables por Fase
6.1    Fase 1: Backend — Servicios REST y API Gateway
-  Informe t ́ecnico usando la plantilla de LaTeX  entregada previamente.
-  C ́odigo    fuente    de    los    microservicios:  auth-service,  pedido-service,
fleet-service, billing-service  (versi ́on  m ́ınima),  con  estructura  modular
(controladores, servicios, repositorios).
-  Contratos   OpenAPI   3.0   (archivos  .yaml   o  swagger.json)   para   cada
microservicio, incluyendo ejemplos de solicitud/respuesta y c ́odigos de estado.
-  API Gateway configurado (ej. YAML de Spring Cloud Gateway o declaraciones
en Kong), con:
Enrutamiento a los 4 microservicios por prefijo.
Filtro de autenticaci ́on JWT (validaci ́on de firma, expiraci ́on y claim role).
Rate limiting por clave de cliente (X-API-Key o sub del token).
## 7

-  Base de datos relacional (esquema SQL o migraciones Liquibase/Flyway) con
tablas para: usuarios, roles, pedidos, repartidores, vehiculos, facturas.
-  Pruebas  unitarias  e  integraci ́on  (JUnit/TestContainers  o  equivalentes)  que
cubran:
Creaci ́on de pedido con validaci ́on de tipo de entrega.
Asignaci ́on de repartidor disponible.
Rechazo de petici ́on no autenticada (c ́odigo 401) o sin permisos (403).
-  Documento  de  dise ̃no  t ́ecnico  (m ́ınimo):  diagrama  de  arquitectura  de  alto
nivel (componentes + flujo de autenticaci ́on) y justificaci ́on de decisiones (ej. uso
de transacciones locales, no uso de Saga en esta fase).
6.2    Fase 2: Backend — GraphQL, Mensajer ́ıa y WebSocket
-  Esquema  GraphQL  (schema.graphqls)  con  tipos,  queries  y  resolvers  para  al
menos:
pedido(id: ID!): Pedido
pedidos(filtro: PedidoFiltro): [Pedido!]!
flotaActiva(zonaId: ID!): FlotaResumen
kpiDiario(fecha: Date!, zonaId: ID): KPIDiario
-  Servidor GraphQL funcional, con resolvers que eviten N+1 (uso de DataLoader
o equivalentes) y m ́etricas de rendimiento (cach ́e hit/miss).
-  Configuraci ́on de RabbitMQ/Kafka: declaraciones de queues/exchanges/topics
(archivos .json o scripts .sh), con pol ́ıticas de retenci ́on y replicaci ́on definidas.
-  Productores y consumidores:
Productoren     PedidoServicequepubliqueevento
pedido.estado.actualizado.
Consumidor en notification-service que reciba el evento y registre en log
(simulaci ́on de env ́ıo).
Productor en tracking-service que publique ubicaci ́on.
-  Servidor WebSocket (independiente o integrado en API Gateway) con:
Endpoint /ws que valide JWT en handshake.
Mecanismo de broadcast selectivo por t ́opico (ej. SimpMessagingTemplate en
Spring, socket.io rooms en Node.js).
Registro de suscripciones y desconexiones en log.
-  Pruebas de integraci ́on as ́ıncrona:
Simulaci ́on de actualizaci ́on de estado de pedido → verificaci ́on de publicaci ́on
en cola.
## 8

Consumo del mensaje y emisi ́on v ́ıa WebSocket (validado con cliente de prueba,
ej. wscat).
-  Documentaci ́on  de  flujo  de  eventos:  diagrama  de  secuencia  (Mermaid  o
PlantUML)  que  muestre  la  cadena:  REST  update →  evento →  consumidor →
WebSocket broadcast.
6.3    Fase 3: Frontend — Panel de Control Funcional
-  C ́odigo fuente de la aplicaci ́on frontend (React/Angular/Vue), con:
Sistema de rutas protegidas (lazy-loaded por rol).
Servicios de autenticaci ́on (login, token refresh, logout).
Cliente HTTP para REST (ej. axios) y cliente GraphQL (ej. Apollo Client).
Servicio de WebSocket con reconexi ́on autom ́atica y manejo de suscripciones.
-  Vistas implementadas (m ́ınimo):
Login y registro (cliente/repartidor).
Cliente: lista de pedidos + vista de seguimiento con mapa y chat.
Repartidor: lista de asignaciones + formulario de confirmaci ́on de entrega (con
foto).
Supervisor: dashboard con mapa, lista filtrable y bot ́on de reasignaci ́on.
Gerente: vista de KPIs con gr ́aficos (Chart.js o similar) y selector de rango de
fechas.
-  Integraciones verificables:
Al crear un pedido (formulario → REST), se muestra en la lista sin recargar.
Al  actualizar  estado  en  backend  (v ́ıa  Postman  o  interfaz  del  repartidor),  el
supervisor ve el cambio en el mapa y la lista en ¡2 s (v ́ıa WebSocket).
Al  ejecutar  consulta  GraphQL  en  el  dashboard  del  supervisor,  se  obtienen
datos sin m ́ultiples llamadas REST.
-  Exportaci ́on  funcional:  bot ́on  Exportar  CSV   que  descarga  un  archivo  con
formato v ́alido (cabeceras, delimitador, codificaci ́on UTF-8).
-  Pruebas de interfaz: reporte de Lighthouse (accesibilidad  85, performance  75)
o equivalente.
-  Manual de usuario (m ́ınimo): gu ́ıa de 1–2 p ́aginas por rol, con capturas y pasos
para: crear pedido, seguir entrega, reasignar, generar reporte.
## 9

7    Cronograma de Entregas
El desarrollo de LogiFlow  se ejecuta bajo un cronograma de entregas incrementales,
con  hitos  t ́ecnicos  verificables.  Las  fechas  l ́ımite  son  contundentes  y  corresponden  a  la
entrega formal de los artefactos definidos en la Secci ́on 6.
FaseContenido PrincipalFecha    L ́ımite    de
## Entrega
Fase 1Backend:  Servicios  REST  CRUD  +  API
## Gateway
15 de diciembre de
## 2025
Fase 2Backend:GraphQL,Mensajer ́ıa
(RabbitMQ/Kafka) y WebSocket
14 de enero de 2026
Fase 3Frontend:   Panel   de   Control   Funcional   y
Experiencia de Usuario
13   de   febrero   de
## 2026
## Notas:
Las entregas incluyen c ́odigo fuente, documentaci ́on t ́ecnica m ́ınima y evidencia de
pruebas  (logs, capturas, reportes).
Se  aceptan  entregas  anticipadas  para  revisi ́on  formativa  (retroalimentaci ́on  sin
penalizaci ́on).
Entregas posteriores a la fecha l ́ımite tendr ́an una penalizaci ́on del 100 % (no se
aceptan).
En  caso  de  imprevistos  institucionales  (ej.  paro,  emergencia),  las  fechas  ser ́an
reprogramadas mediante comunicaci ́on oficial por escrito.
## 10