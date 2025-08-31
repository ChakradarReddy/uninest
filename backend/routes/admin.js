const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Dashboard statistics
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    const totalApartments = await pool.query('SELECT COUNT(*) FROM apartments');
    const totalBookings = await pool.query('SELECT COUNT(*) FROM bookings');
    const totalPayments = await pool.query('SELECT COUNT(*) FROM payments');

    // Get recent activity
    const recentUsers = await pool.query(
      'SELECT id, email, first_name, last_name, user_type, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );

    const recentBookings = await pool.query(`
      SELECT 
        b.id, b.status, b.created_at,
        a.title as apartment_title,
        u.first_name, u.last_name, u.email
      FROM bookings b
      JOIN apartments a ON b.apartment_id = a.id
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC LIMIT 5
    `);

    // Get revenue data
    const totalRevenue = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = $1',
      ['completed']
    );

    const monthlyRevenue = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COALESCE(SUM(amount), 0) as revenue
      FROM payments 
      WHERE payment_status = 'completed' 
      AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    // Get user type distribution
    const userTypeDistribution = await pool.query(`
      SELECT user_type, COUNT(*) as count
      FROM users
      GROUP BY user_type
    `);

    // Get apartment status distribution
    const apartmentStatusDistribution = await pool.query(`
      SELECT is_available, COUNT(*) as count
      FROM apartments
      GROUP BY is_available
    `);

    res.json({
      statistics: {
        total_users: parseInt(totalUsers.rows[0].count),
        total_apartments: parseInt(totalApartments.rows[0].count),
        total_bookings: parseInt(totalBookings.rows[0].count),
        total_payments: parseInt(totalPayments.rows[0].count),
        total_revenue: parseFloat(totalRevenue.rows[0].total)
      },
      recent_activity: {
        users: recentUsers.rows,
        bookings: recentBookings.rows
      },
      revenue: {
        monthly: monthlyRevenue.rows
      },
      distributions: {
        user_types: userTypeDistribution.rows,
        apartment_status: apartmentStatusDistribution.rows
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get all users with pagination and filters
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, user_type, search, is_active } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM users WHERE 1=1';
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

    if (is_active !== undefined) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      params.push(is_active === 'true');
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

// Get all apartments with moderation tools
router.get('/apartments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, owner_id, city } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        a.*,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.email as owner_email
      FROM apartments a
      LEFT JOIN users u ON a.owner_id = u.id
      WHERE 1=1
    `;
    
    let params = [];
    let paramCount = 0;

    if (status !== undefined) {
      paramCount++;
      query += ` AND a.is_available = $${paramCount}`;
      params.push(status === 'available');
    }

    if (owner_id) {
      paramCount++;
      query += ` AND a.owner_id = $${paramCount}`;
      params.push(owner_id);
    }

    if (city) {
      paramCount++;
      query += ` AND a.city ILIKE $${paramCount}`;
      params.push(`%${city}%`);
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), offset);

    const apartments = await pool.query(query, params);
    const totalCount = await pool.query('SELECT COUNT(*) FROM apartments');

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

// Moderate apartment (approve/reject)
router.put('/apartments/:id/moderate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;

    if (!action || !['approve', 'reject', 'suspend'].includes(action)) {
      return res.status(400).json({ error: 'Valid action is required' });
    }

    const apartment = await pool.query(
      'SELECT id, owner_id FROM apartments WHERE id = $1',
      [id]
    );

    if (apartment.rows.length === 0) {
      return res.status(404).json({ error: 'Apartment not found' });
    }

    let updateData = {};
    let logAction = '';

    switch (action) {
      case 'approve':
        updateData = { is_available: true };
        logAction = 'apartment_approved';
        break;
      case 'reject':
        updateData = { is_available: false };
        logAction = 'apartment_rejected';
        break;
      case 'suspend':
        updateData = { is_available: false };
        logAction = 'apartment_suspended';
        break;
    }

    // Update apartment
    await pool.query(
      'UPDATE apartments SET is_available = $1 WHERE id = $2',
      [updateData.is_available, id]
    );

    // Log admin action
    await pool.query(`
      INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
      VALUES ($1, $2, $3, $4, $5)
    `, [req.user.id, logAction, 'apartment', id, { reason }]);

    res.json({
      message: `Apartment ${action}d successfully`,
      apartment_id: id,
      action
    });
  } catch (error) {
    console.error('Moderate apartment error:', error);
    res.status(500).json({ error: 'Failed to moderate apartment' });
  }
});

// Get all bookings for admin review
router.get('/bookings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, user_id, owner_id } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        b.*,
        a.title as apartment_title,
        a.address as apartment_address,
        u.first_name as student_first_name,
        u.last_name as student_last_name,
        u.email as student_email,
        o.first_name as owner_first_name,
        o.last_name as owner_last_name,
        o.email as owner_email
      FROM bookings b
      JOIN apartments a ON b.apartment_id = a.id
      JOIN users u ON b.user_id = u.id
      JOIN users o ON b.owner_id = o.id
      WHERE 1=1
    `;
    
    let params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND b.status = $${paramCount}`;
      params.push(status);
    }

    if (user_id) {
      paramCount++;
      query += ` AND b.user_id = $${paramCount}`;
      params.push(user_id);
    }

    if (owner_id) {
      paramCount++;
      query += ` AND b.owner_id = $${paramCount}`;
      params.push(owner_id);
    }

    query += ` ORDER BY b.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), offset);

    const bookings = await pool.query(query, params);
    const totalCount = await pool.query('SELECT COUNT(*) FROM bookings');

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

// Get payment analytics
router.get('/payments/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days

    // Get payment statistics
    const totalPayments = await pool.query(`
      SELECT 
        COUNT(*) as total_count,
        COALESCE(SUM(amount), 0) as total_amount,
        COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_count,
        COALESCE(SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END), 0) as completed_amount
      FROM payments
      WHERE created_at >= NOW() - INTERVAL '${period} days'
    `);

    // Get daily payment trends
    const dailyTrends = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as amount
      FROM payments
      WHERE created_at >= NOW() - INTERVAL '${period} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Get payment method distribution
    const paymentMethodDistribution = await pool.query(`
      SELECT 
        payment_method,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as amount
      FROM payments
      WHERE created_at >= NOW() - INTERVAL '${period} days'
      GROUP BY payment_method
    `);

    res.json({
      period_days: parseInt(period),
      statistics: totalPayments.rows[0],
      daily_trends: dailyTrends.rows,
      payment_methods: paymentMethodDistribution.rows
    });
  } catch (error) {
    console.error('Payment analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch payment analytics' });
  }
});

// Get admin logs
router.get('/logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, action, admin_id } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        al.*,
        u.first_name as admin_first_name,
        u.last_name as admin_last_name
      FROM admin_logs al
      LEFT JOIN users u ON al.admin_id = u.id
      WHERE 1=1
    `;
    
    let params = [];
    let paramCount = 0;

    if (action) {
      paramCount++;
      query += ` AND al.action = $${paramCount}`;
      params.push(action);
    }

    if (admin_id) {
      paramCount++;
      query += ` AND al.admin_id = $${paramCount}`;
      params.push(admin_id);
    }

    query += ` ORDER BY al.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), offset);

    const logs = await pool.query(query, params);
    const totalCount = await pool.query('SELECT COUNT(*) FROM admin_logs');

    res.json({
      logs: logs.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.rows[0].count),
        pages: Math.ceil(totalCount.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch admin logs' });
  }
});

// System health check
router.get('/health', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Check database connection
    const dbHealth = await pool.query('SELECT NOW() as timestamp');
    
    // Check system resources
    const systemInfo = {
      node_version: process.version,
      platform: process.platform,
      memory_usage: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };

    res.json({
      status: 'healthy',
      database: {
        status: 'connected',
        timestamp: dbHealth.rows[0].timestamp
      },
      system: systemInfo
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;
