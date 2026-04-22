-- PowerBI Operaciones -> PostgreSQL/Supabase migration proposal
-- Generated from workbook analysis of: Tablas Dash Operaciones.xlsx
-- Goal: normalize entities, preserve dashboard facts, and prepare for role-based access + RLS.

begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

-- =========================================================
-- 1) CORE CATALOGS
-- =========================================================

create table if not exists cat_community (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cat_zone (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  sort_order int,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cat_institution_type (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cat_job_title (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cat_shift (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  starts_at time,
  ends_at time,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cat_person_type (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cat_assignment_status (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  sort_order int,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cat_incident_severity (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  severity_rank int not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cat_incident_status (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  sort_order int,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cat_incident_type (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cat_event_type (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cat_access_mode (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cat_access_resolution (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  sort_order int,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cat_training_type (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cat_training_category (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cat_training_competency (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cat_attendance_status (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  sort_order int,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists cat_panic_status (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 2) SECURITY / APP ROLES / RLS SCOPE FOUNDATION
-- =========================================================

create table if not exists app_role (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists app_user (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email citext unique,
  full_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists app_user_role (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_user(id) on delete cascade,
  role_id uuid not null references app_role(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (user_id, role_id)
);

-- Granular scope tables so one role can be restricted by zone/community/institution.
create table if not exists app_user_zone_scope (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_user(id) on delete cascade,
  zone_id uuid not null references cat_zone(id) on delete cascade,
  unique (user_id, zone_id)
);

create table if not exists app_user_community_scope (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_user(id) on delete cascade,
  community_id uuid not null references cat_community(id) on delete cascade,
  unique (user_id, community_id)
);

create table if not exists app_user_institution_scope (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_user(id) on delete cascade,
  institution_id uuid,
  unique (user_id, institution_id)
);

-- =========================================================
-- 3) MASTER DATA
-- =========================================================

create table if not exists institution (
  id uuid primary key default gen_random_uuid(),
  legacy_seq int,
  legacy_key text,
  legacy_id text,
  name text not null,
  alias_1 text,
  alias_2 text,
  address text,
  colony text,
  community_id uuid references cat_community(id),
  zone_id uuid references cat_zone(id),
  institution_type_id uuid references cat_institution_type(id),
  jefe_zona_code text,
  kabat_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (legacy_key),
  unique (legacy_id)
);

alter table app_user_institution_scope
  add constraint fk_app_user_institution_scope_institution
  foreign key (institution_id) references institution(id) on delete cascade;

create table if not exists institution_alias (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references institution(id) on delete cascade,
  alias_text text not null,
  alias_normalized text generated always as (lower(trim(alias_text))) stored,
  source text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (institution_id, alias_text)
);

create unique index if not exists idx_institution_alias_normalized_unique
  on institution_alias(alias_normalized);

create table if not exists person (
  id uuid primary key default gen_random_uuid(),
  legacy_person_id text unique,
  first_name text,
  last_name_paternal text,
  last_name_maternal text,
  full_name text not null,
  person_type_id uuid references cat_person_type(id),
  is_active boolean not null default true,
  is_certified_instructor boolean,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists person_alias (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references person(id) on delete cascade,
  alias_text text not null,
  alias_normalized text generated always as (lower(trim(alias_text))) stored,
  source text,
  method text,
  exact_match boolean,
  created_at timestamptz not null default now(),
  unique (person_id, alias_text)
);

create index if not exists idx_person_alias_normalized on person_alias(alias_normalized);

create table if not exists person_role_assignment (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references person(id) on delete cascade,
  role_id uuid not null references cat_job_title(id) on delete restrict,
  is_primary boolean not null default false,
  source text,
  created_at timestamptz not null default now(),
  unique (person_id, role_id)
);

create table if not exists person_institution_assignment (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references person(id) on delete cascade,
  institution_id uuid references institution(id) on delete set null,
  department_name text,
  source text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 4) FACT TABLES / OPERATIONAL DATA
-- =========================================================

create table if not exists incident (
  id uuid primary key default gen_random_uuid(),
  legacy_sicas_id text unique,
  incident_date date not null,
  institution_id uuid references institution(id) on delete set null,
  raw_location text,
  zone_id uuid references cat_zone(id) on delete set null,
  reported_by text,
  shift_id uuid references cat_shift(id) on delete set null,
  severity_id uuid references cat_incident_severity(id) on delete set null,
  incident_type_id uuid references cat_incident_type(id) on delete set null,
  reporter_responsible text,
  involved_positions_raw text,
  initial_status_id uuid references cat_incident_status(id) on delete set null,
  final_status_id uuid references cat_incident_status(id) on delete set null,
  resolution_time_interval interval,
  follow_up_comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists incident_operator_evaluation (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references incident(id) on delete cascade,
  operator_name text,
  shift_id uuid references cat_shift(id) on delete set null,
  severity_id uuid references cat_incident_severity(id) on delete set null,
  response_speed numeric(5,2),
  emergency_reaction numeric(5,2),
  question_quality numeric(5,2),
  protocol_application numeric(5,2),
  treatment_quality numeric(5,2),
  evaluation_average numeric(6,2),
  protocol_adherence_pct numeric(6,2),
  approx_resolution_minutes int,
  created_at timestamptz not null default now()
);

create table if not exists surveillance_snapshot (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null,
  institution_id uuid references institution(id) on delete set null,
  raw_institution_name text,
  total_cameras_monitored int,
  turno_madrugada int,
  turno_matutino int,
  turno_vespertino int,
  uptime_ratio numeric(7,4),
  cameras_without_visual int,
  dvrs_count int,
  dvrs_with_failure int,
  panic_button_present boolean,
  panic_status_id uuid references cat_panic_status(id) on delete set null,
  panic_incident_id uuid references incident(id) on delete set null,
  scans_per_shift int,
  total_daily_scans int,
  scan_time_madrugada time,
  scan_time_matutino time,
  scan_time_vespertino time,
  created_at timestamptz not null default now(),
  unique (snapshot_date, raw_institution_name)
);

create table if not exists panic_button_log (
  id uuid primary key default gen_random_uuid(),
  event_date date not null,
  institution_id uuid references institution(id) on delete set null,
  raw_institution_name text,
  button_present boolean,
  panic_status_id uuid references cat_panic_status(id) on delete set null,
  incident_id uuid references incident(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists event_record (
  id uuid primary key default gen_random_uuid(),
  legacy_activity_folio text,
  community_id uuid references cat_community(id) on delete set null,
  responsible_position_id uuid references cat_job_title(id) on delete set null,
  event_date date not null,
  institution_id uuid references institution(id) on delete set null,
  raw_location text,
  estimated_attendance int,
  activity_name text not null,
  event_type_id uuid references cat_event_type(id) on delete set null,
  csc_member_present boolean,
  local_forces_count int,
  risk_score numeric(10,2),
  actual_attendance int,
  created_at timestamptz not null default now()
);

create table if not exists access_request (
  id uuid primary key default gen_random_uuid(),
  legacy_sequential int,
  visitor_name text not null,
  origin_place text,
  institution_id uuid references institution(id) on delete set null,
  raw_institution_name text,
  raw_community_name text,
  visit_date date,
  comments text,
  access_mode_id uuid references cat_access_mode(id) on delete set null,
  link_date date,
  sent_to_responsible boolean,
  resolution_id uuid references cat_access_resolution(id) on delete set null,
  preauthorization_name text,
  created_at timestamptz not null default now()
);

create table if not exists coverage_assignment (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references institution(id) on delete set null,
  raw_institution_name text,
  person_id uuid references person(id) on delete set null,
  raw_person_name text,
  scheduled_text text,
  actual_text text,
  assignment_status_id uuid references cat_assignment_status(id) on delete set null,
  coverage_date date,
  horario_text text,
  start_time time,
  end_time time,
  covered_duration interval,
  iso_week int,
  person_role_classification_id uuid references cat_person_type(id) on delete set null,
  source_person_legacy_id text,
  month_name text,
  year_num int,
  shift_id uuid references cat_shift(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Derived/cleaned equivalent of the dashboard-friendly Turnos sheet.
create table if not exists shift_log (
  id uuid primary key default gen_random_uuid(),
  shift_date date not null,
  person_id uuid references person(id) on delete set null,
  raw_person_name text,
  person_type_id uuid references cat_person_type(id) on delete set null,
  zone_id uuid references cat_zone(id) on delete set null,
  shift_id uuid references cat_shift(id) on delete set null,
  institution_id uuid references institution(id) on delete set null,
  raw_institution_name text,
  community_id uuid references cat_community(id) on delete set null,
  start_time time,
  end_time time,
  worked_duration interval,
  assignment_status_id uuid references cat_assignment_status(id) on delete set null,
  iso_week int,
  created_at timestamptz not null default now()
);

create table if not exists training_session (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references institution(id) on delete set null,
  happened_at timestamptz,
  raw_institution_name text,
  syllabus text,
  training_category_id uuid references cat_training_category(id) on delete set null,
  training_type_id uuid references cat_training_type(id) on delete set null,
  duration interval,
  competency_id uuid references cat_training_competency(id) on delete set null,
  attendees_count int,
  instructor_name text,
  instructor_person_id uuid references person(id) on delete set null,
  instructor_certified boolean,
  created_at timestamptz not null default now()
);

create table if not exists kabat_meeting_attendance (
  id uuid primary key default gen_random_uuid(),
  meeting_date date not null,
  person_id uuid references person(id) on delete set null,
  raw_kabat_name text,
  legacy_id text,
  attendance_status_id uuid references cat_attendance_status(id) on delete set null,
  comments text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 5) AUXILIARY NORMALIZATION / MIGRATION SUPPORT TABLES
-- =========================================================

create table if not exists institution_equivalence (
  id uuid primary key default gen_random_uuid(),
  raw_institution_name text not null,
  normalized_name text,
  suggested_legacy_key text,
  matched_against text,
  match_type text,
  institution_id uuid references institution(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (raw_institution_name)
);

create table if not exists activity_catalog (
  id uuid primary key default gen_random_uuid(),
  normalized_key text not null unique,
  canonical_name text not null,
  examples text,
  frequencies int,
  override_name text,
  created_at timestamptz not null default now()
);

create table if not exists legacy_unmatched_id (
  id uuid primary key default gen_random_uuid(),
  raw_value text not null,
  source_sheet text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- 6) HELPFUL INDEXES
-- =========================================================

create index if not exists idx_institution_zone on institution(zone_id);
create index if not exists idx_institution_community on institution(community_id);
create index if not exists idx_person_full_name on person(full_name);
create index if not exists idx_incident_date on incident(incident_date);
create index if not exists idx_event_record_date on event_record(event_date);
create index if not exists idx_access_request_visit_date on access_request(visit_date);
create index if not exists idx_surveillance_snapshot_date on surveillance_snapshot(snapshot_date);
create index if not exists idx_coverage_assignment_date on coverage_assignment(coverage_date);
create index if not exists idx_shift_log_date on shift_log(shift_date);
create index if not exists idx_training_session_happened_at on training_session(happened_at);
create index if not exists idx_kabat_meeting_date on kabat_meeting_attendance(meeting_date);

-- =========================================================
-- 7) SEED UNIQUE CATALOG VALUES DETECTED IN THE WORKBOOK
-- =========================================================

insert into cat_community (code, name) values
  ('independiente','Independiente'),
  ('maguen_david','Maguen David'),
  ('monte_sinai','Monte Sinai'),
  ('kehila_ashkenazi','Kehilá Ashkenazi'),
  ('bet_el','Bet-El'),
  ('sefaradi','Sefaradí'),
  ('csc','CSC'),
  ('cr','CR'),
  ('otro','Otro'),
  ('deportivo','Deportivo'),
  ('bet_el_kehila','Bet-El / Kehila')
on conflict (code) do nothing;

insert into cat_zone (code, name, sort_order) values
  ('zona_1','Zona 1',1),
  ('zona_2','Zona 2',2),
  ('zona_3','Zona 3',3),
  ('zona_4','Zona 4',4),
  ('cr','CR',5)
on conflict (code) do nothing;

insert into cat_institution_type (code, name) values
  ('templo','Templo'),
  ('colegio','Colegio'),
  ('beneficencia','Beneficencia'),
  ('oficina','Oficina'),
  ('tnua','Tnua'),
  ('panteon','Panteón'),
  ('deportivo','Deportivo'),
  ('yeshiva','Yeshivá'),
  ('comercio','Comercio'),
  ('tevila','Tevila')
on conflict (code) do nothing;

insert into cat_job_title (code, name) values
  ('kabat','Kabat'),
  ('kabat_ajrai','Kabat Ajraí'),
  ('operador','Operador'),
  ('jefe_zona','Jefe de Zona'),
  ('direccion','Dirección'),
  ('tucan','Tucan'),
  ('migracion','Migración'),
  ('jefe_cr','Jefe de CR'),
  ('protector','Protector'),
  ('mefaked','Mefaked'),
  ('dod','Dod'),
  ('marshall','Marshall'),
  ('marshal','Marshal'),
  ('pandas','Pandas'),
  ('mesa','Mesa'),
  ('lojem','Lojem'),
  ('pre_mefaked','Pre-Mefaked'),
  ('voluntario','Voluntario'),
  ('jz','JZ'),
  ('do','DO'),
  ('opcr','OpCR'),
  ('jcr','JCR'),
  ('kb','KB')
on conflict (code) do nothing;

insert into cat_shift (code, name, starts_at, ends_at) values
  ('matutino','Matutino','06:00','14:00'),
  ('vespertino','Vespertino','14:00','22:00'),
  ('nocturno','Nocturno','22:00','06:00')
on conflict (code) do nothing;

insert into cat_person_type (code, name) values
  ('profesional','Profesional'),
  ('voluntario','Voluntario'),
  ('baja','Baja')
on conflict (code) do nothing;

insert into cat_assignment_status (code, name, sort_order) values
  ('solicitado','Solicitado',1),
  ('aprobado','Aprobado',2),
  ('en_curso','En Curso',3),
  ('asistio','Asistió',4),
  ('retardo','Retardo',5),
  ('no_asistio','No asistió',6)
on conflict (code) do nothing;

insert into cat_incident_severity (code, name, severity_rank) values
  ('baja','Baja',1),
  ('media','Media',2),
  ('alta','Alta',3)
on conflict (code) do nothing;

insert into cat_incident_status (code, name, sort_order) values
  ('abierta','Abierta',1),
  ('resuelta','Resuelta',2)
on conflict (code) do nothing;

insert into cat_incident_type (code, name) values
  ('pintas_semana','Pintas de la semana'),
  ('janij_no_localizado','Janij no localizado'),
  ('persona_sospechosa','Persona sospechosa'),
  ('pinta_puerta_acceso','Pinta en puerta de acceso'),
  ('incendio_periferia','Incendio en periferia'),
  ('agresion_socio_bar_roma','Agresión a socio en bar Roma'),
  ('coche_sospechoso','Coche sospechoso'),
  ('solicitud_acceso_turistas_americo_iranis','Solicitud de acceso de turistas Americo-Iranís'),
  ('llamada_extorsion_hackeo','Llamada de extorsión y hackeo'),
  ('socio_intenta_meter_extranjeros','Socio intenta meter a un grupo de extranjeros'),
  ('llamada_amenaza_cjng','Llamada de amenzada del CJNG'),
  ('vecino_gritando_porras','Vecino gritando porras')
on conflict (code) do nothing;

insert into cat_event_type (code, name) values
  ('exclusivo_socios','Exclusivo para socios'),
  ('salida_excursion','Salida / Excursión'),
  ('entrada_no_socios_listas','Entrada a no socios según listas'),
  ('totalmente_abierto','Totalmente Abierto')
on conflict (code) do nothing;

insert into cat_access_mode (code, name) values
  ('link','LINK'),
  ('fisico','FISICO'),
  ('directo_kbt','DIRECTO KBT')
on conflict (code) do nothing;

insert into cat_access_resolution (code, name, sort_order) values
  ('limpio','Limpio',1),
  ('en_investigacion','En investigación',2),
  ('denegado','Denegado',3)
on conflict (code) do nothing;

insert into cat_training_type (code, name) values
  ('mixto','Mixto'),
  ('teorico','Teórico')
on conflict (code) do nothing;

insert into cat_training_category (code, name) values
  ('h','H')
on conflict (code) do nothing;

insert into cat_training_competency (code, name) values
  ('interrogatorio','Interrogatorio'),
  ('transporte','Transporte')
on conflict (code) do nothing;

insert into cat_attendance_status (code, name, sort_order) values
  ('asistio','Asistió',1),
  ('justificado','Justificado',2),
  ('no_asistio','No asistió',3)
on conflict (code) do nothing;

insert into cat_panic_status (code, name) values
  ('activado','Activado')
on conflict (code) do nothing;

insert into app_role (code, name, description) values
  ('super_admin','Super Admin','Acceso total a configuración, catálogos, usuarios y datos'),
  ('director_operativo','Director Operativo','Visibilidad global operativa y autorización transversal'),
  ('jefe_cr','Jefe de CR','Gestión central de incidentes, accesos y monitoreo'),
  ('jefe_zona','Jefe de Zona','Gestión sobre una o varias zonas asignadas'),
  ('operador_cr','Operador CR','Captura y seguimiento operativo diario'),
  ('kabat_ajrai','Kabat Ajraí','Supervisión de kabats y eventos asignados'),
  ('kabat','Kabat','Operación y captura de actividades/eventos'),
  ('profesional','Profesional','Consulta/captura restringida de sus turnos y coberturas'),
  ('voluntario','Voluntario','Consulta/captura restringida de sus turnos y coberturas'),
  ('viewer','Viewer','Solo lectura')
on conflict (code) do nothing;

-- =========================================================
-- 8) OPTIONAL DASHBOARD VIEWS (SAFE STARTING POINT)
-- =========================================================

create or replace view vw_turnos_dashboard as
select
  sl.id,
  sl.shift_date,
  extract(year from sl.shift_date)::int as anio,
  to_char(sl.shift_date, 'TMMonth') as mes,
  extract(isodow from sl.shift_date)::int as dia_semana_iso,
  p.full_name as nombre,
  pt.name as tipo_puesto,
  z.name as zona,
  s.name as turno,
  coalesce(i.name, sl.raw_institution_name) as ubicacion_institucion,
  c.name as comunidad,
  sl.start_time as hora_entrada,
  sl.end_time as hora_salida,
  sl.worked_duration as hrs_laboradas,
  ast.name as estatus,
  sl.iso_week as semana
from shift_log sl
left join person p on p.id = sl.person_id
left join cat_person_type pt on pt.id = sl.person_type_id
left join cat_zone z on z.id = sl.zone_id
left join cat_shift s on s.id = sl.shift_id
left join institution i on i.id = sl.institution_id
left join cat_community c on c.id = sl.community_id
left join cat_assignment_status ast on ast.id = sl.assignment_status_id;

-- =========================================================
-- 9) RLS PLACEHOLDERS
-- =========================================================
-- IMPORTANT:
-- You said you will define edit permissions per role later.
-- The tables below are intentionally left without hard RLS rules yet.
-- Suggested next step:
-- 1. map each app_role to read/write capabilities
-- 2. define if access is global, by zone, by community, by institution, or self-only
-- 3. then create policies using app_user_role + scope tables above

commit;
