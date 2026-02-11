# LogiFlow Kubernetes Deployment Guide

Este directorio contiene todos los manifiestos de Kubernetes necesarios para desplegar el sistema LogiFlow en un clúster de Kubernetes.

## 📁 Estructura de Archivos

```
k8s/
├── namespace.yaml                    # Namespace 'logiflow'
├── secrets.yaml                      # Credenciales sensibles
├── configmaps.yaml                   # Configuración general
├── databases/                        # StatefulSets de PostgreSQL
│   ├── postgres-auth.yaml
│   ├── postgres-pedidos.yaml
│   ├── postgres-fleet.yaml
│   ├── postgres-inventory.yaml
│   ├── postgres-billing.yaml
│   ├── postgres-tracking.yaml
│   └── postgres-notification.yaml
├── infrastructure/
│   └── rabbitmq.yaml                # RabbitMQ Deployment
└── services/                        # Microservicios
    ├── api-gateway.yaml
    ├── auth-service.yaml
    ├── pedidos-service.yaml
    ├── fleet-service.yaml
    ├── inventory-service.yaml
    ├── notification-service.yaml
    ├── billing-service.yaml
    └── tracking-service.yaml
```

## 🚀 Despliegue

### Prerrequisitos

1. **Kubernetes cluster** (minikube, kind, GKE, EKS, AKS, etc.)
2. **kubectl** configurado y conectado al cluster
3. **Docker images** construidas para cada microservicio

### Paso 1: Construir las imágenes Docker

```bash
# Desde la raíz del proyecto
docker build -t logiflow/api-gateway:latest -f apps/api-gateway/Dockerfile .
docker build -t logiflow/auth-service:latest -f apps/auth-services/Dockerfile .
docker build -t logiflow/pedidos-service:latest -f apps/pedidos-service/Dockerfile .
docker build -t logiflow/fleet-service:latest -f apps/fleet-service/Dockerfile .
docker build -t logiflow/inventory-service:latest -f apps/inventory-service/Dockerfile .
docker build -t logiflow/notification-service:latest -f apps/notification-service/Dockerfile .
docker build -t logiflow/billing-service:latest -f apps/billing-service/Dockerfile .
docker build -t logiflow/tracking-service:latest -f apps/tracking-service/Dockerfile .
```

Si usas **minikube**, carga las imágenes al registro interno:
```bash
minikube image load logiflow/api-gateway:latest
minikube image load logiflow/auth-service:latest
minikube image load logiflow/pedidos-service:latest
minikube image load logiflow/fleet-service:latest
minikube image load logiflow/inventory-service:latest
minikube image load logiflow/notification-service:latest
minikube image load logiflow/billing-service:latest
minikube image load logiflow/tracking-service:latest
```

### Paso 2: Aplicar manifiestos en orden

```bash
# 1. Crear namespace
kubectl apply -f k8s/namespace.yaml

# 2. Crear secrets y configmaps
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmaps.yaml

# 3. Desplegar bases de datos
kubectl apply -f k8s/databases/

# 4. Esperar a que las bases de datos estén listas
kubectl wait --for=condition=ready pod -l app=postgres-auth -n logiflow --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres-pedidos -n logiflow --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres-fleet -n logiflow --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres-inventory -n logiflow --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres-billing -n logiflow --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres-tracking -n logiflow --timeout=300s
kubectl wait --for=condition=ready pod -l app=postgres-notification -n logiflow --timeout=300s

# 5. Desplegar RabbitMQ
kubectl apply -f k8s/infrastructure/rabbitmq.yaml

# 6. Esperar a que RabbitMQ esté listo
kubectl wait --for=condition=ready pod -l app=rabbitmq -n logiflow --timeout=300s

# 7. Desplegar microservicios
kubectl apply -f k8s/services/
```

### Paso 3: Verificar el despliegue

```bash
# Ver todos los pods
kubectl get pods -n logiflow

# Ver todos los servicios
kubectl get svc -n logiflow

# Ver logs de un servicio específico
kubectl logs -f deployment/api-gateway -n logiflow

# Ver estado general
kubectl get all -n logiflow
```

## 🔧 Configuración

### Modificar Secrets (IMPORTANTE)

Antes de desplegar en producción, **cambia las credenciales** en [secrets.yaml](secrets.yaml):

```yaml
# secrets.yaml
stringData:
  POSTGRES_USER: tu_usuario_seguro
  POSTGRES_PASSWORD: tu_password_seguro
  RABBITMQ_DEFAULT_USER: tu_usuario_rabbitmq
  RABBITMQ_DEFAULT_PASS: tu_password_rabbitmq
  JWT_SECRET: tu-super-secret-jwt-key-muy-largo-y-aleatorio
  MAILJET_API_KEY: tu_api_key
  MAILJET_API_SECRET: tu_api_secret
```

### Ajustar recursos

Modifica los límites de recursos según tu cluster en cada archivo de servicio:

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

## 🌐 Acceso externo

### API Gateway (LoadBalancer)

El API Gateway está expuesto como `LoadBalancer`:

```bash
# Obtener la IP externa
kubectl get svc api-gateway -n logiflow

# En minikube, usa:
minikube service api-gateway -n logiflow
```

### RabbitMQ Management UI

RabbitMQ también está expuesto como `LoadBalancer`:

```bash
# Obtener la IP externa
kubectl get svc rabbitmq-management -n logiflow

# En minikube:
minikube service rabbitmq-management -n logiflow
```

Credenciales por defecto: `admin / admin`

## 📊 Monitoreo

```bash
# Ver eventos del namespace
kubectl get events -n logiflow --sort-by='.lastTimestamp'

# Logs en tiempo real de todos los pods
kubectl logs -f -l app=api-gateway -n logiflow

# Describe un pod específico
kubectl describe pod <pod-name> -n logiflow

# Ver uso de recursos
kubectl top pods -n logiflow
kubectl top nodes
```

## 🔄 Actualizar servicios

```bash
# Rebuild y reload imagen
docker build -t logiflow/api-gateway:latest -f apps/api-gateway/Dockerfile .
minikube image load logiflow/api-gateway:latest

# Reiniciar deployment
kubectl rollout restart deployment/api-gateway -n logiflow

# Ver estado del rollout
kubectl rollout status deployment/api-gateway -n logiflow
```

## 🗑️ Limpieza

```bash
# Eliminar todo el namespace (borra todo)
kubectl delete namespace logiflow

# O eliminar componentes específicos
kubectl delete -f k8s/services/
kubectl delete -f k8s/infrastructure/
kubectl delete -f k8s/databases/
kubectl delete -f k8s/configmaps.yaml
kubectl delete -f k8s/secrets.yaml
kubectl delete -f k8s/namespace.yaml
```

## 📝 Troubleshooting

### Pods no inician

```bash
# Ver detalles del pod
kubectl describe pod <pod-name> -n logiflow

# Ver logs
kubectl logs <pod-name> -n logiflow

# Entrar al pod para debug
kubectl exec -it <pod-name> -n logiflow -- sh
```

### Bases de datos no conectan

```bash
# Verificar que el StatefulSet esté running
kubectl get statefulset -n logiflow

# Test de conexión desde un pod
kubectl run -it --rm debug --image=postgres:16-alpine -n logiflow -- psql postgresql://postgres:postgres@postgres-auth-service:5432/auth_db
```

### RabbitMQ no conecta

```bash
# Ver logs de RabbitMQ
kubectl logs -f deployment/rabbitmq -n logiflow

# Port-forward para acceder localmente
kubectl port-forward -n logiflow svc/rabbitmq-service 5672:5672
kubectl port-forward -n logiflow svc/rabbitmq-management 15672:15672
```

## 🏗️ Arquitectura

- **Namespace**: `logiflow` - Aislamiento de recursos
- **Databases**: 7 PostgreSQL StatefulSets con PersistentVolumes
- **Message Broker**: 1 RabbitMQ Deployment
- **Microservices**: 8 Deployments (API Gateway + 7 services)
- **Networking**: ClusterIP para servicios internos, LoadBalancer para acceso externo

## 📦 Storage

Cada base de datos tiene su propio **PersistentVolumeClaim**:
- `postgres-auth-pvc`: 5Gi
- `postgres-pedidos-pvc`: 10Gi
- `postgres-fleet-pvc`: 5Gi
- `postgres-inventory-pvc`: 10Gi
- `postgres-billing-pvc`: 10Gi
- `postgres-tracking-pvc`: 10Gi
- `postgres-notification-pvc`: 5Gi
- `rabbitmq-pvc`: 5Gi

**Total storage requerido**: ~60Gi

## 🔐 Seguridad

- Credenciales almacenadas en **Secrets**
- Comunicación interna via **ClusterIP** (no expuesta)
- Solo API Gateway expuesto externamente
- Variables de entorno inyectadas desde ConfigMaps/Secrets

## 🚀 Producción

Para producción, considera:

1. **Registry privado**: Subir las imágenes a un registry privado (GCR, ECR, ACR, etc.)
2. **Ingress Controller**: Reemplazar LoadBalancer por Ingress + TLS
3. **HPA (Horizontal Pod Autoscaler)**: Autoescalado basado en métricas
4. **PersistentVolumes**: Usar storage class apropiado (SSD, multi-AZ)
5. **Monitoring**: Instalar Prometheus + Grafana
6. **Log aggregation**: ELK Stack o similar
7. **Security**: NetworkPolicies, PodSecurityPolicies
8. **Backup**: Estrategia de backup para PostgreSQL
9. **CI/CD**: Pipeline automatizado para builds y deployments

## 📞 Puertos

| Servicio | Puerto Interno | Puerto Externo |
|----------|----------------|----------------|
| API Gateway | 3009 | 3009 (LoadBalancer) |
| Auth Service | 3001 | - |
| Pedidos Service | 3002 | - |
| Fleet Service | 3003 | - |
| Inventory Service | 3004 | - |
| Notification Service | 3005 | - |
| Billing Service | 3006 | - |
| Tracking Service | 3007 | - |
| RabbitMQ AMQP | 5672 | - |
| RabbitMQ Management | 15672 | 15672 (LoadBalancer) |
| PostgreSQL (todas) | 5432 | - |
