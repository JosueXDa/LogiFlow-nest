# Seed Completo de Bases de Datos en Kubernetes

Este documento describe cómo poblar las bases de datos de todos los microservicios en Kubernetes después de corregir los problemas de autenticación y validación.

## Requisitos Previos

1. **API Gateway v4**: Asegúrate de que el API Gateway está corriendo con la imagen `logiflow/api-gateway:v4` que contiene las correcciones de validación de DTOs.
2. **Tablas Creadas**: Las migraciones deben haberse ejecutado (las tablas deben existir en las bases de datos).

## Pasos para Poblar Datos

### 1. Establecer Port-Forward

Abre una terminal y ejecuta:

```powershell
# Si hay algún proceso en el puerto 3009, elimínalo primero:
# netstat -ano | findstr :3009
# taskkill /pid <PID> /f

kubectl port-forward -n logiflow svc/api-gateway 3009:3009
```

Mantén esta terminal abierta.

### 2. Ejecutar Script de Seed

En otra terminal, ejecuta el script unificado:

```powershell
node scripts/seed-all-k8s.mjs
```

Este script:
1. Crea un usuario admin y se autentica
2. Crea zonas de cobertura (Fleet Service)
3. Crea vehículos y asigna repartidores (Fleet Service)
4. Crea productos (Inventory Service)

### 3. Verificar Datos

Puedes verificar que los datos se crearon correctamente con los siguientes comandos:

**Zonas, Vehículos y Repartidores:**
```powershell
kubectl exec -n logiflow postgres-fleet-0 -- psql -U postgres -d fleet_db -c "SELECT COUNT(*) as zonas FROM zonas; SELECT COUNT(*) as vehiculos FROM vehiculos; SELECT COUNT(*) as repartidores FROM repartidores;"
```

**Productos:**
```powershell
kubectl exec -n logiflow postgres-inventory-0 -- psql -U postgres -d inventory_db -c "SELECT COUNT(*) as productos FROM productos;"
```

## Solución de Problemas

Si encuentras errores de "Unauthorized" (401), asegúrate de que el port-forward esté activo y estable.
Si encuentras errores de "Bad Request" (400), verifica que estás usando la versión v4 del API Gateway que corrige las validaciones de DTOs.
