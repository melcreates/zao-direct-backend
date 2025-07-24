const pool = require('../db');

// ✅ Create Product
exports.createProduct = async (req, res) => {
  const { name, description, price, image_url } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO products (name, description, price, image_url, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description, price, image_url, req.user.id]
    );

    res.status(201).json({ message: 'Product created', product: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name AS owner
       FROM products p
       JOIN users u ON u.id = p.created_by
       ORDER BY p.created_at DESC`
    );

    res.json({ products: result.rows });
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
