-- Cambiar Rol a ADMIN
UPDATE "user" SET role = 'ADMIN' WHERE email = 'admin2@test.com';
-- Verificar usuario
SELECT * FROM "user" WHERE email = 'admin2@test.com';
