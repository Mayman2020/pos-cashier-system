-- V3: Seed categories, units, products, taxes, discounts

SET search_path = pos_mgmt;

INSERT INTO units (code, name, symbol) VALUES
    ('PCS', 'Piece', 'pcs'),
    ('KG', 'Kilogram', 'kg'),
    ('L', 'Liter', 'L'),
    ('BOX', 'Box', 'box')
ON CONFLICT (code) DO NOTHING;

INSERT INTO categories (name, description, color, sort_order, is_active) VALUES
    ('Beverages', 'Hot and cold drinks', '#4CAF50', 1, TRUE),
    ('Food', 'Main dishes and snacks', '#FF9800', 2, TRUE),
    ('Desserts', 'Cakes and sweets', '#E91E63', 3, TRUE),
    ('Grocery', 'Supermarket items', '#2196F3', 4, TRUE),
    ('Dairy', 'Milk and cheese products', '#9C27B0', 5, TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO taxes (code, name, rate, is_default, is_active) VALUES
    ('VAT10', 'VAT 10%', 10.00, TRUE, TRUE),
    ('VAT5', 'VAT 5%', 5.00, FALSE, TRUE),
    ('ZERO', 'Zero Tax', 0.00, FALSE, TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO discounts (code, name, discount_type, value, is_active) VALUES
    ('STAFF10', 'Staff Discount 10%', 'PERCENT', 10.00, TRUE),
    ('SAVE5', 'Save $5', 'FIXED', 5.00, TRUE),
    ('HAPPY20', 'Happy Hour 20%', 'PERCENT', 20.00, TRUE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO products (sku, barcode, name, description, category_id, unit_id, cost_price, selling_price, tax_rate, track_stock, low_stock_threshold, is_active) VALUES
    ('BEV-001', '8901001001001', 'Espresso', 'Single shot espresso', (SELECT id FROM categories WHERE name = 'Beverages'), (SELECT id FROM units WHERE code = 'PCS'), 1.50, 3.50, 10.00, FALSE, 0, TRUE),
    ('BEV-002', '8901001001002', 'Cappuccino', 'Classic cappuccino', (SELECT id FROM categories WHERE name = 'Beverages'), (SELECT id FROM units WHERE code = 'PCS'), 2.00, 4.50, 10.00, FALSE, 0, TRUE),
    ('BEV-003', '8901001001003', 'Fresh Orange Juice', 'Freshly squeezed', (SELECT id FROM categories WHERE name = 'Beverages'), (SELECT id FROM units WHERE code = 'L'), 1.80, 5.00, 10.00, TRUE, 10, TRUE),
    ('FOOD-001', '8901002001001', 'Chicken Burger', 'Grilled chicken burger', (SELECT id FROM categories WHERE name = 'Food'), (SELECT id FROM units WHERE code = 'PCS'), 4.00, 9.99, 10.00, TRUE, 5, TRUE),
    ('FOOD-002', '8901002001002', 'Margherita Pizza', 'Classic pizza', (SELECT id FROM categories WHERE name = 'Food'), (SELECT id FROM units WHERE code = 'PCS'), 5.50, 12.99, 10.00, TRUE, 5, TRUE),
    ('FOOD-003', '8901002001003', 'Caesar Salad', 'Fresh salad', (SELECT id FROM categories WHERE name = 'Food'), (SELECT id FROM units WHERE code = 'PCS'), 3.00, 8.50, 10.00, TRUE, 5, TRUE),
    ('DES-001', '8901003001001', 'Chocolate Cake', 'Slice of chocolate cake', (SELECT id FROM categories WHERE name = 'Desserts'), (SELECT id FROM units WHERE code = 'PCS'), 2.50, 6.50, 10.00, TRUE, 3, TRUE),
    ('DES-002', '8901003001002', 'Ice Cream Scoop', 'Vanilla ice cream', (SELECT id FROM categories WHERE name = 'Desserts'), (SELECT id FROM units WHERE code = 'PCS'), 1.00, 3.00, 10.00, TRUE, 10, TRUE),
    ('GRO-001', '8901004001001', 'Mineral Water 500ml', 'Bottled water', (SELECT id FROM categories WHERE name = 'Grocery'), (SELECT id FROM units WHERE code = 'PCS'), 0.30, 1.00, 5.00, TRUE, 50, TRUE),
    ('GRO-002', '8901004001002', 'Potato Chips', 'Salted chips 150g', (SELECT id FROM categories WHERE name = 'Grocery'), (SELECT id FROM units WHERE code = 'BOX'), 1.20, 2.99, 5.00, TRUE, 20, TRUE),
    ('DAI-001', '8901005001001', 'Whole Milk 1L', 'Fresh milk', (SELECT id FROM categories WHERE name = 'Dairy'), (SELECT id FROM units WHERE code = 'L'), 1.50, 3.49, 5.00, TRUE, 15, TRUE),
    ('DAI-002', '8901005001002', 'Cheddar Cheese 200g', 'Aged cheddar', (SELECT id FROM categories WHERE name = 'Dairy'), (SELECT id FROM units WHERE code = 'BOX'), 2.80, 5.99, 5.00, TRUE, 10, TRUE)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants (product_id, sku, barcode, name, cost_price, selling_price, is_active)
SELECT p.id, p.sku || '-LG', p.barcode || '9', p.name || ' Large', p.cost_price * 1.3, p.selling_price * 1.3, TRUE
FROM products p WHERE p.sku IN ('BEV-002', 'FOOD-001')
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_modifiers (product_id, name, price_adjustment, modifier_group, is_active) VALUES
    ((SELECT id FROM products WHERE sku = 'BEV-002'), 'Extra Shot', 1.00, 'Coffee', TRUE),
    ((SELECT id FROM products WHERE sku = 'BEV-002'), 'Oat Milk', 0.50, 'Milk', TRUE),
    ((SELECT id FROM products WHERE sku = 'BEV-002'), 'Sugar Level: Low', 0.00, 'Sugar', TRUE),
    ((SELECT id FROM products WHERE sku = 'BEV-002'), 'Sugar Level: High', 0.00, 'Sugar', TRUE),
    ((SELECT id FROM products WHERE sku = 'FOOD-001'), 'Extra Cheese', 1.50, 'Add-ons', TRUE),
    ((SELECT id FROM products WHERE sku = 'FOOD-001'), 'No Onion', 0.00, 'Remove', TRUE),
    ((SELECT id FROM products WHERE sku = 'FOOD-002'), 'Extra Cheese', 2.00, 'Add-ons', TRUE),
    ((SELECT id FROM products WHERE sku = 'FOOD-002'), 'Thin Crust', 0.00, 'Size', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO inventory_balances (branch_id, product_id, quantity)
SELECT b.id, p.id,
    CASE
        WHEN p.sku LIKE 'GRO%' THEN 100
        WHEN p.sku LIKE 'DAI%' THEN 30
        WHEN p.sku LIKE 'DES%' THEN 15
        WHEN p.sku LIKE 'FOOD%' THEN 25
        WHEN p.sku LIKE 'BEV-003' THEN 8
        ELSE 0
    END
FROM branches b, products p
WHERE b.code = 'MAIN' AND p.track_stock = TRUE
ON CONFLICT (branch_id, product_id) DO NOTHING;
