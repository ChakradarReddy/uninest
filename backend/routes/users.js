const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, user_type, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, email, first_name, last_name, user_type, is_active, created_at FROM users WHERE 1=1';
    let params = [];
    let paramCount = 0;

    if (user_type) {
      paramCount++;
      query += ` AND user_type = $${paramCount}`;
      params.push(user_type);
    }

    if (search) {
      paramCount++;
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), offset);

    const users = await pool.query(query, params);
    const totalCount = await pool.query('SELECT COUNT(*) FROM users');

    res.json({
      users: users.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.rows[0].count),
        pages: Math.ceil(totalCount.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only view their own profile unless they're admin
    if (req.user.id !== id && req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await pool.query(
      'SELECT id, email, first_name, last_name, phone, user_type, profile_image, is_verified, is_active, created_at FROM users WHERE id = $1',
      [id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: user.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user (admin or self)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, profile_image, is_active, user_type } = req.body;

    // Users can only update their own profile unless they're admin
    if (req.user.id !== id && req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only admins can change user_type and is_active
    if (req.user.user_type !== 'admin') {
      delete req.body.is_active;
      delete req.body.user_type;
    }

    const updateFields = [];
    const values = [];
    let paramCount = 0;

    if (first_name !== undefined) {
      paramCount++;
      updateFields.push(`first_name = $${paramCount}`);
      values.push(first_name);
    }

    if (last_name !== undefined) {
      paramCount++;
      updateFields.push(`last_name = $${paramCount}`);
      values.push(last_name);
    }

    if (phone !== undefined) {
      paramCount++;
      updateFields.push(`phone = $${paramCount}`);
      values.push(phone);
    }

    if (profile_image !== undefined) {
      paramCount++;
      updateFields.push(`profile_image = $${paramCount}`);
      values.push(profile_image);
    }

    if (is_active !== undefined && req.user.user_type === 'admin') {
      paramCount++;
      updateFields.push(`is_active = $${paramCount}`);
      values.push(is_active);
    }

    if (user_type !== undefined && req.user.user_type === 'admin') {
      paramCount++;
      updateFields.push(`user_type = $${paramCount}`);
      values.push(user_type);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    paramCount++;
    values.push(id);

    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const updatedUser = await pool.query(query, values);

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser.rows[0]
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
