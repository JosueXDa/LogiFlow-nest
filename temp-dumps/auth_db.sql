--
-- PostgreSQL database dump
--

\restrict wp1pQMAaAanEBwAWMvZcVPKQuOC7uqw4hsEf2wu5NwtD5bp3A3DkQmSeK9oVyWI

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

ALTER TABLE IF EXISTS ONLY public.account DROP CONSTRAINT IF EXISTS "FK_60328bf27019ff5498c4b977421";
ALTER TABLE IF EXISTS ONLY public.session DROP CONSTRAINT IF EXISTS "FK_3d2f174ef04fb312fdebd0ddc53";
ALTER TABLE IF EXISTS ONLY public."user" DROP CONSTRAINT IF EXISTS "UQ_e12875dfb3b1d92d7d7c5377e22";
ALTER TABLE IF EXISTS ONLY public.session DROP CONSTRAINT IF EXISTS "UQ_232f8e85d7633bd6ddfad421696";
ALTER TABLE IF EXISTS ONLY public.verification DROP CONSTRAINT IF EXISTS "PK_f7e3a90ca384e71d6e2e93bb340";
ALTER TABLE IF EXISTS ONLY public.session DROP CONSTRAINT IF EXISTS "PK_f55da76ac1c3ac420f444d2ff11";
ALTER TABLE IF EXISTS ONLY public."user" DROP CONSTRAINT IF EXISTS "PK_cace4a159ff9f2512dd42373760";
ALTER TABLE IF EXISTS ONLY public.account DROP CONSTRAINT IF EXISTS "PK_54115ee388cdb6d86bb4bf5b2ea";
DROP TABLE IF EXISTS public.verification;
DROP TABLE IF EXISTS public."user";
DROP TABLE IF EXISTS public.session;
DROP TABLE IF EXISTS public.account;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account (
    id text NOT NULL,
    "userId" text NOT NULL,
    "accountId" character varying(255) NOT NULL,
    "providerId" character varying(100) NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "accessTokenExpiresAt" timestamp without time zone,
    "refreshTokenExpiresAt" timestamp without time zone,
    scope character varying(500),
    "idToken" text,
    password character varying(255),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.account OWNER TO postgres;

--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    id text NOT NULL,
    "userId" text NOT NULL,
    token character varying(500) NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    "ipAddress" character varying(100),
    "userAgent" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id text NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    image character varying(500),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    role text
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: verification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verification (
    id text NOT NULL,
    identifier character varying(255) NOT NULL,
    value character varying(255) NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.verification OWNER TO postgres;

--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.account (id, "userId", "accountId", "providerId", "accessToken", "refreshToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, "idToken", password, "createdAt", "updatedAt") FROM stdin;
HeUddE0Cv0tV0PKtvNC8n8BJeAFVjVAk	362T3wvHsee0qJOLRUwxso46zjalPNi3	362T3wvHsee0qJOLRUwxso46zjalPNi3	credential	\N	\N	\N	\N	\N	\N	42b3f4892aff2203fb7d2603b358690d:f8acf4239be453f4fc843a236d9264e0a1cd9ed6daacf43fe10e660be92b98145422372453df1ebc2b21eeb2db1a15e877201b55d1dfc574e22e319299a38cfa	2026-02-06 00:04:27.888	2026-02-06 00:04:27.888
1gaYPFi7tLevpMiZ0Uvg9oNHtwkYGLo9	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	credential	\N	\N	\N	\N	\N	\N	c2557576ea2c54c233f75b5110ad07c2:9306dca8259fe3eb6dd06874733ed151563de976bddaa61a6152f63e9b029011094f73c420bd8a16b1d8b933acf5100111b91ba7f406dd414279cac487b85f66	2026-02-06 00:05:03.518	2026-02-06 00:05:03.518
cIoyRxHK9GFVQGsI2Ew6Cs7vrpKO5iF9	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	credential	\N	\N	\N	\N	\N	\N	7032a8940c68a90896b8f2127a6af187:228cac1b641178641a7b747a3c34ecc4d9431739fab3d5399ca1e3350cda9104afaedebb18c099f4335173c6b5393b9c47112c779b906321ae13f16a7858f7bb	2026-02-06 00:40:48.372	2026-02-06 00:40:48.372
uBRlCFlsT3pmGgH1b7mqU1tgAsBvCMmm	CRfbKYEaBQp81ELKRquS8cy80EaE06aj	CRfbKYEaBQp81ELKRquS8cy80EaE06aj	credential	\N	\N	\N	\N	\N	\N	fa500e786ec150810f455cc7e187abb9:3533818e2da6b946ec8c404910f431969ce31e02133750f4dddfc0498b42fe7a0ec1b9748f12d42c52056fb6ac57bcad2bc855eb14cfd81a6588d69f1e6ce80d	2026-02-06 10:36:07.379	2026-02-06 10:36:07.379
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (id, "userId", token, "expiresAt", "ipAddress", "userAgent", "createdAt", "updatedAt") FROM stdin;
GeONizUc9tu0HYePzcHDqmJOrzFDAf2m	362T3wvHsee0qJOLRUwxso46zjalPNi3	bVo04z29ZPbGjjhLf6PYYCDKVYxlKpZF	2026-02-13 00:04:27.897		PostmanRuntime/7.39.1	2026-02-06 00:04:27.897	2026-02-06 00:04:27.897
RT8HxQHW3qvNv4ZIDV9LF7Yh9pAwH55t	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	HeYBrnXRuXdtCeYfA8qzOmkZUcywnoGi	2026-02-13 00:05:03.522		node	2026-02-06 00:05:03.522	2026-02-06 00:05:03.522
yeBiuJ14qe4mzhvW5UNg8apQtEmFGex4	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	HpKmA63V8x9WPLZz7fCNnQFyino6F6mL	2026-02-13 00:05:03.637		node	2026-02-06 00:05:03.637	2026-02-06 00:05:03.637
TWY6JiGBhvgkS7E7GJgq9HBmNnmmHYoR	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	PkrbwJsHRnEQdW7hQo0FfgP3SWkOinEV	2026-02-13 00:05:28.553		node	2026-02-06 00:05:28.553	2026-02-06 00:05:28.553
DngpbaJ4e1CiijtlO2p8ry8CMOATu1ux	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	7HuaXep9Mb8Q20uBzwdaiG3WaI7peKUn	2026-02-13 00:07:15.388		node	2026-02-06 00:07:15.388	2026-02-06 00:07:15.388
oHqN7B41vLa5Fn0rmDtG4OBT5VqO8MiG	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	28BMCWRAyae9Yn2ON8um33BUzh74yxAg	2026-02-13 00:12:44.064		node	2026-02-06 00:12:44.064	2026-02-06 00:12:44.065
Zl9uZMwG0t1XlpSzvRPyU3aHsVGHwEJc	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	tGrRHooE5tP8cRVQHVp9v7H9yepRWEfG	2026-02-13 00:16:02.919		node	2026-02-06 00:16:02.919	2026-02-06 00:16:02.919
Ap6kcuZXu1h9UeXxHRUZ46kM1FVENwlU	362T3wvHsee0qJOLRUwxso46zjalPNi3	QTKP7DQAI26d2VxQpN5hJ7TNbjOUXt5K	2026-02-13 00:19:09.456		PostmanRuntime/7.39.1	2026-02-06 00:19:09.456	2026-02-06 00:19:09.456
2YGKAgt95rUm0Xo6XlmWwXbG3rAPN4nc	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	lvzjtSNUrDzYCEj6dvSBg7EGMrWB7VWA	2026-02-13 00:19:26.638		node	2026-02-06 00:19:26.638	2026-02-06 00:19:26.638
v3RK6exkVlFrgTc3YbRAYPacQUDgxzT7	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	VS8yM5nPaasU723pvCvGLlapUnMvZ2YS	2026-02-13 00:22:41.781		node	2026-02-06 00:22:41.781	2026-02-06 00:22:41.781
bK9LQggLPZOPDRcL2PSnHaEKj42tcKhK	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	7Je65YqRWoqrVTtHcyxIPyqhQYthc2D8	2026-02-13 00:29:19.504		node	2026-02-06 00:29:19.504	2026-02-06 00:29:19.504
EhjuXoZcm9oGVQP16T91uL1tS287WxNS	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	BHHTpqIkXobSq4CwwuNpFJdw1UlnLaGp	2026-02-13 00:32:22.15		node	2026-02-06 00:32:22.15	2026-02-06 00:32:22.15
U6UffSfqCsMDuYdYx3YToikdSAFt95TP	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	lruEjXTRGtmhnkf7kQpXx8sEzPwXLrlp	2026-02-13 00:33:48.917		node	2026-02-06 00:33:48.917	2026-02-06 00:33:48.917
tSWHQnnSuhGdrqpewR2EvjoyGsyHz04f	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	xwPP1ZUfzUbfi5L6wTpOP7s8ZtWcE0B8	2026-02-13 00:34:21.461		node	2026-02-06 00:34:21.461	2026-02-06 00:34:21.461
JfWIdFoE0oR0PPwm6c2S6BMeU0KSEX9j	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	dGTNHmoFJKZ126OtTRRqpp2LgmNSXrLA	2026-02-13 00:34:38.622		node	2026-02-06 00:34:38.622	2026-02-06 00:34:38.622
xFMMTjiucThkpGkrRRycy38bF27HW944	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	ya48IeJIJcb2gdcOZdeYEPVCDevHxLX1	2026-02-13 00:35:49.347		node	2026-02-06 00:35:49.347	2026-02-06 00:35:49.347
TTwTIzvSX9xUKCJL2BO8OMNE94HVa11v	RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Ia0V1Sc0jbgYR9XBssiTnAjBjoRKkUaE	2026-02-13 00:40:48.38		PostmanRuntime/7.39.1	2026-02-06 00:40:48.38	2026-02-06 00:40:48.38
f7mcYwi2SaDs5LPGvEafGjbmMULTQP8b	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	QPYdSxIHiMhoaeZmbENoIxvjvbKVAhAL	2026-02-13 02:06:27.57		node	2026-02-06 02:06:27.57	2026-02-06 02:06:27.57
F6R8uTWNWDpc0BU7q7U1c1YPXLiEepf1	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	P40lYaoKZ2Drjcji8koQ6f1DiFiL7wK6	2026-02-13 02:10:41.872		node	2026-02-06 02:10:41.872	2026-02-06 02:10:41.872
jkgkJ2JFG55CgeFHQC43CXg4bsIEedUE	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	I07FTaJBTQpnnrOzLiyBZEwvArHT3O7i	2026-02-13 02:11:02.798		node	2026-02-06 02:11:02.798	2026-02-06 02:11:02.798
ZowGJkrHnUmv6Lx1hpoEvorGjwBMBRfM	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	UQgnT4YhvYNMq7zfnqfAoWl4NMCqkidL	2026-02-13 02:11:17.394		node	2026-02-06 02:11:17.394	2026-02-06 02:11:17.394
OOAjTbbIe4bNOkfMKQtmf35yEoguR9br	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	KrQfmawgIHzGkzGdYEomJ7ALDINfuw0b	2026-02-13 02:11:33.94		node	2026-02-06 02:11:33.94	2026-02-06 02:11:33.94
xQPNVwZkp4p8eDkWuCoH8jA0IWVzJxoX	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	nUKwzew1Fn7GqxJH7UdYWDz5eXjj06VO	2026-02-13 02:12:44.149		node	2026-02-06 02:12:44.149	2026-02-06 02:12:44.149
6mXTP3wxqEQ59cjwdx3IBhbtXyA0pXqm	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	P63WiV8d9ALEP1vw9mqpJe3wfeJru9uH	2026-02-13 02:22:23.054		node	2026-02-06 02:22:23.055	2026-02-06 02:22:23.055
LUT5WVamdjmVgS21QO9KpDax9Y1skxwo	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	BD9yKCaYBE0xAfH94L97psezgcDFXLWm	2026-02-13 02:32:51.91		node	2026-02-06 02:32:51.911	2026-02-06 02:32:51.911
8rxeWmz6BEzWjv7yyuppV2IpRImkqD5u	362T3wvHsee0qJOLRUwxso46zjalPNi3	OdGdSaFDygD4GTbzm4PcRZGeTEeq5F1b	2026-02-13 02:36:39.7		PostmanRuntime/7.39.1	2026-02-06 02:36:39.7	2026-02-06 02:36:39.7
XYwndlLtBpU2jXFeHV8XFvkKDmiTULoS	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	Q0kmdxBkfawhBASiXTuOipf7wRkYZX9r	2026-02-13 07:53:59.639		node	2026-02-06 07:53:59.639	2026-02-06 07:53:59.639
bS1thdtGkS2JyYUWsnSnFB9HqBfH4gpw	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	YzlnCvHo4yR57xo6koBdudtH6XNbBmTE	2026-02-13 07:55:20.208		node	2026-02-06 07:55:20.208	2026-02-06 07:55:20.208
mFkd9vdmOxjv80FIcqAUeZh5v7vLy233	362T3wvHsee0qJOLRUwxso46zjalPNi3	J4a75DlXHwhRt90E7Y63G6dOuSqNX6pM	2026-02-13 09:37:31.674		PostmanRuntime/7.39.1	2026-02-06 09:37:31.674	2026-02-06 09:37:31.674
ixrLKFvDYDEjw4RtnA4Sqv4QB3lCHRLp	zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	d78yw6fMZD5jzdFr6BQq8BTHyYDmUrtg	2026-02-13 09:53:24.71		node	2026-02-06 09:53:24.71	2026-02-06 09:53:24.71
xXL2YoFUkGuGFSNsyAm5V2pHLlUIFf5v	362T3wvHsee0qJOLRUwxso46zjalPNi3	udeOgQwbvgNyrHIdckPLxb6NulPHhjFG	2026-02-13 10:33:25.512		PostmanRuntime/7.39.1	2026-02-06 10:33:25.513	2026-02-06 10:33:25.513
rlkxZrVLMIetRpsKQZNA1dtxO4BWi0MF	362T3wvHsee0qJOLRUwxso46zjalPNi3	ARsIAzlSyANCsTnMWaXznixbsoJ2vWQH	2026-02-13 10:35:56.022		PostmanRuntime/7.39.1	2026-02-06 10:35:56.022	2026-02-06 10:35:56.022
cJ9SdCpz7nMB5uc6WIaKEaX21Gqnb8DW	CRfbKYEaBQp81ELKRquS8cy80EaE06aj	5fwdP5cwJNRr3wXpEv94sfqcq6Pox6ps	2026-02-15 11:20:05.978		PostmanRuntime/7.39.1	2026-02-06 10:36:07.386	2026-02-08 11:20:05.978
emOBCmsUtINP3c7NOyUOPNNO8DQpK72J	362T3wvHsee0qJOLRUwxso46zjalPNi3	oaSwkGisPJaZOETAkQZgXLD5dIigN8Vp	2026-02-15 11:20:37.095		PostmanRuntime/7.39.1	2026-02-08 11:20:37.095	2026-02-08 11:20:37.095
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", role) FROM stdin;
362T3wvHsee0qJOLRUwxso46zjalPNi3	Pedro Admin	admin@test.com	f	\N	2026-02-06 00:04:27.878	2026-02-06 00:04:27.878	ADMIN
zwVtKhFDFlAKRCkKuzxpGtZ1E5VOuBbn	Admin Sistema	admin@logiflow.com	f	\N	2026-02-06 00:05:03.513	2026-02-06 00:05:03.513	ADMIN
RtMopnkn4sLVOZvkOAWXMP1SQpC3coOz	Juan Pérez	juan.perez@example2.com	f	\N	2026-02-06 00:40:48.366	2026-02-06 00:40:48.366	cliente
CRfbKYEaBQp81ELKRquS8cy80EaE06aj	Carlos Repartidor	repartidor@test.com	f	\N	2026-02-06 10:36:07.36	2026-02-06 10:36:07.36	REPARTIDOR
\.


--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification (id, identifier, value, "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: account PK_54115ee388cdb6d86bb4bf5b2ea; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: session PK_f55da76ac1c3ac420f444d2ff11; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY (id);


--
-- Name: verification PK_f7e3a90ca384e71d6e2e93bb340; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT "PK_f7e3a90ca384e71d6e2e93bb340" PRIMARY KEY (id);


--
-- Name: session UQ_232f8e85d7633bd6ddfad421696; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "UQ_232f8e85d7633bd6ddfad421696" UNIQUE (token);


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- Name: session FK_3d2f174ef04fb312fdebd0ddc53; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: account FK_60328bf27019ff5498c4b977421; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "FK_60328bf27019ff5498c4b977421" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict wp1pQMAaAanEBwAWMvZcVPKQuOC7uqw4hsEf2wu5NwtD5bp3A3DkQmSeK9oVyWI

