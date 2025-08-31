const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireOwner, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all apartments with filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      city,
      min_rent,
      max_rent,
      bedrooms,
      bathrooms,
      available_from,
      search,
      owner_id
    } = req.query;

    const offset = (page - 1) * limit;
    let query = `
      SELECT 
        a.*,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.profile_image as owner_profile_image,
        ARRAY_AGG(ai.image_url) FILTER (WHERE ai.image_url IS NOT NULL) as images
      FROM apartments a
      LEFT JOIN users u ON a.owner_id = u.id
      LEFT JOIN apartment_images ai ON a.id = ai.apartment_id
      WHERE a.is_available = true
    `;
    
    let params = [];
    let paramCount = 0;

    if (city) {
      paramCount++;
      query += ` AND a.city ILIKE $${paramCount}`;
      params.push(`%${city}%`);
    }

    if (min_rent) {
      paramCount++;
      query += ` AND a.monthly_rent >= $${paramCount}`;
      params.push(parseFloat(min_rent));
    }

    if (max_rent) {
      paramCount++;
      query += ` AND a.monthly_rent <= $${paramCount}`;
      params.push(parseFloat(max_rent));
    }

    if (bedrooms) {
      paramCount++;
      query += ` AND a.bedrooms >= $${paramCount}`;
      params.push(parseInt(bedrooms));
    }

    if (bathrooms) {
      paramCount++;
      query += ` AND a.bathrooms >= $${paramCount}`;
      params.push(parseInt(bathrooms));
    }

    if (available_from) {
      paramCount++;
      query += ` AND a.available_from <= $${paramCount}`;
      params.push(available_from);
    }

    if (search) {
      paramCount++;
      query += ` AND (a.title ILIKE $${paramCount} OR a.description ILIKE $${paramCount} OR a.address ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (owner_id) {
      paramCount++;
      query += ` AND a.owner_id = $${paramCount}`;
      params.push(owner_id);
    }

    query += ` GROUP BY a.id, u.first_name, u.last_name, u.profile_image`;
    query += ` ORDER BY a.created_at DESC`;
    query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), offset);

    const apartments = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM apartments WHERE is_available = true';
    let countParams = [];
    let countParamCount = 0;

    if (city) {
      countParamCount++;
      countQuery += ` AND city ILIKE $${countParamCount}`;
      countParams.push(`%${city}%`);
    }

    if (min_rent) {
      countParamCount++;
      countQuery += ` AND monthly_rent >= $${countParamCount}`;
      countParams.push(parseFloat(min_rent));
    }

    if (max_rent) {
      countParamCount++;
      countQuery += ` AND monthly_rent <= $${countParamCount}`;
      countParams.push(parseFloat(max_rent));
    }

    if (bedrooms) {
      countParamCount++;
      countQuery += ` AND bedrooms >= $${countParamCount}`;
      countParams.push(parseInt(bedrooms));
    }

    if (bathrooms) {
      countParamCount++;
      countQuery += ` AND bathrooms >= $${countParamCount}`;
      countParams.push(parseInt(bathrooms));
    }

    if (available_from) {
      countParamCount++;
      countQuery += ` AND available_from <= $${countParamCount}`;
      countParams.push(available_from);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (title ILIKE $${countParamCount} OR description ILIKE $${countParamCount} OR address ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    if (owner_id) {
      countParamCount++;
      countQuery += ` AND owner_id = $${countParamCount}`;
      countParams.push(owner_id);
    }

    const totalCount = await pool.query(countQuery, countParams);

    res.json({
      apartments: apartments.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.rows[0].count),
        pages: Math.ceil(totalCount.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get apartments error:', error);
    res.status(500).json({ error: 'Failed to fetch apartments' });
  }
});

// Get apartment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const apartment = await pool.query(`
      SELECT 
        a.*,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.profile_image as owner_profile_image,
        u.phone as owner_phone,
        u.email as owner_email,
        ARRAY_AGG(ai.image_url) FILTER (WHERE ai.image_url IS NOT NULL) as images
      FROM apartments a
      LEFT JOIN users u ON a.owner_id = u.id
      LEFT JOIN apartment_images ai ON a.id = ai.apartment_id
      WHERE a.id = $1
      GROUP BY a.id, u.first_name, u.last_name, u.profile_image, u.phone, u.email
    `, [id]);

    if (apartment.rows.length === 0) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    res.json({ apartment: apartment.rows[0] });
  } catch (error) {
    console.error('Get apartment error:', error);
    res.status(500).json({ error: 'Failed to fetch apartment' });
  }
});

// Create new apartment (owners only)
router.post('/', authenticateToken, requireOwner, async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      city,
      state,
      zip_code,
      latitude,
      longitude,
      monthly_rent,
      deposit_percentage,
      min_contract_months,
      bedrooms,
      bathrooms,
      square_feet,
      available_from,
      amenities
    } = req.body;

    // Validation
    if (!title || !address || !city || !state || !zip_code || !monthly_rent || !bedrooms || !bathrooms || !available_from) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newApartment = await pool.query(`
      INSERT INTO apartments (
        owner_id, title, description, address, city, state, zip_code,
        latitude, longitude, monthly_rent, deposit_percentage, min_contract_months,
        bedrooms, bathrooms, square_feet, available_from, amenities
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      req.user.id, title, description, address, city, state, zip_code,
      latitude, longitude, monthly_rent, deposit_percentage || 20, min_contract_months || 12,
      bedrooms, bathrooms, square_feet, available_from, amenities || []
    ]);

    res.status(201).json({
      message: 'Apartment created successfully',
      apartment: newApartment.rows[0]
    });
  } catch (error) {
    console.error('Create apartment error:', error);
    res.status(500).json({ error: 'Failed to create apartment' });
  }
});

// Update apartment (owner or admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if user owns the apartment or is admin
    const apartment = await pool.query('SELECT owner_id FROM apartments WHERE id = $1', [id]);
    
    if (apartment.rows.length === 0) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    if (apartment.rows[0].owner_id !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const allowedFields = [
      'title', 'description', 'address', 'city', 'state', 'zip_code',
      'latitude', 'longitude', 'monthly_rent', 'deposit_percentage',
      'min_contract_months', 'bedrooms', 'bathrooms', 'square_feet',
      'available_from', 'amenities', 'is_available'
    ];

    const updateFields = [];
    const values = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    paramCount++;
    values.push(id);

    const query = `UPDATE apartments SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const updatedApartment = await pool.query(query, values);

    res.json({
      message: 'Apartment updated successfully',
      apartment: updatedApartment.rows[0]
    });
  } catch (error) {
    console.error('Update apartment error:', error);
    res.status(500).json({ error: 'Failed to update apartment' });
  }
});

// Delete apartment (owner or admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the apartment or is admin
    const apartment = await pool.query('SELECT owner_id FROM apartments WHERE id = $1', [id]);
    
    if (apartment.rows.length === 0) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    if (apartment.rows[0].owner_id !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query('DELETE FROM apartments WHERE id = $1', [id]);

    res.json({ message: 'Apartment deleted successfully' });
  } catch (error) {
    console.error('Delete apartment error:', error);
    res.status(500).json({ error: 'Failed to delete apartment' });
  }
});

// Upload apartment images
router.post('/:id/images', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body;

    // Check if user owns the apartment or is admin
    const apartment = await pool.query('SELECT owner_id FROM apartments WHERE id = $1', [id]);
    
    if (apartment.rows.length === 0) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    if (apartment.rows[0].owner_id !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Images array is required' });
    }

    // Delete existing images
    await pool.query('DELETE FROM apartment_images WHERE apartment_id = $1', [id]);

    // Insert new images
    for (let i = 0; i < images.length; i++) {
      await pool.query(
        'INSERT INTO apartment_images (apartment_id, image_url, is_primary) VALUES ($1, $2, $3)',
        [id, images[i], i === 0] // First image is primary
      );
    }

    res.json({ message: 'Images uploaded successfully' });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

module.exports = router;
