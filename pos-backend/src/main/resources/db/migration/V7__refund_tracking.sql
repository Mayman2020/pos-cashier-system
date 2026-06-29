SET search_path = pos_mgmt;

ALTER TABLE pos_order_items
    ADD COLUMN IF NOT EXISTS refunded_quantity NUMERIC(14, 3) NOT NULL DEFAULT 0;
