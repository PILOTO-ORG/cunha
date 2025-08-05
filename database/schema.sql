-- ALTER TABLE erp.reservas: adicionar campos extras para reservas

ALTER TABLE erp.reservas
  ADD COLUMN frete numeric NULL,
  ADD COLUMN desconto numeric NULL,
  ADD COLUMN data_criacao timestamp DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN data_atualizacao timestamp DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN data_saida timestamp NULL,
  ADD COLUMN data_retorno timestamp NULL,
  ADD COLUMN dias_reservados int4 NULL;
-- DROP SCHEMA erp;

CREATE SCHEMA erp AUTHORIZATION cloudsqlsuperuser;

-- DROP SEQUENCE erp.clientes_id_cliente_seq;

CREATE SEQUENCE erp.clientes_id_cliente_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE erp.estoque_eventos_id_seq;

CREATE SEQUENCE erp.estoque_eventos_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE erp.locais_id_local_seq;

CREATE SEQUENCE erp.locais_id_local_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE erp.produtos_id_produto_seq;

CREATE SEQUENCE erp.produtos_id_produto_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE erp.reservas_id_item_seq;

CREATE SEQUENCE erp.reservas_id_item_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
-- DROP SEQUENCE erp.reservas_id_reserva_seq;

CREATE SEQUENCE erp.reservas_id_reserva_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;-- erp.clientes definição

-- Drop table

-- DROP TABLE erp.clientes;

CREATE TABLE erp.clientes (
	id_cliente serial4 NOT NULL,
	nome text NOT NULL,
	telefone text NULL,
	email text NULL,
	cpf_cnpj text NULL,
	CONSTRAINT clientes_pkey PRIMARY KEY (id_cliente)
);


-- erp.locais definição

-- Drop table

-- DROP TABLE erp.locais;

CREATE TABLE erp.locais (
	id_local serial4 NOT NULL,
	descricao text NOT NULL,
	endereco text NULL,
	capacidade int4 NULL,
	tipo text NULL,
	CONSTRAINT locais_pkey PRIMARY KEY (id_local)
);


-- erp.produtos definição

-- Drop table

-- DROP TABLE erp.produtos;

CREATE TABLE erp.produtos (
	id_produto serial4 NOT NULL,
	nome text NOT NULL,
	quantidade_total int4 NOT NULL,
	valor_locacao numeric NULL,
	valor_danificacao numeric NULL,
	tempo_limpeza int4 NULL,
	CONSTRAINT produtos_pkey PRIMARY KEY (id_produto)
);


-- erp.reservas definição

-- Drop table

-- DROP TABLE erp.reservas;

CREATE TABLE erp.reservas (
	id_item_reserva int4 DEFAULT nextval('erp.reservas_id_item_seq'::regclass) NOT NULL,
	id_reserva serial4 NOT NULL,
	id_cliente int4 NULL,
	id_local int4 NULL,
	data_inicio timestamp NOT NULL,
	data_fim timestamp NOT NULL,
	status text NOT NULL,
	id_produto int4 NOT NULL,
	quantidade int4 NOT NULL,
	CONSTRAINT ck_reservas_status CHECK ((status = ANY (ARRAY['iniciada'::text,'ativa'::text, 'concluída'::text, 'cancelada'::text]))),
	CONSTRAINT pk_reservas_item PRIMARY KEY (id_item_reserva),
	CONSTRAINT fk_reservas_cliente FOREIGN KEY (id_cliente) REFERENCES erp.clientes(id_cliente),
	CONSTRAINT fk_reservas_local FOREIGN KEY (id_local) REFERENCES erp.locais(id_local),
	CONSTRAINT fk_reservas_produto FOREIGN KEY (id_produto) REFERENCES erp.produtos(id_produto)
);


-- erp.movimentos definição

-- Drop table

-- DROP TABLE erp.movimentos;

CREATE TABLE erp.movimentos (
	id_evento int4 DEFAULT nextval('erp.estoque_eventos_id_seq'::regclass) NOT NULL,
	id_produto int4 NOT NULL,
	data_evento timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	tipo_evento text NOT NULL,
	quantidade int4 NOT NULL,
	observacao text NULL,
	responsavel text NULL,
	reserva_id int4 NULL,
	CONSTRAINT ck_tipo_evento CHECK ((tipo_evento = ANY (ARRAY['entrada'::text, 'saida'::text, 'reserva'::text, 'limpeza'::text, 'perda'::text]))),
	CONSTRAINT pk_estoque_eventos PRIMARY KEY (id_evento),
	CONSTRAINT fk_estoque_produto FOREIGN KEY (id_produto) REFERENCES erp.produtos(id_produto),
	CONSTRAINT fk_estoque_reserva FOREIGN KEY (reserva_id) REFERENCES erp.reservas(id_item_reserva)
);