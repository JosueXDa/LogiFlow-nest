--
-- PostgreSQL database dump
--

\restrict nmMxP8H6zFfDns78rz04T6NwOyjQldj03EWFbnszbYSzBUaThINFNC8U2bhDHi2

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

ALTER TABLE IF EXISTS ONLY public.repartidores DROP CONSTRAINT IF EXISTS "FK_a337f37a3c557f00130269895ac";
ALTER TABLE IF EXISTS ONLY public.conductores DROP CONSTRAINT IF EXISTS "FK_94721bd5f41fc62c71eb69b110c";
ALTER TABLE IF EXISTS ONLY public.asignaciones DROP CONSTRAINT IF EXISTS "FK_8a3c757284230beafd47da50e44";
ALTER TABLE IF EXISTS ONLY public.repartidores DROP CONSTRAINT IF EXISTS "FK_07f923585c818ba6365aa058929";
DROP INDEX IF EXISTS public."IDX_fd5d5e7612ac29cc4928ddd6c0";
DROP INDEX IF EXISTS public."IDX_cdef0dbac176a550b3194ddbea";
DROP INDEX IF EXISTS public."IDX_a337f37a3c557f00130269895a";
DROP INDEX IF EXISTS public."IDX_832a0bdf53ba3a0afe741151e1";
DROP INDEX IF EXISTS public."IDX_6a67c12cb704a5cad41cdb789e";
DROP INDEX IF EXISTS public."IDX_6647e2be7bcfa06b7c79110bf4";
DROP INDEX IF EXISTS public."IDX_3667d9dd241dd629514c4224a7";
DROP INDEX IF EXISTS public."IDX_0f8d1e01103dc8a58ff13e79bc";
ALTER TABLE IF EXISTS ONLY public.repartidores DROP CONSTRAINT IF EXISTS "UQ_db06b078708b839316b6a1f9e91";
ALTER TABLE IF EXISTS ONLY public.vehiculos DROP CONSTRAINT IF EXISTS "UQ_a9455f3a37d1d922a10f51664e9";
ALTER TABLE IF EXISTS ONLY public.zonas DROP CONSTRAINT IF EXISTS "UQ_57f8678e93e8d1551eb00e2dd04";
ALTER TABLE IF EXISTS ONLY public.repartidores DROP CONSTRAINT IF EXISTS "UQ_08c7497388aeb2e1b1b0b9eb720";
ALTER TABLE IF EXISTS ONLY public.conductores DROP CONSTRAINT IF EXISTS "REL_94721bd5f41fc62c71eb69b110";
ALTER TABLE IF EXISTS ONLY public.repartidores DROP CONSTRAINT IF EXISTS "REL_07f923585c818ba6365aa05892";
ALTER TABLE IF EXISTS ONLY public.vehiculos DROP CONSTRAINT IF EXISTS "PK_bc0b75baae377e599cd46b502e1";
ALTER TABLE IF EXISTS ONLY public.zonas DROP CONSTRAINT IF EXISTS "PK_a2af808b9c6ed91c353fd980ab0";
ALTER TABLE IF EXISTS ONLY public.conductores DROP CONSTRAINT IF EXISTS "PK_926e60bda075f19cd61b934ed39";
ALTER TABLE IF EXISTS ONLY public.asignaciones DROP CONSTRAINT IF EXISTS "PK_6c11ab1a82249192bc2e2763d3a";
ALTER TABLE IF EXISTS ONLY public.repartidores DROP CONSTRAINT IF EXISTS "PK_354540fe5c7a7cea2859f4b4023";
DROP TABLE IF EXISTS public.zonas;
DROP TABLE IF EXISTS public.vehiculos;
DROP TABLE IF EXISTS public.repartidores;
DROP TABLE IF EXISTS public.conductores;
DROP TABLE IF EXISTS public.asignaciones;
DROP TYPE IF EXISTS public.vehiculos_tipo_enum;
DROP TYPE IF EXISTS public.vehiculos_estado_enum;
DROP TYPE IF EXISTS public.repartidores_tipolicencia_enum;
DROP TYPE IF EXISTS public.repartidores_estado_enum;
DROP TYPE IF EXISTS public.conductores_estado_enum;
DROP TYPE IF EXISTS public.asignaciones_estado_enum;
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
-- Name: asignaciones_estado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.asignaciones_estado_enum AS ENUM (
    'ASIGNADA',
    'EN_CURSO',
    'COMPLETADA',
    'CANCELADA'
);


ALTER TYPE public.asignaciones_estado_enum OWNER TO postgres;

--
-- Name: conductores_estado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.conductores_estado_enum AS ENUM (
    'DISPONIBLE',
    'OCUPADO',
    'FUERA_DE_SERVICIO'
);


ALTER TYPE public.conductores_estado_enum OWNER TO postgres;

--
-- Name: repartidores_estado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.repartidores_estado_enum AS ENUM (
    'DISPONIBLE',
    'OCUPADO',
    'INACTIVO',
    'SUSPENDIDO'
);


ALTER TYPE public.repartidores_estado_enum OWNER TO postgres;

--
-- Name: repartidores_tipolicencia_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.repartidores_tipolicencia_enum AS ENUM (
    'A',
    'B',
    'C',
    'D',
    'E',
    'F'
);


ALTER TYPE public.repartidores_tipolicencia_enum OWNER TO postgres;

--
-- Name: vehiculos_estado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.vehiculos_estado_enum AS ENUM (
    'OPERATIVO',
    'EN_MANTENIMIENTO',
    'FUERA_DE_SERVICIO'
);


ALTER TYPE public.vehiculos_estado_enum OWNER TO postgres;

--
-- Name: vehiculos_tipo_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.vehiculos_tipo_enum AS ENUM (
    'MOTORIZADO',
    'VEHICULO_LIVIANO',
    'CAMION'
);


ALTER TYPE public.vehiculos_tipo_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asignaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asignaciones (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "pedidoId" uuid NOT NULL,
    "repartidorId" uuid NOT NULL,
    "fechaAsignacion" timestamp without time zone NOT NULL,
    "fechaInicio" timestamp without time zone,
    "fechaFin" timestamp without time zone,
    estado public.asignaciones_estado_enum DEFAULT 'ASIGNADA'::public.asignaciones_estado_enum NOT NULL,
    "distanciaKm" numeric(10,2),
    "tiempoEstimadoMin" integer,
    observaciones text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    repartidor_id uuid
);


ALTER TABLE public.asignaciones OWNER TO postgres;

--
-- Name: conductores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conductores (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "usuarioId" uuid NOT NULL,
    nombre character varying(100) NOT NULL,
    estado public.conductores_estado_enum DEFAULT 'FUERA_DE_SERVICIO'::public.conductores_estado_enum NOT NULL,
    latitud numeric(10,7),
    longitud numeric(10,7),
    "zonaOperacionId" character varying(50) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "vehiculoId" uuid
);


ALTER TABLE public.conductores OWNER TO postgres;

--
-- Name: repartidores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.repartidores (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    cedula character varying(10) NOT NULL,
    telefono character varying(15) NOT NULL,
    email character varying(100) NOT NULL,
    licencia character varying(20) NOT NULL,
    "tipoLicencia" public.repartidores_tipolicencia_enum NOT NULL,
    estado public.repartidores_estado_enum DEFAULT 'DISPONIBLE'::public.repartidores_estado_enum NOT NULL,
    zona_id uuid NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone,
    vehiculo_id uuid
);


ALTER TABLE public.repartidores OWNER TO postgres;

--
-- Name: vehiculos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehiculos (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    tipo public.vehiculos_tipo_enum NOT NULL,
    "capacidadKg" numeric(10,2) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "numeroPuertas" integer,
    "numeroEjes" integer,
    marca character varying(50) NOT NULL,
    "año" integer NOT NULL,
    color character varying(30) NOT NULL,
    estado public.vehiculos_estado_enum DEFAULT 'OPERATIVO'::public.vehiculos_estado_enum NOT NULL,
    "capacidadM3" numeric(10,2) NOT NULL,
    kilometraje integer DEFAULT 0 NOT NULL,
    "cargaActualKg" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "volumenActualM3" numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    "ultimaRevision" date,
    "proximoMant" date,
    "deletedAt" timestamp without time zone,
    "cilindradaCc" integer,
    "tieneTopCase" boolean DEFAULT false,
    "velocidadPromedioKmh" numeric(5,2) DEFAULT '40'::numeric,
    "tieneAireAcondicionado" boolean DEFAULT false,
    "esPickup" boolean DEFAULT false,
    "tipoCamion" character varying(50),
    "tieneRampa" boolean DEFAULT false,
    "tieneRefrigeracion" boolean DEFAULT false,
    placa character varying(10) NOT NULL,
    modelo character varying(50) NOT NULL
);


ALTER TABLE public.vehiculos OWNER TO postgres;

--
-- Name: zonas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.zonas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    nombre character varying NOT NULL,
    descripcion character varying,
    coordenadas text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "deletedAt" timestamp without time zone
);


ALTER TABLE public.zonas OWNER TO postgres;

--
-- Data for Name: asignaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asignaciones (id, "pedidoId", "repartidorId", "fechaAsignacion", "fechaInicio", "fechaFin", estado, "distanciaKm", "tiempoEstimadoMin", observaciones, "createdAt", "updatedAt", repartidor_id) FROM stdin;
c14de780-b270-4019-80fb-7810c17d20d9	bb9af25e-65c9-4bd1-98cf-50f9408bafc7	2401191b-0a13-47fa-a2af-5ab1459eabe2	2026-02-06 02:33:13.555	\N	\N	ASIGNADA	10.00	30	\N	2026-02-06 07:33:13.360546	2026-02-06 07:33:13.360546	2401191b-0a13-47fa-a2af-5ab1459eabe2
b96ecff8-bd08-4ff0-93b7-1f26997c453a	06df2f48-fec0-47bb-b03d-09d2b646bbb4	2401191b-0a13-47fa-a2af-5ab1459eabe2	2026-02-06 02:35:29.048	\N	\N	ASIGNADA	10.00	30	\N	2026-02-06 07:35:28.530941	2026-02-06 07:35:28.530941	2401191b-0a13-47fa-a2af-5ab1459eabe2
8dd347cc-f0df-4e83-be7c-67409d8eae9f	67792f1e-41b7-4139-ac21-419b8cea7e64	2401191b-0a13-47fa-a2af-5ab1459eabe2	2026-02-06 02:47:14.807	\N	\N	ASIGNADA	10.00	30	\N	2026-02-06 07:47:14.511383	2026-02-06 07:47:14.511383	2401191b-0a13-47fa-a2af-5ab1459eabe2
d1d2e231-a54e-45c2-8e22-e1a38d13f80d	bbfb233e-8fdf-4f5f-a7a2-4e6f7a7dc989	2401191b-0a13-47fa-a2af-5ab1459eabe2	2026-02-06 02:49:36.832	\N	\N	ASIGNADA	10.00	30	\N	2026-02-06 07:49:36.633806	2026-02-06 07:49:36.633806	2401191b-0a13-47fa-a2af-5ab1459eabe2
639a9f1e-a6ea-4461-bc0e-9d3318ed7333	f7636e97-3cbb-4bd7-8a54-54809ed6034a	2401191b-0a13-47fa-a2af-5ab1459eabe2	2026-02-06 07:50:48.422	2026-02-06 07:57:40.653	\N	EN_CURSO	10.00	30	\N	2026-02-06 12:50:47.954341	2026-02-06 12:57:40.327985	2401191b-0a13-47fa-a2af-5ab1459eabe2
899b331d-5170-40b7-b7a5-83413dda0473	f41d77d6-bd3f-4c5e-8873-6a2bfdcbb17b	2401191b-0a13-47fa-a2af-5ab1459eabe2	2026-02-06 07:46:43.867	2026-02-06 08:03:02.676	\N	EN_CURSO	10.00	30	\N	2026-02-06 12:46:43.859973	2026-02-06 13:03:02.36423	2401191b-0a13-47fa-a2af-5ab1459eabe2
8b4e0a86-da05-4597-a4fc-1b8adf015c67	4d008e42-2637-4850-b65a-749f61e0c464	7e8367fe-b4bb-4c4f-9d52-e47658d4dbf5	2026-02-06 08:06:04.216	2026-02-06 08:07:16.219	\N	EN_CURSO	10.00	30	\N	2026-02-06 13:06:04.164993	2026-02-06 13:07:15.649524	7e8367fe-b4bb-4c4f-9d52-e47658d4dbf5
519c90fc-4480-4b8f-a66e-18b4f285b830	03347542-5e75-49ab-a403-6df7d10a3556	2401191b-0a13-47fa-a2af-5ab1459eabe2	2026-02-06 02:36:47.905	\N	2026-02-06 08:50:16.03	COMPLETADA	10.00	30	\N	2026-02-06 07:36:47.01495	2026-02-06 13:50:15.775537	2401191b-0a13-47fa-a2af-5ab1459eabe2
d3082143-a259-4f7e-b562-e355d7fcd832	ec872163-d2b5-4df2-b02d-777674010f9e	2401191b-0a13-47fa-a2af-5ab1459eabe2	2026-02-06 08:53:01.727	\N	\N	ASIGNADA	10.00	30	\N	2026-02-06 13:53:01.207048	2026-02-06 13:53:01.207048	2401191b-0a13-47fa-a2af-5ab1459eabe2
32afd24f-7079-4b4c-a0e9-e53fef984c86	e389c59c-cef9-4165-a4a5-b68df88e1e9c	2401191b-0a13-47fa-a2af-5ab1459eabe2	2026-02-06 10:41:04.26	\N	\N	ASIGNADA	10.00	30	\N	2026-02-06 15:41:04.492008	2026-02-06 15:41:04.492008	2401191b-0a13-47fa-a2af-5ab1459eabe2
\.


--
-- Data for Name: conductores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conductores (id, "usuarioId", nombre, estado, latitud, longitud, "zonaOperacionId", "createdAt", "updatedAt", "vehiculoId") FROM stdin;
\.


--
-- Data for Name: repartidores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.repartidores (id, nombre, apellido, cedula, telefono, email, licencia, "tipoLicencia", estado, zona_id, "createdAt", "updatedAt", "deletedAt", vehiculo_id) FROM stdin;
d1db7529-e541-4789-b37d-724088c0466c	Carlos	Ruiz	1723456791	+593998877665	carlos.ruiz@logiflow.com	LIC-003	A	DISPONIBLE	e01acddd-7139-4132-b3fe-ca3cd3cbf144	2026-02-06 07:06:27.449164	2026-02-06 07:32:52.49526	\N	ec47a7c1-c370-4e63-b614-eeec93a16496
7e8367fe-b4bb-4c4f-9d52-e47658d4dbf5	Maria	Gomez	1723456790	+593987654321	maria.gomez@logiflow.com	LIC-002	B	OCUPADO	6ccdc2bd-1617-4301-a531-0e05f92958f8	2026-02-06 07:06:27.420176	2026-02-06 13:07:15.633782	\N	a5129345-b120-4ba0-b0d1-a785a0635b9b
2401191b-0a13-47fa-a2af-5ab1459eabe2	Juan	Perez	1723456789	+593991234567	juan.perez@logiflow.com	LIC-001	A	DISPONIBLE	7f325ec1-6e49-4ea1-b31b-6bd9db85aaa1	2026-02-06 07:06:27.372623	2026-02-06 13:50:15.724577	\N	ba9a2565-0a4f-458c-aa47-39aed7fd208e
\.


--
-- Data for Name: vehiculos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehiculos (id, tipo, "capacidadKg", "createdAt", "updatedAt", "numeroPuertas", "numeroEjes", marca, "año", color, estado, "capacidadM3", kilometraje, "cargaActualKg", "volumenActualM3", "ultimaRevision", "proximoMant", "deletedAt", "cilindradaCc", "tieneTopCase", "velocidadPromedioKmh", "tieneAireAcondicionado", "esPickup", "tipoCamion", "tieneRampa", "tieneRefrigeracion", placa, modelo) FROM stdin;
ba9a2565-0a4f-458c-aa47-39aed7fd208e	MOTORIZADO	20.00	2026-02-06 07:06:27.260412	2026-02-06 07:06:27.260412	\N	\N	Yamaha	2023	Negro	OPERATIVO	0.50	0	0.00	0.00	\N	\N	\N	250	t	40.00	f	f	\N	f	f	ABC-123	FZ-25
a5129345-b120-4ba0-b0d1-a785a0635b9b	MOTORIZADO	15.00	2026-02-06 07:06:27.302834	2026-02-06 07:06:27.302834	\N	\N	Honda	2022	Rojo	OPERATIVO	0.40	0	0.00	0.00	\N	\N	\N	150	t	40.00	f	f	\N	f	f	XYZ-987	XR-150
ec47a7c1-c370-4e63-b614-eeec93a16496	VEHICULO_LIVIANO	200.00	2026-02-06 07:06:27.332029	2026-02-06 07:06:27.332029	5	\N	Chevrolet	2020	Blanco	OPERATIVO	2.00	0	0.00	0.00	\N	\N	\N	\N	f	40.00	f	f	\N	f	f	LIV-001	Spark
\.


--
-- Data for Name: zonas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.zonas (id, nombre, descripcion, coordenadas, "createdAt", "updatedAt", "deletedAt") FROM stdin;
7f325ec1-6e49-4ea1-b31b-6bd9db85aaa1	Quito Norte	\N	\N	2026-02-06 07:06:27.146872	2026-02-06 07:06:27.146872	\N
6ccdc2bd-1617-4301-a531-0e05f92958f8	Quito Sur	\N	\N	2026-02-06 07:06:27.20163	2026-02-06 07:06:27.20163	\N
e01acddd-7139-4132-b3fe-ca3cd3cbf144	Valle de los Chillos	\N	\N	2026-02-06 07:06:27.222019	2026-02-06 07:06:27.222019	\N
\.


--
-- Name: repartidores PK_354540fe5c7a7cea2859f4b4023; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repartidores
    ADD CONSTRAINT "PK_354540fe5c7a7cea2859f4b4023" PRIMARY KEY (id);


--
-- Name: asignaciones PK_6c11ab1a82249192bc2e2763d3a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones
    ADD CONSTRAINT "PK_6c11ab1a82249192bc2e2763d3a" PRIMARY KEY (id);


--
-- Name: conductores PK_926e60bda075f19cd61b934ed39; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conductores
    ADD CONSTRAINT "PK_926e60bda075f19cd61b934ed39" PRIMARY KEY (id);


--
-- Name: zonas PK_a2af808b9c6ed91c353fd980ab0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zonas
    ADD CONSTRAINT "PK_a2af808b9c6ed91c353fd980ab0" PRIMARY KEY (id);


--
-- Name: vehiculos PK_bc0b75baae377e599cd46b502e1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos
    ADD CONSTRAINT "PK_bc0b75baae377e599cd46b502e1" PRIMARY KEY (id);


--
-- Name: repartidores REL_07f923585c818ba6365aa05892; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repartidores
    ADD CONSTRAINT "REL_07f923585c818ba6365aa05892" UNIQUE (vehiculo_id);


--
-- Name: conductores REL_94721bd5f41fc62c71eb69b110; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conductores
    ADD CONSTRAINT "REL_94721bd5f41fc62c71eb69b110" UNIQUE ("vehiculoId");


--
-- Name: repartidores UQ_08c7497388aeb2e1b1b0b9eb720; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repartidores
    ADD CONSTRAINT "UQ_08c7497388aeb2e1b1b0b9eb720" UNIQUE (email);


--
-- Name: zonas UQ_57f8678e93e8d1551eb00e2dd04; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.zonas
    ADD CONSTRAINT "UQ_57f8678e93e8d1551eb00e2dd04" UNIQUE (nombre);


--
-- Name: vehiculos UQ_a9455f3a37d1d922a10f51664e9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos
    ADD CONSTRAINT "UQ_a9455f3a37d1d922a10f51664e9" UNIQUE (placa);


--
-- Name: repartidores UQ_db06b078708b839316b6a1f9e91; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repartidores
    ADD CONSTRAINT "UQ_db06b078708b839316b6a1f9e91" UNIQUE (cedula);


--
-- Name: IDX_0f8d1e01103dc8a58ff13e79bc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_0f8d1e01103dc8a58ff13e79bc" ON public.asignaciones USING btree (estado);


--
-- Name: IDX_3667d9dd241dd629514c4224a7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3667d9dd241dd629514c4224a7" ON public.vehiculos USING btree (tipo);


--
-- Name: IDX_6647e2be7bcfa06b7c79110bf4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6647e2be7bcfa06b7c79110bf4" ON public.asignaciones USING btree ("pedidoId");


--
-- Name: IDX_6a67c12cb704a5cad41cdb789e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_6a67c12cb704a5cad41cdb789e" ON public.repartidores USING btree (estado);


--
-- Name: IDX_832a0bdf53ba3a0afe741151e1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_832a0bdf53ba3a0afe741151e1" ON public.asignaciones USING btree ("repartidorId");


--
-- Name: IDX_a337f37a3c557f00130269895a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_a337f37a3c557f00130269895a" ON public.repartidores USING btree (zona_id);


--
-- Name: IDX_cdef0dbac176a550b3194ddbea; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_cdef0dbac176a550b3194ddbea" ON public.vehiculos USING btree (estado);


--
-- Name: IDX_fd5d5e7612ac29cc4928ddd6c0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_fd5d5e7612ac29cc4928ddd6c0" ON public.asignaciones USING btree ("fechaAsignacion");


--
-- Name: repartidores FK_07f923585c818ba6365aa058929; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repartidores
    ADD CONSTRAINT "FK_07f923585c818ba6365aa058929" FOREIGN KEY (vehiculo_id) REFERENCES public.vehiculos(id);


--
-- Name: asignaciones FK_8a3c757284230beafd47da50e44; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asignaciones
    ADD CONSTRAINT "FK_8a3c757284230beafd47da50e44" FOREIGN KEY (repartidor_id) REFERENCES public.repartidores(id);


--
-- Name: conductores FK_94721bd5f41fc62c71eb69b110c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conductores
    ADD CONSTRAINT "FK_94721bd5f41fc62c71eb69b110c" FOREIGN KEY ("vehiculoId") REFERENCES public.vehiculos(id);


--
-- Name: repartidores FK_a337f37a3c557f00130269895ac; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.repartidores
    ADD CONSTRAINT "FK_a337f37a3c557f00130269895ac" FOREIGN KEY (zona_id) REFERENCES public.zonas(id);


--
-- PostgreSQL database dump complete
--

\unrestrict nmMxP8H6zFfDns78rz04T6NwOyjQldj03EWFbnszbYSzBUaThINFNC8U2bhDHi2

