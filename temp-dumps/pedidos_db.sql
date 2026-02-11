--
-- PostgreSQL database dump
--

\restrict OB5wMfjKUpZ2BSG8d8F7YREha8Y19BFmmhmuKu0ANe2yx71DRHbxcNOifKwphSv

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.pedido_items DROP CONSTRAINT IF EXISTS "FK_4d42a5b92665897ad4cad91fc09";
ALTER TABLE IF EXISTS ONLY public.pedido_items DROP CONSTRAINT IF EXISTS "PK_f8fa1d930ff13073bc34571ba9d";
ALTER TABLE IF EXISTS ONLY public.pedidos DROP CONSTRAINT IF EXISTS "PK_ebb5680ed29a24efdc586846725";
DROP TABLE IF EXISTS public.pedidos;
DROP TABLE IF EXISTS public.pedido_items;
DROP TYPE IF EXISTS public.pedidos_tipovehiculo_enum;
DROP TYPE IF EXISTS public.pedidos_estado_enum;
DROP EXTENSION IF EXISTS "uuid-ossp";
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: pedidos_estado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.pedidos_estado_enum AS ENUM (
    'PENDIENTE',
    'CONFIRMADO',
    'ASIGNADO',
    'EN_RUTA',
    'ENTREGADO',
    'CANCELADO'
);


ALTER TYPE public.pedidos_estado_enum OWNER TO postgres;

--
-- Name: pedidos_tipovehiculo_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.pedidos_tipovehiculo_enum AS ENUM (
    'MOTO',
    'LIVIANO',
    'CAMION'
);


ALTER TYPE public.pedidos_tipovehiculo_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: pedido_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedido_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "pedidoId" uuid NOT NULL,
    "productoId" uuid,
    "productoSku" character varying(100),
    descripcion character varying(255) NOT NULL,
    peso double precision NOT NULL,
    cantidad integer NOT NULL,
    "reservaId" uuid
);


ALTER TABLE public.pedido_items OWNER TO postgres;

--
-- Name: pedidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedidos (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    estado public.pedidos_estado_enum DEFAULT 'PENDIENTE'::public.pedidos_estado_enum NOT NULL,
    "tipoVehiculo" public.pedidos_tipovehiculo_enum NOT NULL,
    "direccionOrigen" jsonb NOT NULL,
    "direccionDestino" jsonb NOT NULL,
    "precioTotal" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "codigoSeguridad" character varying(50),
    "evidenciaEntrega" character varying(255),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "clienteId" character varying(255) NOT NULL,
    "repartidorId" character varying(255)
);


ALTER TABLE public.pedidos OWNER TO postgres;

--
-- Data for Name: pedido_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedido_items (id, "pedidoId", "productoId", "productoSku", descripcion, peso, cantidad, "reservaId") FROM stdin;
29304711-07a0-4315-b88e-116633578e41	50844928-afe2-4468-8a07-41f92a4f9080	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	1cab62cc-334b-4061-99f1-1133e61ee7ab
f6d45db0-0fd6-4807-8769-430435846fa2	cc082b8e-4fef-4eb0-a031-36274a4641df	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	36fe55b4-e03c-4619-9ec5-89a131b72cb9
bf5f0931-6b81-4c09-8082-b52805dee5ba	bc4a4968-4434-4687-a2b5-4bb5df1ed4ac	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	6f948be6-49a3-47f6-8191-5468a881e07f
22cfcc1f-1373-4803-8ff5-280a5f8b83d5	5a626b03-3623-46ae-aaf7-29f2ec6ab017	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	ea8e1370-cedf-44c5-bed1-3165def63f7c
d1a1acca-c61b-4d2e-8bf5-36bfc64d2757	09fe7c63-3399-42c8-b959-c8069472d476	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	40cf4f6d-1695-4ea4-9fc8-52acf5f5fb0a
f2e1b94b-c54b-4618-8799-fc8702b28374	946f1865-9390-4788-bc91-6bb732711ba1	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	599b3ec9-1a77-4dd7-b3cb-c2be29c12af9
271a78ef-dd32-4ade-83ae-a8a296a034d3	67f5f05f-2061-4b0b-82ef-6a3dd0e43b3f	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	eb310ed9-eb36-4744-89e4-d8aa521435ee
fe07e4d7-bf39-48ba-86e6-8063b8a3a32e	bd46c30f-3cc4-432f-915c-12f83ebfbb7e	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	1272c558-9abc-4b1c-9785-62bf48262bc0
faf15645-0974-49f5-adad-1e936e8def7e	91909591-bb4b-4189-b778-6b077c480f3b	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	03b2da7e-d2bf-4d09-8087-7e1e467bf486
dd8c1956-8a35-4107-ac4f-12a0dabf39f5	ade7d6af-6018-41b5-a862-7d7c6272a770	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	7807349c-cb32-4aa0-b4c9-e4f17d403ee3
5caedd76-11f8-459a-a835-fc0bd1569bd4	244e6fe5-8f11-4f4b-bb18-3258516dc980	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	a549a93d-f6a1-4e86-bb55-e27808c182e7
cbdda5ca-ce6b-4c90-b001-4bdd281dcf37	f50a12c3-fe5a-44bf-90ef-b7638edc142f	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	05783bf6-4a03-465a-85ee-50cc1bfaa65f
33aa82e8-afcb-4177-aa11-6ca654aad017	b7837ea9-41fb-4703-a3c0-30a400832c35	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	9c8d51e7-e426-4d2f-8c3e-2a58d625c305
ea967f87-9e83-4187-bb46-be302ca0813c	6e89f225-77e2-4ec4-9b09-56eec60744ac	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	3c71a6fe-080f-4d97-907b-a4eef79c3b09
33d6caf8-b12c-4ae5-90e0-7475e06f5e96	5f4f99c8-9005-44d0-aa95-d4b535b4de03	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	7c94dfd9-42ee-40db-b0e4-7a329d4a6049
394f37cd-5b27-4a84-a9d7-74fa0cf33f83	98c5af96-64b3-49fa-8698-ce154727d75c	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	652d2f24-30ba-49a2-b7d8-b31bcd3db331
9b6c3844-e2ff-48d1-b790-3d628ef66d50	821ae350-ec63-4739-9ea4-43d1834870be	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	f08c6f83-2c8f-45df-ae7a-9cb65200d05c
36458d43-a41c-41e1-a565-3770084ae81f	65395eb8-6325-4ae5-82a2-6c1e3f1b3166	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	fbdb81a2-04bf-4ed0-af01-ec68ba13e384
e90ea32c-bde1-44b4-8c7c-7b6c2b66534c	c33b35ca-c256-4e59-bbec-2c3b2667d690	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	e0ca6070-43ae-4c02-9bf1-efca0fd8da31
77050a6c-e0d9-4343-b9dd-a94168e14b71	8ffb7bc4-8500-4309-8e11-bbc22700c896	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	a8c43fb3-1bb1-4437-8074-d17ca73b2f12
8c7311fa-883b-4ed9-b8b2-149b240f29e0	fa302326-9287-4434-b162-c8068329859c	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	dff6619b-aaa8-4170-8720-d6feaebeb3f3
d89f7473-4ba9-4b55-9808-28af30d97335	ca05ea5c-567f-4867-a105-7e1127a28136	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	6a474d3d-4ec1-4c8b-98c9-2c1aabb6ea07
b03933cb-8b7e-46c1-8410-27b6c4b40ab3	6e981ea6-c578-4f7b-a510-c19c3d8d2a7c	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	b6323bea-1c9c-40a5-beaf-79f151040fbb
03038131-fece-44b0-8746-7511c7cd4c41	b12fb7db-e3ac-4623-a68a-e7e70bde180c	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	b66eed6d-3763-481e-bc7f-1e3458129ce6
fcc560f3-980b-4ac3-8dc0-42d7491c23c2	da2713e0-31a0-4cd1-9337-66f822d027de	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	2cffe271-8b64-4615-b96d-d87935dcb2f4
2491d4e3-74ed-449c-8627-48ddd5584dde	b463212d-b08a-4b15-8141-bf48b26eef5b	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	134f7b6b-b7f1-4a83-9500-aa3dca683a36
7e25c527-67f2-4b1b-9d80-93c154176485	4db4b8d7-9326-490e-aa9d-bcf317ed8cdc	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	3ef5935e-ef88-4f0d-a11c-a9d056cec6b3
bced9ddd-841f-41a8-9080-75c6c1ae1af6	bb9af25e-65c9-4bd1-98cf-50f9408bafc7	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	247f2682-d669-4169-b7ba-06d5fb34a725
b72ce720-ca30-4b2a-923c-d29c5493c53b	06df2f48-fec0-47bb-b03d-09d2b646bbb4	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	7f4add33-a171-47f2-938f-d8cfd8d4ead6
894ecf0f-35e3-4af8-899f-b1c7b94f4312	03347542-5e75-49ab-a403-6df7d10a3556	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	2fb22a4d-c224-43b4-9a31-572ad04253a4
6e8cef1c-963a-439a-ae73-c73e08257b58	67792f1e-41b7-4139-ac21-419b8cea7e64	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	cdbb7266-cbe2-4560-bf6d-fa8068c95d8b
19f423dc-37f7-4234-8243-0f1f00a5af06	bbfb233e-8fdf-4f5f-a7a2-4e6f7a7dc989	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	681d32f7-7751-4bcc-a426-9e2a01a1c6ee
69da7501-2400-45bd-ab0d-6090e613bd60	f41d77d6-bd3f-4c5e-8873-6a2bfdcbb17b	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	ac782287-18bd-4d0b-9303-3262e957f085
a4025006-dc09-44a6-9876-c8d38ce625d9	f7636e97-3cbb-4bd7-8a54-54809ed6034a	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	5a37c4c8-caa2-435f-9a9e-0ada2b8200fa
b7aa6e2f-8152-4cac-a6ed-5d02ecd01e7a	4d008e42-2637-4850-b65a-749f61e0c464	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	32283d7b-ae6e-4415-840a-877c7a7989a1
3f1234ed-0604-4d0e-8954-e3329d96d05a	ec872163-d2b5-4df2-b02d-777674010f9e	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	e14d4911-f9c8-4a21-bf24-08a6533b23dd
736f5a6b-6871-4985-bf29-e252bc3d168e	e389c59c-cef9-4165-a4a5-b68df88e1e9c	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	0.1	2	0144cdca-fb16-47d3-ba4f-066064909532
\.


--
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedidos (id, estado, "tipoVehiculo", "direccionOrigen", "direccionDestino", "precioTotal", "codigoSeguridad", "evidenciaEntrega", "createdAt", "updatedAt", "clienteId", "repartidorId") FROM stdin;
50844928-afe2-4468-8a07-41f92a4f9080	PENDIENTE	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 05:41:30.405463	2026-02-06 05:41:30.405463	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
cc082b8e-4fef-4eb0-a031-36274a4641df	PENDIENTE	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 05:50:23.552272	2026-02-06 05:50:23.552272	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
bc4a4968-4434-4687-a2b5-4bb5df1ed4ac	PENDIENTE	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 05:53:54.519949	2026-02-06 05:53:54.519949	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
5a626b03-3623-46ae-aaf7-29f2ec6ab017	PENDIENTE	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 05:58:19.7416	2026-02-06 05:58:19.7416	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
946f1865-9390-4788-bc91-6bb732711ba1	PENDIENTE	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 06:04:01.772791	2026-02-06 06:04:01.772791	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
67f5f05f-2061-4b0b-82ef-6a3dd0e43b3f	PENDIENTE	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 06:06:14.783549	2026-02-06 06:06:14.783549	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
bd46c30f-3cc4-432f-915c-12f83ebfbb7e	PENDIENTE	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 06:08:28.189246	2026-02-06 06:08:28.189246	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
91909591-bb4b-4189-b778-6b077c480f3b	PENDIENTE	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 06:15:41.958251	2026-02-06 06:15:41.958251	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
ade7d6af-6018-41b5-a862-7d7c6272a770	PENDIENTE	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 06:15:41.974001	2026-02-06 06:15:41.974001	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
244e6fe5-8f11-4f4b-bb18-3258516dc980	PENDIENTE	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 06:15:41.98616	2026-02-06 06:15:41.98616	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
f50a12c3-fe5a-44bf-90ef-b7638edc142f	PENDIENTE	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 06:18:40.326219	2026-02-06 06:18:40.326219	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
b7837ea9-41fb-4703-a3c0-30a400832c35	PENDIENTE	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 06:22:32.62344	2026-02-06 06:22:32.62344	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
6e89f225-77e2-4ec4-9b09-56eec60744ac	PENDIENTE	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 06:28:48.524943	2026-02-06 06:28:48.524943	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
5f4f99c8-9005-44d0-aa95-d4b535b4de03	PENDIENTE	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	2.80	\N	\N	2026-02-06 06:31:34.924508	2026-02-06 06:39:15.660552	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
98c5af96-64b3-49fa-8698-ce154727d75c	PENDIENTE	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 06:39:58.496734	2026-02-06 06:39:58.496734	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
821ae350-ec63-4739-9ea4-43d1834870be	CONFIRMADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	2.80	\N	\N	2026-02-06 06:41:25.997586	2026-02-06 06:41:36.132933	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
ca05ea5c-567f-4867-a105-7e1127a28136	PENDIENTE	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 07:09:21.176376	2026-02-06 07:09:21.176376	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
65395eb8-6325-4ae5-82a2-6c1e3f1b3166	CONFIRMADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	2.80	\N	\N	2026-02-06 07:01:01.881334	2026-02-06 07:01:14.764596	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
8ffb7bc4-8500-4309-8e11-bbc22700c896	CONFIRMADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	2.80	\N	\N	2026-02-06 07:05:46.131398	2026-02-06 07:05:59.387366	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
c33b35ca-c256-4e59-bbec-2c3b2667d690	CONFIRMADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	2.80	\N	\N	2026-02-06 07:04:21.606307	2026-02-06 07:04:35.723849	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
6e981ea6-c578-4f7b-a510-c19c3d8d2a7c	PENDIENTE	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 07:11:46.725961	2026-02-06 07:11:46.725961	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
fa302326-9287-4434-b162-c8068329859c	CONFIRMADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	2.80	\N	\N	2026-02-06 07:06:41.427707	2026-02-06 07:06:51.50681	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
b12fb7db-e3ac-4623-a68a-e7e70bde180c	CONFIRMADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	2.80	\N	\N	2026-02-06 07:23:36.54826	2026-02-06 07:23:50.347136	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
da2713e0-31a0-4cd1-9337-66f822d027de	CONFIRMADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	2.80	\N	\N	2026-02-06 07:25:38.673691	2026-02-06 07:25:51.313898	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
09fe7c63-3399-42c8-b959-c8069472d476	ASIGNADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 06:01:28.634408	2026-02-06 07:33:13.484918	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	
b463212d-b08a-4b15-8141-bf48b26eef5b	CONFIRMADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	2.80	\N	\N	2026-02-06 07:27:11.411447	2026-02-06 07:27:23.105078	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
4db4b8d7-9326-490e-aa9d-bcf317ed8cdc	CONFIRMADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	2.80	\N	\N	2026-02-06 07:31:37.131349	2026-02-06 07:31:58.626371	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	\N
bb9af25e-65c9-4bd1-98cf-50f9408bafc7	ASIGNADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 07:33:13.230808	2026-02-06 07:33:13.507424	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	2401191b-0a13-47fa-a2af-5ab1459eabe2
06df2f48-fec0-47bb-b03d-09d2b646bbb4	ASIGNADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 07:35:28.370414	2026-02-06 07:35:28.619635	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	
03347542-5e75-49ab-a403-6df7d10a3556	ENTREGADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	Entrega confirmada automÃ¡ticamente por FleetService	2026-02-06 07:36:46.871335	2026-02-06 13:50:15.920895	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	2401191b-0a13-47fa-a2af-5ab1459eabe2
67792f1e-41b7-4139-ac21-419b8cea7e64	ASIGNADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 07:47:14.341469	2026-02-06 07:47:14.593108	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	2401191b-0a13-47fa-a2af-5ab1459eabe2
bbfb233e-8fdf-4f5f-a7a2-4e6f7a7dc989	CONFIRMADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	2.80	\N	\N	2026-02-06 07:49:36.400475	2026-02-06 07:49:50.162258	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	2401191b-0a13-47fa-a2af-5ab1459eabe2
ec872163-d2b5-4df2-b02d-777674010f9e	CONFIRMADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	2.80	\N	\N	2026-02-06 13:53:00.882003	2026-02-06 13:53:15.610065	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	2401191b-0a13-47fa-a2af-5ab1459eabe2
f41d77d6-bd3f-4c5e-8873-6a2bfdcbb17b	CONFIRMADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	2.80	\N	\N	2026-02-06 12:46:43.35003	2026-02-06 12:47:20.671041	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	2401191b-0a13-47fa-a2af-5ab1459eabe2
f7636e97-3cbb-4bd7-8a54-54809ed6034a	ASIGNADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 12:50:47.730317	2026-02-06 12:50:48.088496	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	2401191b-0a13-47fa-a2af-5ab1459eabe2
4d008e42-2637-4850-b65a-749f61e0c464	ASIGNADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 13:06:03.985422	2026-02-06 13:06:04.224302	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	7e8367fe-b4bb-4c4f-9d52-e47658d4dbf5
e389c59c-cef9-4165-a4a5-b68df88e1e9c	ASIGNADO	MOTO	{"lat": -0.182, "lng": -78.482, "direccion": "Calle Falsa 123, Quito"}	{"lat": -0.185, "lng": -78.485, "direccion": "Av. Principal 456, Quito"}	0.00	\N	\N	2026-02-06 15:41:03.52501	2026-02-06 15:41:04.725992	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	2401191b-0a13-47fa-a2af-5ab1459eabe2
\.


--
-- Name: pedidos PK_ebb5680ed29a24efdc586846725; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT "PK_ebb5680ed29a24efdc586846725" PRIMARY KEY (id);


--
-- Name: pedido_items PK_f8fa1d930ff13073bc34571ba9d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT "PK_f8fa1d930ff13073bc34571ba9d" PRIMARY KEY (id);


--
-- Name: pedido_items FK_4d42a5b92665897ad4cad91fc09; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_items
    ADD CONSTRAINT "FK_4d42a5b92665897ad4cad91fc09" FOREIGN KEY ("pedidoId") REFERENCES public.pedidos(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict OB5wMfjKUpZ2BSG8d8F7YREha8Y19BFmmhmuKu0ANe2yx71DRHbxcNOifKwphSv

