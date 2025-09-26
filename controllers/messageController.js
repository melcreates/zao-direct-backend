const pool = require('../db');


// ✅ Send a new message
exports.createMessage = async (req, res) => {
    const { receiver_id, text } = req.body;
    const sender_id = req.user.id; // logged-in user

    if (!receiver_id || !message_text) {
        return res.status(400).json({ error: "Receiver and message text are required." });
    }

    try {
        const result = await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, text)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [sender_id, receiver_id, text]
        );

        res.status(201).json({ message: result.rows[0] });
    } catch (err) {
        console.error("Error creating message:", err);
        res.status(500).json({ error: "Server error while creating message." });
    }
};


exports.getConversation = async (req, res) => {
    const sender_id = req.user.id;
    const { otherUserId } = req.params;

    try {
        const result = await pool.query(
            `
      SELECT 
        m.id,
        m.sender_id,
        sender.full_name AS sender_name,
        m.receiver_id,
        receiver.full_name AS receiver_name,
        m.text,
        m.created_at
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC;
      `,
            [sender_id, otherUserId]
        );

        res.json({ messages: result.rows });
    } catch (err) {
        console.error("Error fetching conversation:", err);
        res.status(500).json({ error: "Server error while fetching conversation." });
    }
};

// ✅ Get chat list (like WhatsApp sidebar)
exports.getChatList = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `
      SELECT DISTINCT ON (m.sender_id)
       m.id,
       m.sender_id,
       sender.full_name AS sender_name,
       m.receiver_id,
       receiver.full_name AS receiver_name,
       m.text,
       m.created_at
FROM messages m
JOIN users sender ON m.sender_id = sender.id
JOIN users receiver ON m.receiver_id = receiver.id
WHERE m.receiver_id = $1
ORDER BY m.sender_id, m.created_at DESC;

      `,
            [userId]
        );

        res.json({ chats: result.rows });
    } catch (err) {
        console.error("Error fetching chat list:", err);
        res.status(500).json({ error: "Server error while fetching chat list." });
    }
};
