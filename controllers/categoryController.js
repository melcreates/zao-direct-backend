const pool = require('../db');

//Get All Categories

exports.getAllCategories = async (req,res) => {
    try {
    const result = await pool.query(`
      SELECT DISTINCT category 
      FROM products 
      WHERE category IS NOT NULL
      ORDER BY category ASC
    `);

    res.status(200).json({
      success: true,
      categories: result.rows,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

