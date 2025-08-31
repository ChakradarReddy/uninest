const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireStudent } = require('../middleware/auth');

const router = express.Router();

// Get user's wishlist
router.get('/', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const wishlist = await pool.query(`
      SELECT 
        w.id,
        w.created_at,
        a.*,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.profile_image as owner_profile_image,
        ARRAY_AGG(ai.image_url) FILTER (WHERE ai.image_url IS NOT NULL) as images
      FROM wishlist w
      JOIN apartments a ON w.apartment_id = a.id
      LEFT JOIN users u ON a.owner_id = u.id
      LEFT JOIN apartment_images ai ON a.id = ai.apartment_id
      WHERE w.user_id = $1 AND a.is_available = true
      GROUP BY w.id, a.id, u.first_name, u.last_name, u.profile_image
      ORDER BY w.created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, parseInt(limit), offset]);

    // Get total count
    const totalCount = await pool.query(
      'SELECT COUNT(*) FROM wishlist w JOIN apartments a ON w.apartment_id = a.id WHERE w.user_id = $1 AND a.is_available = true',
      [req.user.id]
    );

    res.json({
      wishlist: wishlist.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.rows[0].count),
        pages: Math.ceil(totalCount.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add apartment to wishlist
router.post('/', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { apartment_id } = req.body;

    if (!apartment_id) {
      return res.status(400).json({ error: 'Apartment ID is required' });
    }

    // Check if apartment exists and is available
    const apartment = await pool.query(
      'SELECT id, is_available FROM apartments WHERE id = $1',
      [apartment_id]
    );

    if (apartment.rows.length === 0) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    if (!apartment.rows[0].is_available) {
      return res.status(400).json({ error: 'Apartment is not available' });
    }

    // Check if already in wishlist
    const existingWishlist = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND apartment_id = $2',
      [req.user.id, apartment_id]
    );

    if (existingWishlist.rows.length > 0) {
      return res.status(400).json({ error: 'Apartment is already in your wishlist' });
    }

    // Add to wishlist
    const newWishlistItem = await pool.query(
      'INSERT INTO wishlist (user_id, apartment_id) VALUES ($1, $2) RETURNING *',
      [req.user.id, apartment_id]
    );

    res.status(201).json({
      message: 'Apartment added to wishlist',
      wishlist_item: newWishlistItem.rows[0]
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add apartment to wishlist' });
  }
});

// Remove apartment from wishlist
router.delete('/:apartment_id', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { apartment_id } = req.params;

    const result = await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND apartment_id = $2 RETURNING id',
      [req.user.id, apartment_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    res.json({ message: 'Apartment removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove apartment from wishlist' });
  }
});

// Check if apartment is in user's wishlist
router.get('/check/:apartment_id', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { apartment_id } = req.params;

    const wishlistItem = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND apartment_id = $2',
      [req.user.id, apartment_id]
    );

    res.json({
      is_in_wishlist: wishlistItem.rows.length > 0
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ error: 'Failed to check wishlist status' });
  }
});

// Get wishlist count
router.get('/count', authenticateToken, requireStudent, async (req, res) => {
  try {
    const count = await pool.query(
      'SELECT COUNT(*) FROM wishlist w JOIN apartments a ON w.apartment_id = a.id WHERE w.user_id = $1 AND a.is_available = true',
      [req.user.id]
    );

    res.json({
      count: parseInt(count.rows[0].count)
    });
  } catch (error) {
    console.error('Get wishlist count error:', error);
    res.status(500).json({ error: 'Failed to get wishlist count' });
  }
});

module.exports = router;
