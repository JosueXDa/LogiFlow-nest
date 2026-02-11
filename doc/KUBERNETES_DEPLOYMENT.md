# Kubernetes Deployment Walkthrough

This guide details how to deploy the **API Gateway**, **Auth Services**, and other microservices to your local Kubernetes cluster.

## Prerequisites
- Docker installed and running.
- Kubernetes cluster (e.g., Minikube, Docker Desktop) running.
- `kubectl` configured.

## 1. Build Docker Images
We need to build the Docker images locally so Kubernetes can use them (ensure your local cluster can see local images, or use a registry).

```bash
# Build API Gateway
docker build -f apps/api-gateway/Dockerfile -t api-gateway:latest .

# Build Auth Services
docker build -f apps/auth-services/Dockerfile -t auth-services:latest .

# Build Fleet Service
docker build -f apps/fleet-service/Dockerfile -t fleet-service:latest .

# Build Inventory Service
docker build -f apps/inventory-service/Dockerfile -t inventory-service:latest .

# Build Pedidos Service
docker build -f apps/pedidos-service/Dockerfile -t pedidos-service:latest .

# Build Billing Service
docker build -f apps/billing-service/Dockerfile -t billing-service:latest .

# Build Notification Service
docker build -f apps/notification-service/Dockerfile -t notification-service:latest .

# Build Tracking Service
docker build -f apps/tracking-service/Dockerfile -t tracking-service:latest .
```

> [!TIP]
> If using Minikube, run `eval $(minikube docker-env)` before building to load images directly into Minikube.

## 2. Deploy Infrastructure
Deploy the namespace, RabbitMQ, and Postgres databases.

```bash
# Create Namespace
kubectl apply -f k8s/00-namespace.yaml

# Deploy Infrastructure
kubectl apply -f k8s/01-infrastructure/
```

Verify infrastructure pods are running:
```bash
kubectl get pods -n microservices-study
```

## 3. Deploy Applications
Deploy the microservices.

```bash
kubectl apply -f k8s/02-apps/
```

## 4. Verify Deployment
Check the status of all resources.

```bash
kubectl get all -n microservices-study
```

### Accessing the API
The API Gateway is exposed via Ingress at `api.local`.
- Ensure your ingress controller is running (e.g., `minikube addons enable ingress`).
- Add `127.0.0.1 api.local` (or `minikube ip api.local`) to your `/etc/hosts` file.

You can then access the API at `http://api.local`.
