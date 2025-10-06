const bcrypt = require('bcrypt');
const pool = require('../db');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { full_name, email, phone_number, password, user_type, location } = req.body;

  if (!full_name || !email || !password || !user_type || !location) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone_number, password_hash, user_type, location)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, user_type`,
      [full_name, email, phone_number, hashedPassword, user_type, location]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(409).json({ error: 'Email already exists.' });
    } else {
      res.status(500).json({ error: 'Server error.' });
    }
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const payload = {
      id: user.id,
      email: user.email
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    await pool.query(
      `UPDATE users SET online = true, last_seen = NOW() WHERE id = $1`,
      [user.id]
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.full_name,      // or whatever your column is
        email: user.email
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
}

exports.logout = async (req, res) => {
  const { online } = req.body;
  try {
    await pool.query(
      "UPDATE users SET online = $1, last_seen = NOW() WHERE id = $2",
      [online, req.user.id]
    );
    res.json({ message: "User status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user status" });
  }
}

exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, phone_number, user_type, location, description, profile_picture FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Authenticated user',
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        phone: user.phone_number,
        type: user.user_type,
        location: user.location,
        description: user.description,
        profilepic: user.profile_picture
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
}


// controllers/userController.js

exports.updateDescription = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }

    // req.user.id should come from verifyToken
    const result = await pool.query(
      "UPDATE users SET description = $1 WHERE id = $2 RETURNING id, email, description",
      [description, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Description updated", user: result.rows[0] });
  } catch (err) {
    console.error("Update description error:", err);
    res.status(500).json({ message: "Server error" });
  }
};