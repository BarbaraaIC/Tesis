--
-- PostgreSQL database dump
--

\restrict zAcD47DlHbPhd6A2kf00EUEV72eNABxS1QqCSNTQAlsCIAmRXwHExnrSreU0ihb

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

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
    ocupacion text NOT NULL,
    fecha_nacimiento date
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
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: usuario_tesis
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: usuario_tesis
--

COPY public.usuarios (id_usuario, rut, nombre, apellido, edad, direccion, telefono, correo, password, rol, enfermedades, medicamentos, ocupacion, fecha_nacimiento) FROM stdin;
1	12.345.678-9	Administrador	Sistema	30	Dirección por defecto	+56912345678	admin@gmail.com	$2b$10$wJFcXHz4S3z6taoyrUDM4udyI6MPk.aXXBBX83lXSEj4xQSBsCdKO	administrador	\N	\N	Administrador	\N
2	21.597.438-3	Bárbara	Inostroza	22	Los Ángeles	+56992778355	barbara.inostroza@gmail.com	$2b$10$9Q4/2d9B/BsuvRFKuLpYUOLf53s2jwBq4PioSI3lfxFv8dr/spv9q	paciente	\N	\N	Estudiante	\N
3	21.345.341-1	Antonia	Carrasco	25	Concepción	+56992441235	antonia.inostroza@gmail.com	$2b$10$rhV6A5vE4hC8c1pCET3dnudwVKNVl7w5.um0IrZxAJ5GiZ2LxhK56	profesional	\N	\N	Profesional salud	\N
4	21.345.342-1	Kira	Carrasco	40	MI casa	+56993323203	kiracarrasco@gmail.com	$2b$10$JoZDEh7me0gABbEgsfLOrO1WcHPLtxlnr26GP17MojKSO2k/McPDu	profesional	\N	\N	Profesional salud	\N
5	11.111.111-1	Prueba	Dehoy	20	mi casa	+56992111111	pruebadehoy@gmail.com	$2b$10$Kb0WdVGoycSlY1/vj1ruXud4z8xPq8M8xacO5fWCu.iNwl6mXRvW.	profesional	\N	\N	Estudiante	\N
6	24.213.456-7	Prueba	Morita	22	mi casa	+56992115350	pruebamorita@gmail.com	$2b$10$VE0D9YlbvB45sRW/D7srZOpZy7r57x1k8erQT/nM2nWbGQ5NYDWby	paciente	\N	\N	Estudiante	\N
\.


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: usuario_tesis
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 6, true);


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
-- PostgreSQL database dump complete
--

\unrestrict zAcD47DlHbPhd6A2kf00EUEV72eNABxS1QqCSNTQAlsCIAmRXwHExnrSreU0ihb

