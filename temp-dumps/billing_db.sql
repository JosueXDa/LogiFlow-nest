--
-- PostgreSQL database dump
--

\restrict EoGcFNF5qvuKynRLje8tw0NWrc0trC55SDLSSRiWWucPvkIRRHsRDQzx28gYEKi

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

ALTER TABLE IF EXISTS ONLY public.detalle_facturas DROP CONSTRAINT IF EXISTS "FK_8b5b196f61944edebd073c79bb7";
DROP INDEX IF EXISTS public."IDX_c55dcc7b95ab86eb559a5bed04";
DROP INDEX IF EXISTS public."IDX_c1c9068ac7479eb9d9b02fba71";
DROP INDEX IF EXISTS public."IDX_be6dba2298d9414913463f492b";
DROP INDEX IF EXISTS public."IDX_97cf4eb3ca1183cd9ab22c8012";
DROP INDEX IF EXISTS public."IDX_38f8b4f6e6e2aef75386ba9783";
DROP INDEX IF EXISTS public."IDX_02663fbd4c85d1665b165e7d70";
ALTER TABLE IF EXISTS ONLY public.facturas DROP CONSTRAINT IF EXISTS "UQ_c1c9068ac7479eb9d9b02fba712";
ALTER TABLE IF EXISTS ONLY public.facturas DROP CONSTRAINT IF EXISTS "PK_f302947c1e4773639b20707a8bc";
ALTER TABLE IF EXISTS ONLY public.detalle_facturas DROP CONSTRAINT IF EXISTS "PK_aa7bd5763b128375ac946e6421a";
ALTER TABLE IF EXISTS ONLY public.tarifas DROP CONSTRAINT IF EXISTS "PK_a264af6b1739ea9368d9326e158";
DROP TABLE IF EXISTS public.tarifas;
DROP TABLE IF EXISTS public.facturas;
DROP TABLE IF EXISTS public.detalle_facturas;
DROP TYPE IF EXISTS public.tarifas_tipovehiculo_enum;
DROP TYPE IF EXISTS public.tarifas_tipoentrega_enum;
DROP TYPE IF EXISTS public.facturas_tipopago_enum;
DROP TYPE IF EXISTS public.facturas_estado_enum;
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
-- Name: facturas_estado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.facturas_estado_enum AS ENUM (
    'BORRADOR',
    'EMITIDA',
    'PAGADA',
    'CANCELADA',
    'ANULADA'
);


ALTER TYPE public.facturas_estado_enum OWNER TO postgres;

--
-- Name: facturas_tipopago_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.facturas_tipopago_enum AS ENUM (
    'EFECTIVO',
    'TARJETA',
    'TRANSFERENCIA',
    'CREDITO'
);


ALTER TYPE public.facturas_tipopago_enum OWNER TO postgres;

--
-- Name: tarifas_tipoentrega_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tarifas_tipoentrega_enum AS ENUM (
    'URBANA',
    'INTERMUNICIPAL',
    'NACIONAL'
);


ALTER TYPE public.tarifas_tipoentrega_enum OWNER TO postgres;

--
-- Name: tarifas_tipovehiculo_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tarifas_tipovehiculo_enum AS ENUM (
    'MOTORIZADO',
    'VEHICULO_LIVIANO',
    'CAMION'
);


ALTER TYPE public.tarifas_tipovehiculo_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: detalle_facturas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_facturas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "facturaId" uuid NOT NULL,
    orden integer DEFAULT 1 NOT NULL,
    concepto character varying(200) NOT NULL,
    descripcion text,
    cantidad numeric(10,3) DEFAULT '1'::numeric NOT NULL,
    "unidadMedida" character varying(20) DEFAULT 'UNIDAD'::character varying NOT NULL,
    "precioUnitario" numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    "porcentajeDescuento" numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    descuento numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    total numeric(10,2) NOT NULL,
    metadata jsonb
);


ALTER TABLE public.detalle_facturas OWNER TO postgres;

--
-- Name: facturas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facturas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "numeroFactura" character varying(50) NOT NULL,
    "pedidoId" uuid NOT NULL,
    "clienteId" character varying(255) NOT NULL,
    "clienteNombre" character varying(200) NOT NULL,
    "clienteRuc" character varying(13),
    "clienteDireccion" character varying(500),
    "zonaId" uuid,
    "zonaNombre" character varying(100),
    estado public.facturas_estado_enum DEFAULT 'BORRADOR'::public.facturas_estado_enum NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    descuento numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    iva numeric(10,2) NOT NULL,
    "porcentajeIva" numeric(5,2) DEFAULT '12'::numeric NOT NULL,
    total numeric(10,2) NOT NULL,
    "tipoPago" public.facturas_tipopago_enum,
    "fechaPago" timestamp without time zone,
    "referenciaPago" character varying(100),
    observaciones text,
    metadata jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone
);


ALTER TABLE public.facturas OWNER TO postgres;

--
-- Name: tarifas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tarifas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "tipoEntrega" public.tarifas_tipoentrega_enum NOT NULL,
    "tipoVehiculo" public.tarifas_tipovehiculo_enum NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    "tarifaBase" numeric(10,2) NOT NULL,
    "costoPorKm" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "costoPorKg" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "costoMinimo" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "tarifaUrgente" numeric(10,2),
    "factorZona" numeric(5,2),
    "porcentajeDescuentoVolumen" numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    "kmIncluidos" integer,
    "kgIncluidos" integer,
    activa boolean DEFAULT true NOT NULL,
    "validaDesde" timestamp without time zone,
    "validaHasta" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tarifas OWNER TO postgres;

--
-- Data for Name: detalle_facturas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_facturas (id, "facturaId", orden, concepto, descripcion, cantidad, "unidadMedida", "precioUnitario", subtotal, "porcentajeDescuento", descuento, total, metadata) FROM stdin;
d74e9177-05e9-4385-9435-41c39cbd2ac3	53bf8acf-e788-4a67-836e-43db61029cfe	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
e4363f86-962e-4d1e-b5ae-8538d23580dc	b02e1282-9f4c-43ee-9269-c01e6330c1bd	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
f8d7e7c8-d261-4557-b053-c71b51175096	0747b46f-8727-45f6-945d-288334f7c317	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
154c53ed-0ac7-402f-b564-b6330b184fe5	7aa286c3-465b-4ed0-ba88-de39f0beff32	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
c43022ee-098e-4c14-91bb-ac872568d3a2	3f46b36b-13af-4a93-8493-2843dba5f263	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
557e9120-4ed7-4b5e-9c06-ff600ee49314	0e14fe05-6cc8-42d4-b0a5-41238b4aaebb	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
98897958-b8f2-4d31-9957-b11a94628d0c	aa8fe57b-005c-4cbe-9f14-3c3196574506	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
0351ab9a-1c28-4990-85dd-64e7e71f354e	c77319f6-eb1b-4875-95ee-0bc3b921bb1c	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
4c3d0d5a-b11a-470d-b26d-4ba556f38fe2	f6d64719-cd07-4a45-9d58-8361b6e0f2c3	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
793d9f1b-a1e3-4e19-8720-eaaf10024963	30283735-b115-4075-a866-538131c51fa1	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
2170863f-773a-41c2-a8d5-23547787b754	eafddb71-6114-45e8-9b42-a13c25a3ab4f	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
963a6602-6245-485b-b2e1-6167bb3d6e4f	78f41012-938b-4cfd-b955-40c031819467	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
7b540016-b1cf-4a7c-884f-b1847e18dca9	b68bd102-1011-4f04-9ab1-b7d34fc2eb48	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
a47bb5d0-7ae5-4dc9-8f08-dc2987347647	17a1f079-8ebf-4a7f-a4cd-0575b83f8b9d	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
62bff66b-8cd1-4374-8919-71165dbff342	9478a553-48d4-483a-8f7c-cdcf0b191661	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
54b7c84c-7b85-4756-944d-da1578870963	d9c568ea-8cb4-42d0-a751-8fd62d76d2b4	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
dd165027-b1ca-4cc7-b9b5-e8074838f725	847871c1-2c51-4500-b2cc-cc0883b321e2	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
4f396a91-5fd1-43c5-85b8-6979ee5f2d81	e7bd3013-fd84-47db-b94a-b07965e3f593	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
b7b235a3-0a15-4ae1-b0bb-2177fa3d230b	527fb2c7-8ee0-4458-b0e7-d43e57083786	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
80d3f250-e658-4171-92b8-a445a5385c64	9c863130-bf70-45e6-9bdd-6a19fa8fbcd8	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
b1b6329c-0e47-4919-b3cb-3039de8b43e4	00ce1838-999b-4c68-be0d-40c56d35c707	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
d72843e3-f73f-483f-88ce-35e746d43f53	be6326cc-3efe-4cb1-9de5-48d1f1706e40	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
ad9d822c-4da4-42e9-897b-cef2b8a554cc	b01bd0ef-ab98-4975-b45d-04a7aa9b1040	1	Servicio de entrega urbana	MOTORIZADO - 0.47 km	1.000	UNIDAD	2.50	2.50	0.00	0.00	2.50	\N
\.


--
-- Data for Name: facturas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facturas (id, "numeroFactura", "pedidoId", "clienteId", "clienteNombre", "clienteRuc", "clienteDireccion", "zonaId", "zonaNombre", estado, subtotal, descuento, iva, "porcentajeIva", total, "tipoPago", "fechaPago", "referenciaPago", observaciones, metadata, "createdAt", "updatedAt", "deletedAt") FROM stdin;
53bf8acf-e788-4a67-836e-43db61029cfe	F-202602-000001	5f4f99c8-9005-44d0-aa95-d4b535b4de03	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	EMITIDA	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 06:31:35.070357	2026-02-06 06:31:55.849263	\N
b02e1282-9f4c-43ee-9269-c01e6330c1bd	F-202602-000002	98c5af96-64b3-49fa-8698-ce154727d75c	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	BORRADOR	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 06:39:58.771292	2026-02-06 06:39:58.771292	\N
0747b46f-8727-45f6-945d-288334f7c317	F-202602-000003	821ae350-ec63-4739-9ea4-43d1834870be	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	EMITIDA	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 06:41:26.161598	2026-02-06 06:41:36.101233	\N
7aa286c3-465b-4ed0-ba88-de39f0beff32	F-202602-000004	65395eb8-6325-4ae5-82a2-6c1e3f1b3166	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	EMITIDA	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 07:01:02.150534	2026-02-06 07:01:14.633225	\N
3f46b36b-13af-4a93-8493-2843dba5f263	F-202602-000005	c33b35ca-c256-4e59-bbec-2c3b2667d690	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	EMITIDA	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 07:04:21.741395	2026-02-06 07:04:35.672524	\N
0e14fe05-6cc8-42d4-b0a5-41238b4aaebb	F-202602-000006	8ffb7bc4-8500-4309-8e11-bbc22700c896	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	EMITIDA	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 07:05:46.406945	2026-02-06 07:05:59.326563	\N
aa8fe57b-005c-4cbe-9f14-3c3196574506	F-202602-000007	fa302326-9287-4434-b162-c8068329859c	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	EMITIDA	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 07:06:41.555853	2026-02-06 07:06:51.477192	\N
c77319f6-eb1b-4875-95ee-0bc3b921bb1c	F-202602-000008	ca05ea5c-567f-4867-a105-7e1127a28136	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	BORRADOR	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 07:09:21.422415	2026-02-06 07:09:21.422415	\N
f6d64719-cd07-4a45-9d58-8361b6e0f2c3	F-202602-000009	6e981ea6-c578-4f7b-a510-c19c3d8d2a7c	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	BORRADOR	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 07:11:46.883626	2026-02-06 07:11:46.883626	\N
30283735-b115-4075-a866-538131c51fa1	F-202602-000010	b12fb7db-e3ac-4623-a68a-e7e70bde180c	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	EMITIDA	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 07:23:36.785906	2026-02-06 07:23:50.311628	\N
eafddb71-6114-45e8-9b42-a13c25a3ab4f	F-202602-000011	da2713e0-31a0-4cd1-9337-66f822d027de	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	EMITIDA	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 07:25:38.800839	2026-02-06 07:25:51.277044	\N
78f41012-938b-4cfd-b955-40c031819467	F-202602-000012	b463212d-b08a-4b15-8141-bf48b26eef5b	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	EMITIDA	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 07:27:11.536041	2026-02-06 07:27:23.074288	\N
b68bd102-1011-4f04-9ab1-b7d34fc2eb48	F-202602-000013	4db4b8d7-9326-490e-aa9d-bcf317ed8cdc	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	EMITIDA	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 07:31:37.299289	2026-02-06 07:31:58.598224	\N
17a1f079-8ebf-4a7f-a4cd-0575b83f8b9d	F-202602-000014	bb9af25e-65c9-4bd1-98cf-50f9408bafc7	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	BORRADOR	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 07:33:13.375942	2026-02-06 07:33:13.375942	\N
9478a553-48d4-483a-8f7c-cdcf0b191661	F-202602-000015	06df2f48-fec0-47bb-b03d-09d2b646bbb4	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	BORRADOR	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 07:35:28.533764	2026-02-06 07:35:28.533764	\N
d9c568ea-8cb4-42d0-a751-8fd62d76d2b4	F-202602-000016	03347542-5e75-49ab-a403-6df7d10a3556	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	BORRADOR	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 07:36:46.993518	2026-02-06 07:36:46.993518	\N
847871c1-2c51-4500-b2cc-cc0883b321e2	F-202602-000017	67792f1e-41b7-4139-ac21-419b8cea7e64	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	BORRADOR	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 07:47:14.509512	2026-02-06 07:47:14.509512	\N
e7bd3013-fd84-47db-b94a-b07965e3f593	F-202602-000018	bbfb233e-8fdf-4f5f-a7a2-4e6f7a7dc989	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	EMITIDA	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 07:49:36.69577	2026-02-06 07:49:50.117861	\N
527fb2c7-8ee0-4458-b0e7-d43e57083786	F-202602-000019	f41d77d6-bd3f-4c5e-8873-6a2bfdcbb17b	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	EMITIDA	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 12:46:43.944099	2026-02-06 12:47:20.624877	\N
9c863130-bf70-45e6-9bdd-6a19fa8fbcd8	F-202602-000020	f7636e97-3cbb-4bd7-8a54-54809ed6034a	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	BORRADOR	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 12:50:48.017057	2026-02-06 12:50:48.017057	\N
00ce1838-999b-4c68-be0d-40c56d35c707	F-202602-000021	4d008e42-2637-4850-b65a-749f61e0c464	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	BORRADOR	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 13:06:04.169344	2026-02-06 13:06:04.169344	\N
be6326cc-3efe-4cb1-9de5-48d1f1706e40	F-202602-000022	ec872163-d2b5-4df2-b02d-777674010f9e	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	PAGADA	2.50	0.00	0.30	12.00	2.80	EFECTIVO	2026-02-06 08:56:38.678	PAGO-001	Pago al contado	{"tarifaBase": 2.5}	2026-02-06 13:53:01.102678	2026-02-06 13:56:38.621947	\N
b01bd0ef-ab98-4975-b45d-04a7aa9b1040	F-202602-000023	e389c59c-cef9-4165-a4a5-b68df88e1e9c	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Cliente Temporal	\N	\N	\N	\N	BORRADOR	2.50	0.00	0.30	12.00	2.80	\N	\N	\N	\N	{"tarifaBase": 2.5}	2026-02-06 15:41:04.472341	2026-02-06 15:41:04.472341	\N
\.


--
-- Data for Name: tarifas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tarifas (id, "tipoEntrega", "tipoVehiculo", nombre, descripcion, "tarifaBase", "costoPorKm", "costoPorKg", "costoMinimo", "tarifaUrgente", "factorZona", "porcentajeDescuentoVolumen", "kmIncluidos", "kgIncluidos", activa, "validaDesde", "validaHasta", "createdAt", "updatedAt") FROM stdin;
e4b6cb7c-159d-4876-8ad7-07823f7194cc	URBANA	MOTORIZADO	Urbana Motorizado	Entrega rápida en moto dentro de la ciudad	2.50	0.50	0.00	2.50	1.50	\N	0.00	3	\N	t	\N	\N	2026-02-06 05:05:12.064584	2026-02-06 05:05:12.064584
e158eb67-fb16-4cb6-b3ad-6b71d6011a9a	URBANA	VEHICULO_LIVIANO	Urbana Vehículo Liviano	Entrega en auto/furgoneta dentro de la ciudad	5.00	0.80	0.00	5.00	3.00	\N	0.00	3	\N	t	\N	\N	2026-02-06 05:05:12.077887	2026-02-06 05:05:12.077887
9dd0136a-36b4-4152-9f32-7b5b24fe861e	INTERMUNICIPAL	CAMION	Intermunicipal Camión	Transporte de carga entre ciudades cercanas	50.00	1.20	0.10	60.00	\N	1.10	0.00	\N	100	t	\N	\N	2026-02-06 05:05:12.08586	2026-02-06 05:05:12.08586
\.


--
-- Name: tarifas PK_a264af6b1739ea9368d9326e158; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tarifas
    ADD CONSTRAINT "PK_a264af6b1739ea9368d9326e158" PRIMARY KEY (id);


--
-- Name: detalle_facturas PK_aa7bd5763b128375ac946e6421a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_facturas
    ADD CONSTRAINT "PK_aa7bd5763b128375ac946e6421a" PRIMARY KEY (id);


--
-- Name: facturas PK_f302947c1e4773639b20707a8bc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT "PK_f302947c1e4773639b20707a8bc" PRIMARY KEY (id);


--
-- Name: facturas UQ_c1c9068ac7479eb9d9b02fba712; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT "UQ_c1c9068ac7479eb9d9b02fba712" UNIQUE ("numeroFactura");


--
-- Name: IDX_02663fbd4c85d1665b165e7d70; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_02663fbd4c85d1665b165e7d70" ON public.tarifas USING btree ("tipoEntrega", "tipoVehiculo", activa);


--
-- Name: IDX_38f8b4f6e6e2aef75386ba9783; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_38f8b4f6e6e2aef75386ba9783" ON public.facturas USING btree ("pedidoId");


--
-- Name: IDX_97cf4eb3ca1183cd9ab22c8012; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_97cf4eb3ca1183cd9ab22c8012" ON public.facturas USING btree ("createdAt");


--
-- Name: IDX_be6dba2298d9414913463f492b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_be6dba2298d9414913463f492b" ON public.facturas USING btree ("clienteId");


--
-- Name: IDX_c1c9068ac7479eb9d9b02fba71; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c1c9068ac7479eb9d9b02fba71" ON public.facturas USING btree ("numeroFactura");


--
-- Name: IDX_c55dcc7b95ab86eb559a5bed04; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c55dcc7b95ab86eb559a5bed04" ON public.facturas USING btree (estado);


--
-- Name: detalle_facturas FK_8b5b196f61944edebd073c79bb7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_facturas
    ADD CONSTRAINT "FK_8b5b196f61944edebd073c79bb7" FOREIGN KEY ("facturaId") REFERENCES public.facturas(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict EoGcFNF5qvuKynRLje8tw0NWrc0trC55SDLSSRiWWucPvkIRRHsRDQzx28gYEKi

