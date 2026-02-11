--
-- PostgreSQL database dump
--

\restrict I5aMIuBezhwApqDP2o0DOUxtcNrtnOiShtRD6CC0Mi9CGFwADheamaWbXxnyuXw

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

DROP INDEX IF EXISTS public."IDX_f7998e065fc194e6cf1959a4ed";
DROP INDEX IF EXISTS public."IDX_f5a0ffa60fdd64d2979ab40f8b";
DROP INDEX IF EXISTS public."IDX_d5743ce390e46338f8a0c0a51f";
DROP INDEX IF EXISTS public."IDX_d189772b7d3af771baa361faf9";
DROP INDEX IF EXISTS public."IDX_c347f9e574843d3a0a13273b4e";
ALTER TABLE IF EXISTS ONLY public.ubicaciones DROP CONSTRAINT IF EXISTS "PK_a9ce0b671142b83ebff02722cf9";
ALTER TABLE IF EXISTS ONLY public.rutas DROP CONSTRAINT IF EXISTS "PK_80408b869ec5168c98210b8eba8";
DROP TABLE IF EXISTS public.ubicaciones;
DROP TABLE IF EXISTS public.rutas;
DROP TYPE IF EXISTS public.rutas_estado_enum;
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
-- Name: rutas_estado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.rutas_estado_enum AS ENUM (
    'EN_CURSO',
    'COMPLETADA',
    'CANCELADA'
);


ALTER TYPE public.rutas_estado_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: rutas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rutas (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "pedidoId" uuid NOT NULL,
    "repartidorId" uuid NOT NULL,
    estado public.rutas_estado_enum DEFAULT 'EN_CURSO'::public.rutas_estado_enum NOT NULL,
    "origenLat" numeric(10,7) NOT NULL,
    "origenLng" numeric(10,7) NOT NULL,
    "origenDireccion" character varying(255),
    "destinoLat" numeric(10,7) NOT NULL,
    "destinoLng" numeric(10,7) NOT NULL,
    "destinoDireccion" character varying(255),
    "distanciaRecorridaKm" numeric(10,2),
    "distanciaEsperadaKm" numeric(10,2),
    "duracionMinutos" integer,
    "duracionEsperadaMinutos" integer,
    "fechaInicio" timestamp without time zone DEFAULT now() NOT NULL,
    "fechaFin" timestamp without time zone,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.rutas OWNER TO postgres;

--
-- Name: ubicaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ubicaciones (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "repartidorId" uuid NOT NULL,
    "pedidoId" uuid,
    "rutaId" uuid,
    latitud numeric(10,7) NOT NULL,
    longitud numeric(10,7) NOT NULL,
    "velocidadKmh" numeric(5,2),
    "precision" numeric(5,2),
    altitud numeric(5,2),
    rumbo numeric(5,2),
    "dispositivoId" character varying(50),
    "tipoConexion" character varying(20),
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    metadata jsonb
);


ALTER TABLE public.ubicaciones OWNER TO postgres;

--
-- Data for Name: rutas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rutas (id, "pedidoId", "repartidorId", estado, "origenLat", "origenLng", "origenDireccion", "destinoLat", "destinoLng", "destinoDireccion", "distanciaRecorridaKm", "distanciaEsperadaKm", "duracionMinutos", "duracionEsperadaMinutos", "fechaInicio", "fechaFin", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ubicaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ubicaciones (id, "repartidorId", "pedidoId", "rutaId", latitud, longitud, "velocidadKmh", "precision", altitud, rumbo, "dispositivoId", "tipoConexion", "timestamp", metadata) FROM stdin;
6fa662e7-cb40-42d0-883f-cd2e46f7a17f	7e8367fe-b4bb-4c4f-9d52-e47658d4dbf5	8b4e0a86-da05-4597-a4fc-1b8adf015c67	\N	-0.1789000	-78.4685000	35.50	\N	\N	180.00	\N	\N	2026-02-06 13:46:25.84663	\N
\.


--
-- Name: rutas PK_80408b869ec5168c98210b8eba8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rutas
    ADD CONSTRAINT "PK_80408b869ec5168c98210b8eba8" PRIMARY KEY (id);


--
-- Name: ubicaciones PK_a9ce0b671142b83ebff02722cf9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicaciones
    ADD CONSTRAINT "PK_a9ce0b671142b83ebff02722cf9" PRIMARY KEY (id);


--
-- Name: IDX_c347f9e574843d3a0a13273b4e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_c347f9e574843d3a0a13273b4e" ON public.ubicaciones USING btree ("pedidoId", "timestamp");


--
-- Name: IDX_d189772b7d3af771baa361faf9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d189772b7d3af771baa361faf9" ON public.ubicaciones USING btree ("rutaId");


--
-- Name: IDX_d5743ce390e46338f8a0c0a51f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d5743ce390e46338f8a0c0a51f" ON public.ubicaciones USING btree ("repartidorId", "timestamp");


--
-- Name: IDX_f5a0ffa60fdd64d2979ab40f8b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_f5a0ffa60fdd64d2979ab40f8b" ON public.rutas USING btree ("pedidoId");


--
-- Name: IDX_f7998e065fc194e6cf1959a4ed; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_f7998e065fc194e6cf1959a4ed" ON public.rutas USING btree ("repartidorId", estado);


--
-- PostgreSQL database dump complete
--

\unrestrict I5aMIuBezhwApqDP2o0DOUxtcNrtnOiShtRD6CC0Mi9CGFwADheamaWbXxnyuXw

