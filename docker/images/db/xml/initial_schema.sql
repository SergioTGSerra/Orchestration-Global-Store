CREATE TABLE public.imported_documents (
    id serial PRIMARY KEY,
    file_name VARCHAR(250) NOT NULL,
    xml XML NOT NULL,
    csv TEXT NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_on TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_on TIMESTAMP DEFAULT NULL
);

CREATE TABLE public.converted_documents (
    id              serial PRIMARY KEY,
    src             VARCHAR(250) UNIQUE NOT NULL,
    file_size       BIGINT NOT NULL,
    dst             VARCHAR(250) UNIQUE NOT NULL,
	created_on      TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_on      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE public.queries (
    id serial PRIMARY KEY,
    query_type VARCHAR(250) NOT NULL,
    file_name VARCHAR(250) NOT NULL,
    xml XML NOT NULL
);
