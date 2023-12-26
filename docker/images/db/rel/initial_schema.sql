CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS POSTGIS;
CREATE EXTENSION IF NOT EXISTS POSTGIS_TOPOLOGY;

CREATE TABLE public.markets (
	uuid			uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	name			VARCHAR(250) UNIQUE NOT NULL,
	region			VARCHAR(250) NOT NULL,
	create_on		TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_on		TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE public.ship_modes (
	uuid			uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	name			VARCHAR(250) UNIQUE NOT NULL,
	create_on		TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_on		TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE public.priorities (
	uuid			uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	name			VARCHAR(250) UNIQUE NOT NULL,
	create_on		TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_on		TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE public.segments (
	uuid			uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	name			VARCHAR(250) UNIQUE NOT NULL,
	create_on		TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_on		TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE public.categories (
	uuid			uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	name			VARCHAR(250) UNIQUE NOT NULL,
	father_category	uuid REFERENCES public.categories(uuid) ON DELETE CASCADE,
	create_on		TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_on		TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE public.countries (
	uuid			uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	name			VARCHAR(250) UNIQUE NOT NULL,
	create_on		TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_on		TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE public.states (
	uuid			uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	name			VARCHAR(250) UNIQUE NOT NULL,
	geom			GEOMETRY,
	create_on		TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_on		TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE public.customers (
	uuid			uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	name			VARCHAR(250) NOT NULL,
	segment			uuid REFERENCES public.segments(uuid) ON DELETE CASCADE NOT NULL,
	postal_code		VARCHAR(250) NOT NULL,
	city			VARCHAR(250) NOT NULL,
	state			uuid REFERENCES public.states(uuid) ON DELETE CASCADE NOT NULL,
	country			uuid REFERENCES public.countries(uuid) ON DELETE CASCADE NOT NULL,
	create_on		TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_on		TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE public.products (
	uuid			uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	name			VARCHAR(250) NOT NULL,
	category		uuid REFERENCES public.categories(uuid) ON DELETE CASCADE NOT NULL,
	create_on		TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_on		TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE public.orders (
    uuid       uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_date TIMESTAMP NOT NULL DEFAULT NOW(),
    ship_date  TIMESTAMP NOT NULL DEFAULT NOW(),
	ship_mode  uuid REFERENCES public.ship_modes(uuid) ON DELETE CASCADE NOT NULL,
	shipping_cost REAL NOT NULL,
    customer   uuid REFERENCES public.customers(uuid) ON DELETE CASCADE NOT NULL,
    priority   uuid REFERENCES public.priorities(uuid) ON DELETE CASCADE NOT NULL,
	market     uuid REFERENCES public.markets(uuid) ON DELETE CASCADE NOT NULL,
    create_on  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_on TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE public.order_products (
    order_uuid   uuid REFERENCES public.orders(uuid) ON DELETE CASCADE,
    product_uuid uuid REFERENCES public.products(uuid) ON DELETE CASCADE,
    quantity     INTEGER NOT NULL,
    discount     REAL NOT NULL,
    sales        REAL NOT NULL,
    profit       REAL NOT NULL,
    create_on    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_on   TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (order_uuid, product_uuid)
);

