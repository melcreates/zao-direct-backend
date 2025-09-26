const pool = require('../db');

exports.getAllFarmers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE user_type = 'Farmer' ORDER BY created_at ASC`
    );
    res.json({ farmers: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}