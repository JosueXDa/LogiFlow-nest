-- Seed tarifas para billing_db
-- Ejecutar con: Get-Content scripts\seed-tarifas.sql | kubectl exec -i -n logiflow postgres-billing-0 -- psql -U postgres -d billing_db

-- URBANA - MOTORIZADO
INSERT INTO tarifas (
    "tipoEntrega", "tipoVehiculo", nombre, descripcion,
    "tarifaBase", "costoPorKm", "costoPorKg", "costoMinimo",
    "kmIncluidos", "kgIncluidos", "tarifaUrgente", "factorZona",
    activa, "createdAt", "updatedAt"
) 
SELECT 'URBANA', 'MOTORIZADO', 'Urbana Motorizado', 
    'Entrega rápida en moto dentro de la ciudad',
    2.50, 0.50, 0, 2.50,
    3, NULL, 1.50, NULL,
    true, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM tarifas WHERE "tipoEntrega" = 'URBANA' AND "tipoVehiculo" = 'MOTORIZADO'
);

-- URBANA - VEHICULO_LIVIANO
INSERT INTO tarifas (
    "tipoEntrega", "tipoVehiculo", nombre, descripcion,
    "tarifaBase", "costoPorKm", "costoPorKg", "costoMinimo",
    "kmIncluidos", "kgIncluidos", "tarifaUrgente", "factorZona",
    activa, "createdAt", "updatedAt"
)
SELECT 'URBANA', 'VEHICULO_LIVIANO', 'Urbana Vehículo Liviano',
    'Entrega en auto/furgoneta dentro de la ciudad',
    5.00, 0.80, 0, 5.00,
    3, NULL, 3.00, NULL,
    true, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM tarifas WHERE "tipoEntrega" = 'URBANA' AND "tipoVehiculo" = 'VEHICULO_LIVIANO'
);

-- URBANA - CAMION
INSERT INTO tarifas (
    "tipoEntrega", "tipoVehiculo", nombre, descripcion,
    "tarifaBase", "costoPorKm", "costoPorKg", "costoMinimo",
    "kmIncluidos", "kgIncluidos", "tarifaUrgente", "factorZona",
    activa, "createdAt", "updatedAt"
)
SELECT 'URBANA', 'CAMION', 'Urbana Camión',
    'Transporte de carga pesada dentro de la ciudad',
    15.00, 1.50, 0.05, 20.00,
    0, 50, 5.00, NULL,
    true, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM tarifas WHERE "tipoEntrega" = 'URBANA' AND "tipoVehiculo" = 'CAMION'
);

-- INTERMUNICIPAL - MOTORIZADO
INSERT INTO tarifas (
    "tipoEntrega", "tipoVehiculo", nombre, descripcion,
    "tarifaBase", "costoPorKm", "costoPorKg", "costoMinimo",
    "kmIncluidos", "kgIncluidos", "tarifaUrgente", "factorZona",
    activa, "createdAt", "updatedAt"
)
SELECT 'INTERMUNICIPAL', 'MOTORIZADO', 'Intermunicipal Motorizado',
    'Entrega en moto entre ciudades cercanas',
    10.00, 0.80, 0, 15.00,
    0, NULL, 5.00, 1.2,
    true, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM tarifas WHERE "tipoEntrega" = 'INTERMUNICIPAL' AND "tipoVehiculo" = 'MOTORIZADO'
);

-- INTERMUNICIPAL - VEHICULO_LIVIANO
INSERT INTO tarifas (
    "tipoEntrega", "tipoVehiculo", nombre, descripcion,
    "tarifaBase", "costoPorKm", "costoPorKg", "costoMinimo",
    "kmIncluidos", "kgIncluidos", "tarifaUrgente", "factorZona",
    activa, "createdAt", "updatedAt"
)
SELECT 'INTERMUNICIPAL', 'VEHICULO_LIVIANO', 'Intermunicipal Vehículo Liviano',
    'Entrega en auto entre ciudades cercanas',
    25.00, 1.00, 0.05, 30.00,
    0, 100, 10.00, 1.2,
    true, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM tarifas WHERE "tipoEntrega" = 'INTERMUNICIPAL' AND "tipoVehiculo" = 'VEHICULO_LIVIANO'
);

-- INTERMUNICIPAL - CAMION
INSERT INTO tarifas (
    "tipoEntrega", "tipoVehiculo", nombre, descripcion,
    "tarifaBase", "costoPorKm", "costoPorKg", "costoMinimo",
    "kmIncluidos", "kgIncluidos", "tarifaUrgente", "factorZona",
    activa, "createdAt", "updatedAt"
)
SELECT 'INTERMUNICIPAL', 'CAMION', 'Intermunicipal Camión',
    'Transporte de carga entre ciudades cercanas',
    50.00, 1.20, 0.10, 60.00,
    0, 100, 20.00, 1.1,
    true, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM tarifas WHERE "tipoEntrega" = 'INTERMUNICIPAL' AND "tipoVehiculo" = 'CAMION'
);

-- NACIONAL - VEHICULO_LIVIANO
INSERT INTO tarifas (
    "tipoEntrega", "tipoVehiculo", nombre, descripcion,
    "tarifaBase", "costoPorKm", "costoPorKg", "costoMinimo",
    "kmIncluidos", "kgIncluidos", "tarifaUrgente", "factorZona",
    activa, "createdAt", "updatedAt"
)
SELECT 'NACIONAL', 'VEHICULO_LIVIANO', 'Nacional Vehículo Liviano',
    'Entrega nacional en vehículo liviano',
    80.00, 1.50, 0.15, 100.00,
    0, 150, 30.00, 1.5,
    true, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM tarifas WHERE "tipoEntrega" = 'NACIONAL' AND "tipoVehiculo" = 'VEHICULO_LIVIANO'
);

-- NACIONAL - CAMION
INSERT INTO tarifas (
    "tipoEntrega", "tipoVehiculo", nombre, descripcion,
    "tarifaBase", "costoPorKm", "costoPorKg", "costoMinimo",
    "kmIncluidos", "kgIncluidos", "tarifaUrgente", "factorZona",
    activa, "createdAt", "updatedAt"
)
SELECT 'NACIONAL', 'CAMION', 'Nacional Camión',
    'Transporte de carga a nivel nacional',
    150.00, 2.00, 0.20, 200.00,
    0, 500, 50.00, 1.3,
    true, NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM tarifas WHERE "tipoEntrega" = 'NACIONAL' AND "tipoVehiculo" = 'CAMION'
);

-- Verificar tarifas creadas
SELECT COUNT(*) as total_tarifas FROM tarifas;
SELECT "tipoEntrega", "tipoVehiculo", nombre, "tarifaBase" FROM tarifas ORDER BY "tipoEntrega", "tipoVehiculo";
