-- Purchase orders
CREATE TABLE purchase_orders (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT NOT NULL REFERENCES branches(id),
    supplier_id BIGINT REFERENCES suppliers(id),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    order_date DATE,
    expected_date DATE,
    invoice_no VARCHAR(100),
    notes VARCHAR(500),
    total_amount NUMERIC(14, 2) DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(100)
);

CREATE TABLE purchase_order_items (
    id BIGSERIAL PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity NUMERIC(14, 3) NOT NULL,
    unit_cost NUMERIC(14, 2) NOT NULL DEFAULT 0,
    received_quantity NUMERIC(14, 3) NOT NULL DEFAULT 0
);

CREATE INDEX idx_po_branch ON purchase_orders(branch_id);
CREATE INDEX idx_po_status ON purchase_orders(status);

-- Expense categories reference via notes on drawer movements; add EXPENSE type support in app layer

-- Audit log
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    branch_id BIGINT,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT,
    details VARCHAR(2000),
    username VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_branch ON audit_logs(branch_id);
