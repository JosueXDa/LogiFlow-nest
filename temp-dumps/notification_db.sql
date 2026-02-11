--
-- PostgreSQL database dump
--

\restrict NMWhotUo5vzZqF9Zoufa1geEm6mP7REiakS7htlWJW8lK7XguGBbicwCmikHD7f

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

ALTER TABLE IF EXISTS ONLY public.notification_logs DROP CONSTRAINT IF EXISTS "PK_19c524e644cdeaebfcffc284871";
DROP TABLE IF EXISTS public.notification_logs;
DROP EXTENSION IF EXISTS "uuid-ossp";
--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: notification_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "eventName" character varying NOT NULL,
    payload jsonb,
    source character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notification_logs OWNER TO postgres;

--
-- Data for Name: notification_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_logs (id, "eventName", payload, source, "createdAt") FROM stdin;
619b66b4-31e5-4932-83c9-40b756fb60e8	inventory_events_queue	{"fecha": "2026-02-06T12:46:43.597Z", "cantidad": 2, "pedidoId": "f41d77d6-bd3f-4c5e-8873-6a2bfdcbb17b", "reservaId": "ac782287-18bd-4d0b-9303-3262e957f085", "productoId": "fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa", "productoSku": "PROD-010", "stockDisponible": 56}	RabbitMQ	2026-02-06 15:26:33.973567
4663c357-b1ea-4929-8070-ac7de1d3585e	inventory_events_queue	{"fecha": "2026-02-06T12:50:48.270Z", "cantidad": 2, "pedidoId": "f7636e97-3cbb-4bd7-8a54-54809ed6034a", "reservaId": "5a37c4c8-caa2-435f-9a9e-0ada2b8200fa", "productoId": "fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa", "productoSku": "PROD-010", "stockDisponible": 54}	RabbitMQ	2026-02-06 15:26:34.005328
21015b25-0349-4246-bca1-d3813dfe5ac0	inventory_events_queue	{"fecha": "2026-02-06T13:06:04.087Z", "cantidad": 2, "pedidoId": "4d008e42-2637-4850-b65a-749f61e0c464", "reservaId": "32283d7b-ae6e-4415-840a-877c7a7989a1", "productoId": "fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa", "productoSku": "PROD-010", "stockDisponible": 52}	RabbitMQ	2026-02-06 15:26:34.017469
e25d61ce-5dbf-46df-a1df-a0a94422b152	inventory_events_queue	{"fecha": "2026-02-06T13:50:16.426Z", "cantidad": 2, "pedidoId": "03347542-5e75-49ab-a403-6df7d10a3556", "productoId": "fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa"}	RabbitMQ	2026-02-06 15:26:34.031836
59ac02b5-faf0-41ec-a1f7-b0400c6be698	inventory_events_queue	{"fecha": "2026-02-06T13:50:16.430Z", "cantidad": 2, "pedidoId": "03347542-5e75-49ab-a403-6df7d10a3556", "productoId": "fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa"}	RabbitMQ	2026-02-06 15:26:34.045359
4254ab34-591b-425d-8827-46f870f20561	inventory_events_queue	{"fecha": "2026-02-06T13:53:01.475Z", "cantidad": 2, "pedidoId": "ec872163-d2b5-4df2-b02d-777674010f9e", "reservaId": "e14d4911-f9c8-4a21-bf24-08a6533b23dd", "productoId": "fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa", "productoSku": "PROD-010", "stockDisponible": 50}	RabbitMQ	2026-02-06 15:26:34.061647
5d2ab434-bb22-4cc2-aab9-b249e45de8a8	tracking_events_queue	{"data": {"latitud": -0.1789, "longitud": -78.4685, "pedidoId": "8b4e0a86-da05-4597-a4fc-1b8adf015c67", "precision": null, "timestamp": "2026-02-06T18:46:25.846Z", "repartidorId": "7e8367fe-b4bb-4c4f-9d52-e47658d4dbf5", "velocidadKmh": 35.5}, "eventName": "repartidor.ubicacion.actualizada", "timestamp": "2026-02-06T13:46:26.092Z"}	RabbitMQ	2026-02-06 15:28:00.777065
9ad958ec-2594-486a-8351-3b45a37e5492	inventory_events_queue	{"fecha": "2026-02-06T15:41:03.510Z", "cantidad": 2, "pedidoId": "e389c59c-cef9-4165-a4a5-b68df88e1e9c", "reservaId": "0144cdca-fb16-47d3-ba4f-066064909532", "productoId": "fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa", "productoSku": "PROD-010", "stockDisponible": 48}	RabbitMQ	2026-02-06 15:41:03.887105
\.


--
-- Name: notification_logs PK_19c524e644cdeaebfcffc284871; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT "PK_19c524e644cdeaebfcffc284871" PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict NMWhotUo5vzZqF9Zoufa1geEm6mP7REiakS7htlWJW8lK7XguGBbicwCmikHD7f

