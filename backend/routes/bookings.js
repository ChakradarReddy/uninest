const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireStudent, requireOwner, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get user's bookings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        b.*,
        a.title as apartment_title,
        a.address as apartment_address,
        a.city as apartment_city,
        a.monthly_rent,
        ARRAY_AGG(ai.image_url) FILTER (WHERE ai.image_url IS NOT NULL) as apartment_images,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.profile_image as owner_profile_image
      FROM bookings b
      JOIN apartments a ON b.apartment_id = a.id
      LEFT JOIN apartment_images ai ON a.id = ai.apartment_id
      LEFT JOIN users u ON b.owner_id = u.id
      WHERE b.user_id = $1
    `;
    
    let params = [req.user.id];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND b.status = $${paramCount}`;
      params.push(status);
    }

    query += ` GROUP BY b.id, a.title, a.address, a.city, a.monthly_rent, u.first_name, u.last_name, u.profile_image`;
    query += ` ORDER BY b.created_at DESC`;
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), offset);

    const bookings = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM bookings WHERE user_id = $1';
    let countParams = [req.user.id];

    if (status) {
      countQuery += ' AND status = $2';
      countParams.push(status);
    }

    const totalCount = await pool.query(countQuery, countParams);

    res.json({
      bookings: bookings.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.rows[0].count),
        pages: Math.ceil(totalCount.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get owner's bookings (for property owners)
router.get('/owner', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        b.*,
        a.title as apartment_title,
        a.address as apartment_address,
        a.city as apartment_city,
        a.monthly_rent,
        ARRAY_AGG(ai.image_url) FILTER (WHERE ai.image_url IS NOT NULL) as apartment_images,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        u.email as student_email,
        u.phone as student_phone
      FROM bookings b
      JOIN apartments a ON b.apartment_id = a.id
      LEFT JOIN apartment_images ai ON a.id = ai.apartment_id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.owner_id = $1
    `;
    
    let params = [req.user.id];
    let paramCount = 1;

    if (status) {
      paramCount++;
      query += ` AND b.status = $${paramCount}`;
      params.push(status);
    }

    query += ` GROUP BY b.id, a.title, a.address, a.city, a.monthly_rent, u.first_name, u.last_name, u.email, u.phone`;
    query += ` ORDER BY b.created_at DESC`;
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), offset);

    const bookings = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM bookings WHERE owner_id = $1';
    let countParams = [req.user.id];

    if (status) {
      countQuery += ' AND status = $2';
      countParams.push(status);
    }

    const totalCount = await pool.query(countQuery, countParams);

    res.json({
      bookings: bookings.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.rows[0].count),
        pages: Math.ceil(totalCount.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get owner bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch owner bookings' });
  }
});

// Get booking by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await pool.query(`
      SELECT 
        b.*,
        a.title as apartment_title,
        a.address as apartment_address,
        a.city as apartment_city,
        a.state as apartment_state,
        a.zip_code as apartment_zip_code,
        a.monthly_rent,
        a.deposit_percentage,
        a.min_contract_months,
        ARRAY_AGG(ai.image_url) FILTER (WHERE ai.image_url IS NOT NULL) as apartment_images,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        u.email as student_email,
        u.phone as student_phone,
        o.first_name as owner_first_name,
        o.last_name as owner_last_name,
        o.email as owner_email,
        o.phone as owner_phone
      FROM bookings b
      JOIN apartments a ON b.apartment_id = a.id
      LEFT JOIN apartment_images ai ON a.id = ai.apartment_id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN users o ON b.owner_id = o.id
      WHERE b.id = $1
      GROUP BY b.id, a.title, a.address, a.city, a.state, a.zip_code, a.monthly_rent, a.deposit_percentage, a.min_contract_months, u.first_name, u.last_name, u.email, u.phone, o.first_name, o.last_name, o.email, o.phone
    `, [id]);

    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const bookingData = booking.rows[0];

    // Check if user has access to this booking
    if (bookingData.user_id !== req.user.id && 
        bookingData.owner_id !== req.user.id && 
        req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ booking: bookingData });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Create new booking
router.post('/', authenticateToken, requireStudent, async (req, res) => {
  try {
    const {
      apartment_id,
      move_in_date,
      move_out_date,
      total_amount,
      deposit_amount
    } = req.body;

    // Validation
    if (!apartment_id || !move_in_date || !total_amount || !deposit_amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if apartment exists and is available
    const apartment = await pool.query(
      'SELECT id, owner_id, is_available, monthly_rent, deposit_percentage FROM apartments WHERE id = $1',
      [apartment_id]
    );

    if (apartment.rows.length === 0) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    if (!apartment.rows[0].is_available) {
      return res.status(400).json({ error: 'Apartment is not available' });
    }

    // Check if user already has a booking for this apartment
    const existingBooking = await pool.query(
      'SELECT id FROM bookings WHERE user_id = $1 AND apartment_id = $2 AND status IN ($3, $4)',
      [req.user.id, apartment_id, 'pending', 'confirmed']
    );

    if (existingBooking.rows.length > 0) {
      return res.status(400).json({ error: 'You already have a booking for this apartment' });
    }

    // Validate deposit amount
    const expectedDeposit = (total_amount * apartment.rows[0].deposit_percentage) / 100;
    if (Math.abs(deposit_amount - expectedDeposit) > 0.01) {
      return res.status(400).json({ 
        error: `Deposit amount should be ${apartment.rows[0].deposit_percentage}% of total amount ($${expectedDeposit.toFixed(2)})` 
      });
    }

    // Create booking
    const newBooking = await pool.query(`
      INSERT INTO bookings (
        user_id, apartment_id, owner_id, move_in_date, move_out_date,
        total_amount, deposit_amount, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *
    `, [
      req.user.id, apartment_id, apartment.rows[0].owner_id,
      move_in_date, move_out_date, total_amount, deposit_amount
    ]);

    res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking.rows[0]
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update booking status (owner or admin only)
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    // Check if booking exists
    const booking = await pool.query(
      'SELECT id, owner_id, user_id FROM bookings WHERE id = $1',
      [id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const bookingData = booking.rows[0];

    // Check if user has permission to update this booking
    if (bookingData.owner_id !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update status
    const updatedBooking = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    // If confirmed, mark apartment as unavailable
    if (status === 'confirmed') {
      await pool.query(
        'UPDATE apartments SET is_available = false WHERE id = (SELECT apartment_id FROM bookings WHERE id = $1)',
        [id]
      );
    }

    res.json({
      message: 'Booking status updated successfully',
      booking: updatedBooking.rows[0]
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Cancel booking (student only)
router.put('/:id/cancel', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await pool.query(
      'SELECT id, user_id, status FROM bookings WHERE id = $1',
      [id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.rows[0].status !== 'pending') {
      return res.status(400).json({ error: 'Only pending bookings can be cancelled' });
    }

    const updatedBooking = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      ['cancelled', id]
    );

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking.rows[0]
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

module.exports = router;
