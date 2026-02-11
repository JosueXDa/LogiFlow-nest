--
-- PostgreSQL database dump
--

\restrict ZP5EvUKg9jNqyfihHdwvCHbea1xgDNYfJwoqHFyb3UQjWL0VLjChFzygIjvluM8

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

ALTER TABLE IF EXISTS ONLY public.reservas_stock DROP CONSTRAINT IF EXISTS "FK_c85dc23b3d25c15b30832ba521a";
ALTER TABLE IF EXISTS ONLY public.productos DROP CONSTRAINT IF EXISTS "UQ_805687bf24c1411756fbd37b2f3";
ALTER TABLE IF EXISTS ONLY public.reservas_stock DROP CONSTRAINT IF EXISTS "PK_a73014603774a764d03c5f9ad3e";
ALTER TABLE IF EXISTS ONLY public.productos DROP CONSTRAINT IF EXISTS "PK_04f604609a0949a7f3b43400766";
DROP TABLE IF EXISTS public.reservas_stock;
DROP TABLE IF EXISTS public.productos;
DROP TYPE IF EXISTS public.reservas_stock_estado_enum;
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
-- Name: reservas_stock_estado_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.reservas_stock_estado_enum AS ENUM (
    'PENDIENTE',
    'CONFIRMADA',
    'CANCELADA'
);


ALTER TYPE public.reservas_stock_estado_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sku character varying NOT NULL,
    nombre character varying NOT NULL,
    descripcion text,
    precio numeric(10,2) NOT NULL,
    "pesoKg" double precision NOT NULL,
    "stockTotal" integer DEFAULT 0 NOT NULL,
    "stockReservado" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- Name: reservas_stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservas_stock (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "pedidoId" uuid NOT NULL,
    cantidad integer NOT NULL,
    estado public.reservas_stock_estado_enum DEFAULT 'PENDIENTE'::public.reservas_stock_estado_enum NOT NULL,
    "expiraEn" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "productoId" uuid
);


ALTER TABLE public.reservas_stock OWNER TO postgres;

--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (id, sku, nombre, descripcion, precio, "pesoKg", "stockTotal", "stockReservado", "createdAt", "updatedAt") FROM stdin;
8a57af80-7326-4035-96da-65835918dc4c	PROD-001	Laptop Pro 15	Laptop de alta gama para desarrollo	1500.00	2.5	50	0	2026-02-06 05:35:50.068736	2026-02-06 05:35:50.068736
309e5bb9-afd0-486e-8a81-c4f0b1a4e924	PROD-002	Monitor 4K 27"	Monitor Ultra HD con panel IPS	400.00	5	30	0	2026-02-06 05:35:50.117717	2026-02-06 05:35:50.117717
d766b603-8ebc-4aa7-b8a0-2a4b9decc5a3	PROD-003	Teclado Mecánico RGB	Teclado con switches Cherry MX Blue	120.00	1.2	100	0	2026-02-06 05:35:50.139816	2026-02-06 05:35:50.139816
69565499-5cb7-44f8-91aa-74c37cb6b933	PROD-004	Mouse Inalámbrico Ergonómico	Mouse con sensor óptico de alta precisión	60.00	0.3	150	0	2026-02-06 05:35:50.160664	2026-02-06 05:35:50.160664
40aac6dd-cd57-4dce-af56-425e8cf3c598	PROD-005	Auriculares Noise Cancelling	Auriculares con cancelación activa de ruido	250.00	0.5	40	0	2026-02-06 05:35:50.184161	2026-02-06 05:35:50.184161
bdbe6018-9b62-4f36-bf54-e4a3219a1e45	PROD-006	Disco Duro Externo 2TB	Unidad de almacenamiento portátil USB 3.0	85.00	0.4	200	0	2026-02-06 05:35:50.201948	2026-02-06 05:35:50.201948
0a073042-4511-4853-9b74-11f02b95b4ae	PROD-007	Silla Ergonómica de Oficina	Silla con soporte lumbar ajustable	300.00	15	20	0	2026-02-06 05:35:50.230027	2026-02-06 05:35:50.230027
ee050a1c-4abe-4c5e-aeba-586338457f94	PROD-008	Escritorio Elevable Eléctrico	Escritorio con altura programable	550.00	25	10	0	2026-02-06 05:35:50.255152	2026-02-06 05:35:50.255152
8b77f88d-b050-4f3b-b7c1-76bf9ee6f1df	PROD-009	Cámara Web 1080p	Cámara para videoconferencias con micrófono	75.00	0.2	80	0	2026-02-06 05:35:50.274463	2026-02-06 05:35:50.274463
fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa	PROD-010	Adaptador USB-C Multiport	Hub con HDMI, USB-A y lector de tarjetas	45.00	0.1	118	68	2026-02-06 05:35:50.296997	2026-02-06 15:41:03.622059
\.


--
-- Data for Name: reservas_stock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservas_stock (id, "pedidoId", cantidad, estado, "expiraEn", "createdAt", "productoId") FROM stdin;
1cab62cc-334b-4061-99f1-1133e61ee7ab	50844928-afe2-4468-8a07-41f92a4f9080	2	PENDIENTE	2026-02-06 01:11:31.45	2026-02-06 05:41:30.484563	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
36fe55b4-e03c-4619-9ec5-89a131b72cb9	cc082b8e-4fef-4eb0-a031-36274a4641df	2	PENDIENTE	2026-02-06 01:20:22.883	2026-02-06 05:50:23.603579	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
6f948be6-49a3-47f6-8191-5468a881e07f	bc4a4968-4434-4687-a2b5-4bb5df1ed4ac	2	PENDIENTE	2026-02-06 01:23:54.735	2026-02-06 05:53:54.564262	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
ea8e1370-cedf-44c5-bed1-3165def63f7c	5a626b03-3623-46ae-aaf7-29f2ec6ab017	2	PENDIENTE	2026-02-06 01:28:19.239	2026-02-06 05:58:19.78212	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
40cf4f6d-1695-4ea4-9fc8-52acf5f5fb0a	09fe7c63-3399-42c8-b959-c8069472d476	2	PENDIENTE	2026-02-06 01:31:28.553	2026-02-06 06:01:28.669961	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
599b3ec9-1a77-4dd7-b3cb-c2be29c12af9	946f1865-9390-4788-bc91-6bb732711ba1	2	PENDIENTE	2026-02-06 01:34:02.709	2026-02-06 06:04:01.826843	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
eb310ed9-eb36-4744-89e4-d8aa521435ee	67f5f05f-2061-4b0b-82ef-6a3dd0e43b3f	2	PENDIENTE	2026-02-06 01:36:14.425	2026-02-06 06:06:14.81137	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
1272c558-9abc-4b1c-9785-62bf48262bc0	bd46c30f-3cc4-432f-915c-12f83ebfbb7e	2	PENDIENTE	2026-02-06 01:38:28.302	2026-02-06 06:08:28.255162	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
03b2da7e-d2bf-4d09-8087-7e1e467bf486	91909591-bb4b-4189-b778-6b077c480f3b	2	PENDIENTE	2026-02-06 01:45:41.337	2026-02-06 06:15:42.017559	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
7807349c-cb32-4aa0-b4c9-e4f17d403ee3	ade7d6af-6018-41b5-a862-7d7c6272a770	2	PENDIENTE	2026-02-06 01:45:41.352	2026-02-06 06:15:42.019783	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
a549a93d-f6a1-4e86-bb55-e27808c182e7	244e6fe5-8f11-4f4b-bb18-3258516dc980	2	PENDIENTE	2026-02-06 01:45:41.362	2026-02-06 06:15:42.025018	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
05783bf6-4a03-465a-85ee-50cc1bfaa65f	f50a12c3-fe5a-44bf-90ef-b7638edc142f	2	PENDIENTE	2026-02-06 01:48:40.878	2026-02-06 06:18:40.376166	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
9c8d51e7-e426-4d2f-8c3e-2a58d625c305	b7837ea9-41fb-4703-a3c0-30a400832c35	2	PENDIENTE	2026-02-06 01:52:32.706	2026-02-06 06:22:32.672474	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
3c71a6fe-080f-4d97-907b-a4eef79c3b09	6e89f225-77e2-4ec4-9b09-56eec60744ac	2	PENDIENTE	2026-02-06 01:58:47.904	2026-02-06 06:28:48.563686	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
7c94dfd9-42ee-40db-b0e4-7a329d4a6049	5f4f99c8-9005-44d0-aa95-d4b535b4de03	2	PENDIENTE	2026-02-06 02:01:34.465	2026-02-06 06:31:34.950561	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
652d2f24-30ba-49a2-b7d8-b31bcd3db331	98c5af96-64b3-49fa-8698-ce154727d75c	2	PENDIENTE	2026-02-06 02:09:58.228	2026-02-06 06:39:58.532971	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
f08c6f83-2c8f-45df-ae7a-9cb65200d05c	821ae350-ec63-4739-9ea4-43d1834870be	2	PENDIENTE	2026-02-06 02:11:25.501	2026-02-06 06:41:26.03061	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
fbdb81a2-04bf-4ed0-af01-ec68ba13e384	65395eb8-6325-4ae5-82a2-6c1e3f1b3166	2	PENDIENTE	2026-02-06 02:31:01.716	2026-02-06 07:01:01.947689	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
e0ca6070-43ae-4c02-9bf1-efca0fd8da31	c33b35ca-c256-4e59-bbec-2c3b2667d690	2	PENDIENTE	2026-02-06 02:34:21.201	2026-02-06 07:04:21.637188	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
a8c43fb3-1bb1-4437-8074-d17ca73b2f12	8ffb7bc4-8500-4309-8e11-bbc22700c896	2	PENDIENTE	2026-02-06 02:35:45.708	2026-02-06 07:05:46.174314	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
dff6619b-aaa8-4170-8720-d6feaebeb3f3	fa302326-9287-4434-b162-c8068329859c	2	PENDIENTE	2026-02-06 02:36:41.043	2026-02-06 07:06:41.455521	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
6a474d3d-4ec1-4c8b-98c9-2c1aabb6ea07	ca05ea5c-567f-4867-a105-7e1127a28136	2	PENDIENTE	2026-02-06 02:39:21.383	2026-02-06 07:09:21.22201	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
b6323bea-1c9c-40a5-beaf-79f151040fbb	6e981ea6-c578-4f7b-a510-c19c3d8d2a7c	2	PENDIENTE	2026-02-06 02:41:46.58	2026-02-06 07:11:46.765825	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
b66eed6d-3763-481e-bc7f-1e3458129ce6	b12fb7db-e3ac-4623-a68a-e7e70bde180c	2	PENDIENTE	2026-02-06 02:53:35.983	2026-02-06 07:23:36.604673	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
2cffe271-8b64-4615-b96d-d87935dcb2f4	da2713e0-31a0-4cd1-9337-66f822d027de	2	PENDIENTE	2026-02-06 02:55:39.228	2026-02-06 07:25:38.702999	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
134f7b6b-b7f1-4a83-9500-aa3dca683a36	b463212d-b08a-4b15-8141-bf48b26eef5b	2	PENDIENTE	2026-02-06 02:57:11.437	2026-02-06 07:27:11.436625	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
3ef5935e-ef88-4f0d-a11c-a9d056cec6b3	4db4b8d7-9326-490e-aa9d-bcf317ed8cdc	2	PENDIENTE	2026-02-06 03:01:38.116	2026-02-06 07:31:37.164891	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
247f2682-d669-4169-b7ba-06d5fb34a725	bb9af25e-65c9-4bd1-98cf-50f9408bafc7	2	PENDIENTE	2026-02-06 03:03:13.474	2026-02-06 07:33:13.261494	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
7f4add33-a171-47f2-938f-d8cfd8d4ead6	06df2f48-fec0-47bb-b03d-09d2b646bbb4	2	PENDIENTE	2026-02-06 03:05:28.954	2026-02-06 07:35:28.407409	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
cdbb7266-cbe2-4560-bf6d-fa8068c95d8b	67792f1e-41b7-4139-ac21-419b8cea7e64	2	PENDIENTE	2026-02-06 03:17:14.689	2026-02-06 07:47:14.373668	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
681d32f7-7751-4bcc-a426-9e2a01a1c6ee	bbfb233e-8fdf-4f5f-a7a2-4e6f7a7dc989	2	PENDIENTE	2026-02-06 03:19:36.663	2026-02-06 07:49:36.440876	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
ac782287-18bd-4d0b-9303-3262e957f085	f41d77d6-bd3f-4c5e-8873-6a2bfdcbb17b	2	PENDIENTE	2026-02-06 08:16:43.57	2026-02-06 12:46:43.512967	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
5a37c4c8-caa2-435f-9a9e-0ada2b8200fa	f7636e97-3cbb-4bd7-8a54-54809ed6034a	2	PENDIENTE	2026-02-06 08:20:48.263	2026-02-06 12:50:47.771469	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
32283d7b-ae6e-4415-840a-877c7a7989a1	4d008e42-2637-4850-b65a-749f61e0c464	2	PENDIENTE	2026-02-06 08:36:04.08	2026-02-06 13:06:04.014265	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
2fb22a4d-c224-43b4-9a31-572ad04253a4	03347542-5e75-49ab-a403-6df7d10a3556	2	CONFIRMADA	2026-02-06 03:06:47.803	2026-02-06 07:36:46.894177	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
e14d4911-f9c8-4a21-bf24-08a6533b23dd	ec872163-d2b5-4df2-b02d-777674010f9e	2	PENDIENTE	2026-02-06 09:23:01.464	2026-02-06 13:53:00.920962	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
0144cdca-fb16-47d3-ba4f-066064909532	e389c59c-cef9-4165-a4a5-b68df88e1e9c	2	PENDIENTE	2026-02-06 11:11:03.471	2026-02-06 15:41:03.622059	fe83e1f9-5a81-4cf1-b2a6-9932ee24b5aa
\.


--
-- Name: productos PK_04f604609a0949a7f3b43400766; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT "PK_04f604609a0949a7f3b43400766" PRIMARY KEY (id);


--
-- Name: reservas_stock PK_a73014603774a764d03c5f9ad3e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas_stock
    ADD CONSTRAINT "PK_a73014603774a764d03c5f9ad3e" PRIMARY KEY (id);


--
-- Name: productos UQ_805687bf24c1411756fbd37b2f3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT "UQ_805687bf24c1411756fbd37b2f3" UNIQUE (sku);


--
-- Name: reservas_stock FK_c85dc23b3d25c15b30832ba521a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas_stock
    ADD CONSTRAINT "FK_c85dc23b3d25c15b30832ba521a" FOREIGN KEY ("productoId") REFERENCES public.productos(id);


--
-- PostgreSQL database dump complete
--

\unrestrict ZP5EvUKg9jNqyfihHdwvCHbea1xgDNYfJwoqHFyb3UQjWL0VLjChFzygIjvluM8

