-- V9: Role permissions + lookups (PostgreSQL)
SET search_path = pos_mgmt;

CREATE TABLE IF NOT EXISTS role_permissions (
    id          BIGSERIAL PRIMARY KEY,
    role_id     BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module_key  VARCHAR(80) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uk_role_permissions_role_module UNIQUE (role_id, module_key)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);

INSERT INTO role_permissions (role_id, module_key, permissions)
SELECT r.id, m.module_key, m.perms::jsonb
FROM roles r
CROSS JOIN (VALUES
    ('ADMIN', 'dashboard',       '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'pos',             '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'products',        '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'categories',      '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'units',           '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'taxes',           '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'discounts',       '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'kitchen',         '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'inventory',       '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'customers',       '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'suppliers',       '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'purchase_orders', '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'orders',          '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'shifts',          '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'reports',         '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'expenses',        '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'audit',           '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'tables',          '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'branches',        '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'users',           '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'settings',        '{"view":true,"create":true,"edit":true,"delete":true}'),
    ('ADMIN', 'profile',         '{"view":true,"create":true,"edit":true,"delete":false}'),

    ('MANAGER', 'dashboard',       '{"view":true,"create":false,"edit":false,"delete":false}'),
    ('MANAGER', 'pos',             '{"view":true,"create":true,"edit":true,"delete":false}'),
    ('MANAGER', 'products',        '{"view":true,"create":true,"edit":true,"delete":false}'),
    ('MANAGER', 'categories',      '{"view":true,"create":true,"edit":true,"delete":false}'),
    ('MANAGER', 'units',           '{"view":true,"create":true,"edit":true,"delete":false}'),
    ('MANAGER', 'taxes',           '{"view":true,"create":true,"edit":true,"delete":false}'),
    ('MANAGER', 'discounts',       '{"view":true,"create":true,"edit":true,"delete":false}'),
    ('MANAGER', 'kitchen',         '{"view":true,"create":false,"edit":true,"delete":false}'),
    ('MANAGER', 'inventory',       '{"view":true,"create":true,"edit":true,"delete":false}'),
    ('MANAGER', 'customers',       '{"view":true,"create":true,"edit":true,"delete":false}'),
    ('MANAGER', 'suppliers',       '{"view":true,"create":true,"edit":true,"delete":false}'),
    ('MANAGER', 'purchase_orders', '{"view":true,"create":true,"edit":true,"delete":false}'),
    ('MANAGER', 'orders',          '{"view":true,"create":true,"edit":true,"delete":false}'),
    ('MANAGER', 'shifts',          '{"view":true,"create":true,"edit":true,"delete":false}'),
    ('MANAGER', 'reports',         '{"view":true,"create":false,"edit":false,"delete":false}'),
    ('MANAGER', 'expenses',        '{"view":true,"create":true,"edit":true,"delete":false}'),
    ('MANAGER', 'audit',           '{"view":true,"create":false,"edit":false,"delete":false}'),
    ('MANAGER', 'tables',          '{"view":true,"create":true,"edit":true,"delete":false}'),
    ('MANAGER', 'branches',        '{"view":true,"create":false,"edit":true,"delete":false}'),
    ('MANAGER', 'users',           '{"view":true,"create":true,"edit":true,"delete":false}'),
    ('MANAGER', 'settings',        '{"view":true,"create":false,"edit":true,"delete":false}'),
    ('MANAGER', 'profile',         '{"view":true,"create":true,"edit":true,"delete":false}'),

    ('CASHIER', 'dashboard',       '{"view":true,"create":false,"edit":false,"delete":false}'),
    ('CASHIER', 'pos',             '{"view":true,"create":true,"edit":true,"delete":false}'),
    ('CASHIER', 'products',        '{"view":false,"create":false,"edit":false,"delete":false}'),
    ('CASHIER', 'categories',      '{"view":false,"create":false,"edit":false,"delete":false}'),
    ('CASHIER', 'units',           '{"view":false,"create":false,"edit":false,"delete":false}'),
    ('CASHIER', 'taxes',           '{"view":false,"create":false,"edit":false,"delete":false}'),
    ('CASHIER', 'discounts',       '{"view":false,"create":false,"edit":false,"delete":false}'),
    ('CASHIER', 'kitchen',         '{"view":true,"create":false,"edit":true,"delete":false}'),
    ('CASHIER', 'inventory',       '{"view":true,"create":false,"edit":false,"delete":false}'),
    ('CASHIER', 'customers',       '{"view":true,"create":true,"edit":false,"delete":false}'),
    ('CASHIER', 'suppliers',       '{"view":false,"create":false,"edit":false,"delete":false}'),
    ('CASHIER', 'purchase_orders', '{"view":false,"create":false,"edit":false,"delete":false}'),
    ('CASHIER', 'orders',          '{"view":true,"create":true,"edit":true,"delete":false}'),
    ('CASHIER', 'shifts',          '{"view":true,"create":true,"edit":true,"delete":false}'),
    ('CASHIER', 'reports',         '{"view":false,"create":false,"edit":false,"delete":false}'),
    ('CASHIER', 'expenses',        '{"view":false,"create":false,"edit":false,"delete":false}'),
    ('CASHIER', 'audit',           '{"view":false,"create":false,"edit":false,"delete":false}'),
    ('CASHIER', 'tables',          '{"view":false,"create":false,"edit":false,"delete":false}'),
    ('CASHIER', 'branches',        '{"view":false,"create":false,"edit":false,"delete":false}'),
    ('CASHIER', 'users',           '{"view":false,"create":false,"edit":false,"delete":false}'),
    ('CASHIER', 'settings',        '{"view":false,"create":false,"edit":false,"delete":false}'),
    ('CASHIER', 'profile',         '{"view":true,"create":true,"edit":true,"delete":false}')
) AS m(role_name, module_key, perms)
WHERE r.name = m.role_name
ON CONFLICT (role_id, module_key) DO UPDATE
SET permissions = EXCLUDED.permissions,
    updated_at = NOW();

CREATE TABLE IF NOT EXISTS lookups (
    id          BIGSERIAL PRIMARY KEY,
    type        VARCHAR(50) NOT NULL,
    code        VARCHAR(50) NOT NULL,
    name_ar     VARCHAR(150) NOT NULL,
    name_en     VARCHAR(150) NOT NULL,
    parent_id   BIGINT,
    sort_order  INT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    is_locked   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW(),
    CONSTRAINT uk_lookup_type_code UNIQUE (type, code)
);

CREATE INDEX IF NOT EXISTS idx_lookups_type_active ON lookups(type, is_active, sort_order);

INSERT INTO lookups (type, code, name_ar, name_en, sort_order, is_locked) VALUES
('ORDER_CHANNEL', 'DINE_IN', 'صالة', 'Dine-in', 1, TRUE),
('ORDER_CHANNEL', 'TAKEAWAY', 'تيك أواي', 'Takeaway', 2, TRUE),
('ORDER_CHANNEL', 'DELIVERY', 'توصيل', 'Delivery', 3, TRUE),
('PAYMENT_METHOD', 'CASH', 'نقدي', 'Cash', 1, TRUE),
('PAYMENT_METHOD', 'CARD', 'بطاقة', 'Card', 2, TRUE),
('PAYMENT_METHOD', 'MIXED', 'مختلط', 'Mixed', 3, TRUE),
('PAYMENT_METHOD', 'OTHER', 'أخرى', 'Other', 4, FALSE),
('TABLE_ZONE', 'INDOOR', 'داخلي', 'Indoor', 1, FALSE),
('TABLE_ZONE', 'OUTDOOR', 'خارجي', 'Outdoor', 2, FALSE),
('TABLE_ZONE', 'VIP', 'VIP', 'VIP', 3, FALSE),
('INVENTORY_UNIT', 'PCS', 'قطعة', 'Piece', 1, TRUE),
('INVENTORY_UNIT', 'KG', 'كيلو', 'Kilogram', 2, TRUE),
('INVENTORY_UNIT', 'L', 'لتر', 'Liter', 3, TRUE),
('EXPENSE_TYPE', 'RENT', 'إيجار', 'Rent', 1, FALSE),
('EXPENSE_TYPE', 'UTILITIES', 'مرافق', 'Utilities', 2, FALSE),
('EXPENSE_TYPE', 'SUPPLIES', 'مستلزمات', 'Supplies', 3, FALSE)
ON CONFLICT (type, code) DO UPDATE
SET name_ar = EXCLUDED.name_ar,
    name_en = EXCLUDED.name_en,
    sort_order = EXCLUDED.sort_order,
    is_locked = EXCLUDED.is_locked,
    updated_at = NOW();
