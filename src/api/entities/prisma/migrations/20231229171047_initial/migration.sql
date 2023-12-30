-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis_topology";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "Teacher" (
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "created_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Market" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Market_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "ShipMode" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShipMode_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Priority" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Priority_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Segment" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Category" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "father_category" UUID,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Country" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "State" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "geom" GEOMETRY,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "State_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Customer" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "segment" UUID NOT NULL,
    "postal_code" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" UUID NOT NULL,
    "country" UUID NOT NULL,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Product" (
    "uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" UUID NOT NULL,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Order" (
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

    CONSTRAINT "Order_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "OrderProduct" (
    "order_uuid" UUID NOT NULL,
    "product_uuid" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "sales" DOUBLE PRECISION NOT NULL,
    "profit" DOUBLE PRECISION NOT NULL,
    "create_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_on" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderProduct_pkey" PRIMARY KEY ("order_uuid","product_uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Market_name_key" ON "Market"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ShipMode_name_key" ON "ShipMode"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Priority_name_key" ON "Priority"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Segment_name_key" ON "Segment"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "State_name_key" ON "State"("name");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_father_category_fkey" FOREIGN KEY ("father_category") REFERENCES "Category"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_state_fkey" FOREIGN KEY ("state") REFERENCES "State"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_country_fkey" FOREIGN KEY ("country") REFERENCES "Country"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_segment_fkey" FOREIGN KEY ("segment") REFERENCES "Segment"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_category_fkey" FOREIGN KEY ("category") REFERENCES "Category"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_ship_mode_fkey" FOREIGN KEY ("ship_mode") REFERENCES "ShipMode"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customer_fkey" FOREIGN KEY ("customer") REFERENCES "Customer"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_priority_fkey" FOREIGN KEY ("priority") REFERENCES "Priority"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_market_fkey" FOREIGN KEY ("market") REFERENCES "Market"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProduct" ADD CONSTRAINT "OrderProduct_order_uuid_fkey" FOREIGN KEY ("order_uuid") REFERENCES "Order"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderProduct" ADD CONSTRAINT "OrderProduct_product_uuid_fkey" FOREIGN KEY ("product_uuid") REFERENCES "Product"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
