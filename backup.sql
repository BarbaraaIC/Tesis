--
-- PostgreSQL database dump
--

\restrict hlIiTbygUeYHlHM4TeOOlWCKkKSXrGq4fDXBjre7XbG6J7kHiV5VcneevWMseoQ

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg13+1)
-- Dumped by pg_dump version 16.13 (Debian 16.13-1.pgdg13+1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: reservas; Type: TABLE; Schema: public; Owner: usuario_tesis
--

CREATE TABLE public.reservas (
    cod_reserva integer NOT NULL,
    dia date NOT NULL,
    hora time(0) without time zone NOT NULL,
    tiempo_estimado time(0) without time zone NOT NULL,
    id_asignacion integer NOT NULL
);


ALTER TABLE public.reservas OWNER TO usuario_tesis;

--
-- Name: reservas_cod_reserva_seq; Type: SEQUENCE; Schema: public; Owner: usuario_tesis
--

CREATE SEQUENCE public.reservas_cod_reserva_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservas_cod_reserva_seq OWNER TO usuario_tesis;

--
-- Name: reservas_cod_reserva_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: usuario_tesis
--

ALTER SEQUENCE public.reservas_cod_reserva_seq OWNED BY public.reservas.cod_reserva;


--
-- Name: servicios; Type: TABLE; Schema: public; Owner: usuario_tesis
--

CREATE TABLE public.servicios (
    id_servicio integer NOT NULL,
    tipo_servicio text NOT NULL,
    descripcion text NOT NULL
);


ALTER TABLE public.servicios OWNER TO usuario_tesis;

--
-- Name: servicios_id_servicio_seq; Type: SEQUENCE; Schema: public; Owner: usuario_tesis
--

CREATE SEQUENCE public.servicios_id_servicio_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.servicios_id_servicio_seq OWNER TO usuario_tesis;

--
-- Name: servicios_id_servicio_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: usuario_tesis
--

ALTER SEQUENCE public.servicios_id_servicio_seq OWNED BY public.servicios.id_servicio;


--
-- Name: tratamientos; Type: TABLE; Schema: public; Owner: usuario_tesis
--

CREATE TABLE public.tratamientos (
    cod_tratamiento integer NOT NULL,
    costo integer NOT NULL,
    descripcion text NOT NULL,
    id_servicio integer NOT NULL
);


ALTER TABLE public.tratamientos OWNER TO usuario_tesis;

--
-- Name: tratamientos_asignados; Type: TABLE; Schema: public; Owner: usuario_tesis
--

CREATE TABLE public.tratamientos_asignados (
    id_asignacion integer NOT NULL,
    fecha_asignacion date NOT NULL,
    estado_actual text NOT NULL,
    observaciones text,
    id_usuario integer NOT NULL,
    cod_tratamiento integer NOT NULL,
    id_profesional integer NOT NULL
);


ALTER TABLE public.tratamientos_asignados OWNER TO usuario_tesis;

--
-- Name: tratamientos_asignados_id_asignacion_seq; Type: SEQUENCE; Schema: public; Owner: usuario_tesis
--

CREATE SEQUENCE public.tratamientos_asignados_id_asignacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tratamientos_asignados_id_asignacion_seq OWNER TO usuario_tesis;

--
-- Name: tratamientos_asignados_id_asignacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: usuario_tesis
--

ALTER SEQUENCE public.tratamientos_asignados_id_asignacion_seq OWNED BY public.tratamientos_asignados.id_asignacion;


--
-- Name: tratamientos_cod_tratamiento_seq; Type: SEQUENCE; Schema: public; Owner: usuario_tesis
--

CREATE SEQUENCE public.tratamientos_cod_tratamiento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tratamientos_cod_tratamiento_seq OWNER TO usuario_tesis;

--
-- Name: tratamientos_cod_tratamiento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: usuario_tesis
--

ALTER SEQUENCE public.tratamientos_cod_tratamiento_seq OWNED BY public.tratamientos.cod_tratamiento;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: usuario_tesis
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    rut text NOT NULL,
    nombre text NOT NULL,
    apellido text NOT NULL,
    edad integer NOT NULL,
    direccion text NOT NULL,
    telefono text NOT NULL,
    correo text NOT NULL,
    password text NOT NULL,
    rol text DEFAULT 'paciente'::text NOT NULL,
    enfermedades text,
    medicamentos text,
    ocupacion text NOT NULL
);


ALTER TABLE public.usuarios OWNER TO usuario_tesis;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: usuario_tesis
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_usuario_seq OWNER TO usuario_tesis;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: usuario_tesis
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- Name: reservas cod_reserva; Type: DEFAULT; Schema: public; Owner: usuario_tesis
--

ALTER TABLE ONLY public.reservas ALTER COLUMN cod_reserva SET DEFAULT nextval('public.reservas_cod_reserva_seq'::regclass);


--
-- Name: servicios id_servicio; Type: DEFAULT; Schema: public; Owner: usuario_tesis
--

ALTER TABLE ONLY public.servicios ALTER COLUMN id_servicio SET DEFAULT nextval('public.servicios_id_servicio_seq'::regclass);


--
-- Name: tratamientos cod_tratamiento; Type: DEFAULT; Schema: public; Owner: usuario_tesis
--

ALTER TABLE ONLY public.tratamientos ALTER COLUMN cod_tratamiento SET DEFAULT nextval('public.tratamientos_cod_tratamiento_seq'::regclass);


--
-- Name: tratamientos_asignados id_asignacion; Type: DEFAULT; Schema: public; Owner: usuario_tesis
--

ALTER TABLE ONLY public.tratamientos_asignados ALTER COLUMN id_asignacion SET DEFAULT nextval('public.tratamientos_asignados_id_asignacion_seq'::regclass);


--
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: usuario_tesis
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- Data for Name: reservas; Type: TABLE DATA; Schema: public; Owner: usuario_tesis
--

COPY public.reservas (cod_reserva, dia, hora, tiempo_estimado, id_asignacion) FROM stdin;
\.


--
-- Data for Name: servicios; Type: TABLE DATA; Schema: public; Owner: usuario_tesis
--

COPY public.servicios (id_servicio, tipo_servicio, descripcion) FROM stdin;
2	Corte de cabello	Corte classico para dama
\.


--
-- Data for Name: tratamientos; Type: TABLE DATA; Schema: public; Owner: usuario_tesis
--

COPY public.tratamientos (cod_tratamiento, costo, descripcion, id_servicio) FROM stdin;
\.


--
-- Data for Name: tratamientos_asignados; Type: TABLE DATA; Schema: public; Owner: usuario_tesis
--

COPY public.tratamientos_asignados (id_asignacion, fecha_asignacion, estado_actual, observaciones, id_usuario, cod_tratamiento, id_profesional) FROM stdin;
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: usuario_tesis
--

COPY public.usuarios (id_usuario, rut, nombre, apellido, edad, direccion, telefono, correo, password, rol, enfermedades, medicamentos, ocupacion) FROM stdin;
1	12.345.678-2	Bárbara	inostroza	28	Av. Siempre Viva 742, Los Ángeles	+56987654321	barbara.inostroza@gmail.com	$2b$10$leTsCZMYp22QlY5U7mgGmeW7ZzKgVq3dZGKVs1z4/ehoSoZzhN1M2	paciente	\N	\N	Ingeniera
2	11.467.356-3	juanita	inostroza	20	av juanita	+56992653821	juanita@gmail.com	$2b$10$UZbI10pZ5AEIJZg7ckXncunAWvXz24NfwA8xsOXRF7gVBaKelyJOi	paciente	\N	\N	ama de casa
3	55.453.392-1	kira	inostroza	30	kiralandia	+56934353581	kira@gmail.com	$2b$10$XUD/wi3faIhj8skNQfWBHe6GGuSFve.Y1D824XOYb6ZoGsoQcTtaW	paciente	\N	\N	maullar
4	34.256.261-1	kira	carrasco	35	kiralandia	+56928402583	kiraa@gmail.com	$2b$10$jslQtnSn9PHFeEk/xHZodeXKYB7t4.UdqvbAAcxv1bwB2HTbfmmW2	paciente	\N	\N	ama de casa
5	25.366.367-2	Kira	Carrasco	40	av mi casa	+56934953648	kiracarrasco@gmail.com	$2b$10$/hG/AmaSK3YrwY9SKExPVOWvb.nBI0WrxOJGBOymY8YqV5xZJ7e7a	paciente	\N	\N	gata de casa
6	11.111.111-1	Administrador	Prinicipal	30	Secreta	+56911111111	administrador@gmail.com	$2b$10$lC1oaCol2CI9B/GnbPK2eeNgznK5FuUZbzyfE2yKs0kD3uQGcAw.O	administrador	\N	\N	Administrador
7	12.456.307-2	Bárbara	Mesa	21	mi casa 123	+56992483411	barbaramesa@gmail.com	$2b$10$8BeNhd9Y.enS0NroMYAmm.PL8Xjj/zH2CaVDPHgiDtCn4uf.mE5Jq	paciente	\N	\N	estudiante
\.


--
-- Name: reservas_cod_reserva_seq; Type: SEQUENCE SET; Schema: public; Owner: usuario_tesis
--

SELECT pg_catalog.setval('public.reservas_cod_reserva_seq', 1, false);


--
-- Name: servicios_id_servicio_seq; Type: SEQUENCE SET; Schema: public; Owner: usuario_tesis
--

SELECT pg_catalog.setval('public.servicios_id_servicio_seq', 3, true);


--
-- Name: tratamientos_asignados_id_asignacion_seq; Type: SEQUENCE SET; Schema: public; Owner: usuario_tesis
--

SELECT pg_catalog.setval('public.tratamientos_asignados_id_asignacion_seq', 1, false);


--
-- Name: tratamientos_cod_tratamiento_seq; Type: SEQUENCE SET; Schema: public; Owner: usuario_tesis
--

SELECT pg_catalog.setval('public.tratamientos_cod_tratamiento_seq', 1, false);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: usuario_tesis
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 7, true);


--
-- Name: reservas reservas_pkey; Type: CONSTRAINT; Schema: public; Owner: usuario_tesis
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_pkey PRIMARY KEY (cod_reserva);


--
-- Name: servicios servicios_pkey; Type: CONSTRAINT; Schema: public; Owner: usuario_tesis
--

ALTER TABLE ONLY public.servicios
    ADD CONSTRAINT servicios_pkey PRIMARY KEY (id_servicio);


--
-- Name: tratamientos_asignados tratamientos_asignados_pkey; Type: CONSTRAINT; Schema: public; Owner: usuario_tesis
--

ALTER TABLE ONLY public.tratamientos_asignados
    ADD CONSTRAINT tratamientos_asignados_pkey PRIMARY KEY (id_asignacion);


--
-- Name: tratamientos tratamientos_pkey; Type: CONSTRAINT; Schema: public; Owner: usuario_tesis
--

ALTER TABLE ONLY public.tratamientos
    ADD CONSTRAINT tratamientos_pkey PRIMARY KEY (cod_tratamiento);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: usuario_tesis
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- Name: usuarios_correo_key; Type: INDEX; Schema: public; Owner: usuario_tesis
--

CREATE UNIQUE INDEX usuarios_correo_key ON public.usuarios USING btree (correo);


--
-- Name: usuarios_rut_key; Type: INDEX; Schema: public; Owner: usuario_tesis
--

CREATE UNIQUE INDEX usuarios_rut_key ON public.usuarios USING btree (rut);


--
-- Name: reservas reservas_id_asignacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: usuario_tesis
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_id_asignacion_fkey FOREIGN KEY (id_asignacion) REFERENCES public.tratamientos_asignados(id_asignacion) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tratamientos_asignados tratamientos_asignados_cod_tratamiento_fkey; Type: FK CONSTRAINT; Schema: public; Owner: usuario_tesis
--

ALTER TABLE ONLY public.tratamientos_asignados
    ADD CONSTRAINT tratamientos_asignados_cod_tratamiento_fkey FOREIGN KEY (cod_tratamiento) REFERENCES public.tratamientos(cod_tratamiento) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tratamientos_asignados tratamientos_asignados_id_profesional_fkey; Type: FK CONSTRAINT; Schema: public; Owner: usuario_tesis
--

ALTER TABLE ONLY public.tratamientos_asignados
    ADD CONSTRAINT tratamientos_asignados_id_profesional_fkey FOREIGN KEY (id_profesional) REFERENCES public.usuarios(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tratamientos_asignados tratamientos_asignados_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: usuario_tesis
--

ALTER TABLE ONLY public.tratamientos_asignados
    ADD CONSTRAINT tratamientos_asignados_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tratamientos tratamientos_id_servicio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: usuario_tesis
--

ALTER TABLE ONLY public.tratamientos
    ADD CONSTRAINT tratamientos_id_servicio_fkey FOREIGN KEY (id_servicio) REFERENCES public.servicios(id_servicio) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict hlIiTbygUeYHlHM4TeOOlWCKkKSXrGq4fDXBjre7XbG6J7kHiV5VcneevWMseoQ

