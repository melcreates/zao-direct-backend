const pool = require('../db');

// ✅ Create Product
exports.createProduct = async (req, res) => {
  const { name, description, price, image_url, category, created_by} = req.body;

  // Validation
  if (!name || !price || !image_url || !category) {
    return res.status(400).json({ error: 'Name, price, unit, and category are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (name, description, price, image_url, category, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, price, image_url, category, created_by]
    );

    res.status(201).json({ product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while creating product.' });
  }
};


// ✅ Get All Products
// ✅ Get All Products with optional search & category filtering
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    let query = `
      SELECT p.*, u.full_name AS owner
      FROM products p
      JOIN users u ON u.id = p.created_by
      WHERE 1=1
    `;
    const params = [];

    // 🔍 Add search condition
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }

    // 🏷️ Add category condition
    if (category) {
      params.push(category);
      query += ` AND p.category = $${params.length}`;
    }

    query += ` ORDER BY p.created_at DESC`;

    const result = await pool.query(query, params);

    // ✅ Wrap with key `products`
    res.json({ products: result.rows });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};




// ✅ Get Products from a particular farmer
exports.getSpecificFarmerProducts = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM products WHERE created_by = $1 ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ products: result.rows }); // ✅ Send the products in response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Delete Product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Optional: Only allow product owner to delete
    const product = await pool.query(
      `SELECT * FROM products WHERE id = $1 AND created_by = $2`,
      [id, req.user.id]
    );

    if (product.rows.length === 0) {
      return res.status(403).json({ message: 'Not allowed or product not found' });
    }

    await pool.query(`DELETE FROM products WHERE id = $1`, [id]);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
