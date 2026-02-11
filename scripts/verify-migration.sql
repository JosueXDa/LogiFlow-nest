-- Verificar datos migrados en diferentes DBs
\echo '=== AUTH DB ==='
\c auth_db
SELECT 'Users:' as table_name , COUNT(*) as count FROM "user";
SELECT 'Accounts:' as table_name, COUNT(*) as count FROM "account";

\echo '=== FLEET DB ==='
\c fleet_db
SELECT 'Zonas:' as table_name, COUNT(*) as count FROM zonas;
SELECT 'Vehiculos:' as table_name, COUNT(*) as count FROM vehiculos;
SELECT 'Repartidores:' as table_name, COUNT(*) as count FROM repartidores;

\echo '=== BILLING DB ==='
\c billing_db
SELECT 'Tarifas:' as table_name, COUNT(*) as count FROM tarifas;
SELECT 'Facturas:' as table_name, COUNT(*) as count FROM facturas;

\echo '=== INVENTORY DB ==='
\c inventory_db
SELECT 'Productos:' as table_name, COUNT(*) as count FROM productos;

\echo '=== PEDIDOS DB ==='
\c pedidos_db
SELECT 'Pedidos:' as table_name, COUNT(*) as count FROM pedidos;

\echo '=== TRACKING DB ==='
\c tracking_db
SELECT 'Ubicaciones:' as table_name, COUNT(*) as count FROM ubicaciones;

\echo '=== NOTIFICATION DB ==='
\c notification_db
SELECT 'Notifications:' as table_name, COUNT(*) as count FROM notifications;
