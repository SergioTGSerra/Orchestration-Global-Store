-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis_topology";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "markets" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "markets_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "ship_modes" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ship_modes_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "priorities" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "priorities_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "segments" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "segments_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "categories" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "father_category" UUID,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "countries" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "states" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "geom" GEOMETRY,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "states_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "customers" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "segment" UUID NOT NULL,
    "postal_code" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" UUID NOT NULL,
    "country" UUID NOT NULL,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "products" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" UUID NOT NULL,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "orders" (
    "uuid" UUID NOT NULL,
    "order_date" TIMESTAMP(3) NOT NULL,
    "ship_date" TIMESTAMP(3) NOT NULL,
    "ship_mode" UUID NOT NULL,
    "shipping_cost" DOUBLE PRECISION NOT NULL,
    "customer" UUID NOT NULL,
    "priority" UUID NOT NULL,
    "market" UUID NOT NULL,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "order_products" (
    "order_uuid" UUID NOT NULL,
    "product_uuid" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "sales" DOUBLE PRECISION NOT NULL,
    "profit" DOUBLE PRECISION NOT NULL,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_products_pkey" PRIMARY KEY ("order_uuid","product_uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "ship_modes_name_key" ON "ship_modes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "priorities_name_key" ON "priorities"("name");

-- CreateIndex
CREATE UNIQUE INDEX "segments_name_key" ON "segments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "countries_name_key" ON "countries"("name");

-- CreateIndex
CREATE UNIQUE INDEX "states_name_key" ON "states"("name");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_father_category_fkey" FOREIGN KEY ("father_category") REFERENCES "categories"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_state_fkey" FOREIGN KEY ("state") REFERENCES "states"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_country_fkey" FOREIGN KEY ("country") REFERENCES "countries"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_segment_fkey" FOREIGN KEY ("segment") REFERENCES "segments"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_fkey" FOREIGN KEY ("category") REFERENCES "categories"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_ship_mode_fkey" FOREIGN KEY ("ship_mode") REFERENCES "ship_modes"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_fkey" FOREIGN KEY ("customer") REFERENCES "customers"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_priority_fkey" FOREIGN KEY ("priority") REFERENCES "priorities"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_market_fkey" FOREIGN KEY ("market") REFERENCES "markets"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_products" ADD CONSTRAINT "order_products_order_uuid_fkey" FOREIGN KEY ("order_uuid") REFERENCES "orders"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_products" ADD CONSTRAINT "order_products_product_uuid_fkey" FOREIGN KEY ("product_uuid") REFERENCES "products"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
