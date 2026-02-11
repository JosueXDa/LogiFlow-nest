# 🚀 Guía Rápida de Despliegue - LogiFlow en Kubernetes

## 📋 Prerrequisitos

- [x] Docker instalado
- [x] kubectl instalado y configurado
- [x] Cluster de Kubernetes (minikube, kind, GKE, EKS, AKS, etc.)

## ⚡ Despliegue Rápido (3 pasos)

### Paso 1: Construir las imágenes Docker

**Windows (PowerShell):**
```powershell
cd k8s
.\build-images.ps1
```

**Linux/Mac:**
```bash
cd k8s
chmod +x build-images.sh
./build-images.sh
```

### Paso 2: Modificar secrets (IMPORTANTE en producción)

Edita `k8s/secrets.yaml` y cambia las credenciales:
```yaml
stringData:
  POSTGRES_PASSWORD: TU_PASSWORD_SEGURO
  RABBITMQ_DEFAULT_PASS: TU_PASSWORD_SEGURO
  JWT_SECRET: tu-jwt-secret-muy-largo-y-aleatorio
```

### Paso 3: Desplegar en Kubernetes

**Windows (PowerShell):**
```powershell
.\deploy.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🎯 Acceso al API Gateway

### Minikube
```bash
minikube service api-gateway -n logiflow
```

### Otros clusters (obtener IP externa)
```bash
kubectl get svc api-gateway -n logiflow
```

## 📊 Comandos Útiles

### Ver estado
```bash
kubectl get all -n logiflow
```

### Ver logs
```bash
# API Gateway
kubectl logs -f deployment/api-gateway -n logiflow

# Todos los servicios
kubectl logs -f -l app=pedidos-service -n logiflow
```

### Ver métricas
```bash
kubectl top pods -n logiflow
```

### Reiniciar un servicio
```bash
kubectl rollout restart deployment/api-gateway -n logiflow
```

## 🗑️ Limpiar todo

**Windows:**
```powershell
.\cleanup.ps1
```

**Linux/Mac:**
```bash
./cleanup.sh
```

## 🌐 URLs de Acceso (ejemplo con minikube)

- **API Gateway**: http://api-gateway-url:3009
- **GraphQL Playground**: http://api-gateway-url:3009/graphql
- **RabbitMQ Management**: http://rabbitmq-url:15672 (admin/admin)
- **API Docs (Swagger)**: http://api-gateway-url:3009/api

## 📝 Troubleshooting

### Pods no inician
```bash
kubectl describe pod <pod-name> -n logiflow
kubectl logs <pod-name> -n logiflow
```

### Base de datos no conecta
```bash
kubectl get statefulset -n logiflow
kubectl logs postgres-auth-0 -n logiflow
```

### Reiniciar desde cero
```bash
kubectl delete namespace logiflow
# Luego volver a ejecutar deploy.ps1 o deploy.sh
```

## 🎉 ¡Listo!

Tu aplicación LogiFlow debería estar corriendo en Kubernetes con:
- ✅ 8 microservicios (API Gateway + 7 services)
- ✅ 7 bases de datos PostgreSQL
- ✅ 1 RabbitMQ
- ✅ 1 réplica por servicio (escalable con HPA)
- ✅ Autoescalado horizontal (opcional con HPA)
- ✅ Almacenamiento persistente
