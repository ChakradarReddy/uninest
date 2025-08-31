const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireStudent, requireOwner, requireAdmin } = require('../middleware/auth');

// Initialize Stripe with dummy key if not provided (prevents startup errors)
let stripe = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } else {
    // Use dummy key to prevent startup errors
    stripe = require('stripe')('sk_test_dummy_key_for_startup');
  }
} catch (error) {
  console.log('Stripe initialization failed, payments will be disabled');
  stripe = null;
}

const router = express.Router();

// Create payment intent for deposit
router.post('/create-intent', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { booking_id, amount, payment_method_types = ['card'] } = req.body;

    if (!booking_id || !amount) {
      return res.status(400).json({ error: 'Booking ID and amount are required' });
    }

    // Verify booking exists and belongs to user
    const booking = await pool.query(
      'SELECT id, user_id, apartment_id, deposit_amount, status FROM bookings WHERE id = $1',
      [booking_id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.rows[0].status !== 'pending') {
      return res.status(400).json({ error: 'Booking is not in pending status' });
    }

    // Validate amount
    if (Math.abs(amount - booking.rows[0].deposit_amount) > 0.01) {
      return res.status(400).json({ 
        error: `Amount must be exactly $${booking.rows[0].deposit_amount.toFixed(2)}` 
      });
    }

    // Check if Stripe is properly configured
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ 
        error: 'Payment processing is not configured',
        message: 'Stripe API key is required for payment processing'
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method_types,
      metadata: {
        booking_id,
        user_id: req.user.id,
        type: 'deposit'
      }
    });

    // Update booking with payment intent ID
    await pool.query(
      'UPDATE bookings SET payment_intent_id = $1 WHERE id = $2',
      [paymentIntent.id, booking_id]
    );

    res.json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Confirm payment
router.post('/confirm', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { payment_intent_id, booking_id } = req.body;

    if (!payment_intent_id || !booking_id) {
      return res.status(400).json({ error: 'Payment intent ID and booking ID are required' });
    }

    // Check if Stripe is properly configured
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ 
        error: 'Payment processing is not configured',
        message: 'Stripe API key is required for payment processing'
      });
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment has not been completed' });
    }

    // Verify booking
    const booking = await pool.query(
      'SELECT id, user_id, deposit_amount, status FROM bookings WHERE id = $1 AND payment_intent_id = $2',
      [booking_id, payment_intent_id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (booking.rows[0].status !== 'pending') {
      return res.status(400).json({ error: 'Booking is not in pending status' });
    }

    // Record payment
    const payment = await pool.query(`
      INSERT INTO payments (
        booking_id, user_id, amount, payment_method, payment_status, stripe_payment_intent_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      booking_id, req.user.id, booking.rows[0].deposit_amount,
      'card', 'completed', payment_intent_id
    ]);

    // Update booking status to confirmed
    await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2',
      ['confirmed', booking_id]
    );

    // Mark apartment as unavailable
    await pool.query(
      'UPDATE apartments SET is_available = false WHERE id = (SELECT apartment_id FROM bookings WHERE id = $1)',
      [booking_id]
    );

    res.json({
      message: 'Payment confirmed successfully',
      payment: payment.rows[0],
      booking_status: 'confirmed'
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Get payment history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        p.*,
        b.move_in_date,
        b.move_out_date,
        a.title as apartment_title,
        a.address as apartment_address
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN apartments a ON b.apartment_id = a.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const payments = await pool.query(query, [req.user.id, parseInt(limit), offset]);

    // Get total count
    const totalCount = await pool.query(
      'SELECT COUNT(*) FROM payments WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      payments: payments.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totalCount.rows[0].count),
        pages: Math.ceil(totalCount.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Get payment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await pool.query(`
      SELECT 
        p.*,
        b.move_in_date,
        b.move_out_date,
        a.title as apartment_title,
        a.address as apartment_address,
        u.first_name as user_first_name,
        u.last_name as user_last_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN apartments a ON b.apartment_id = a.id
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `, [id]);

    if (payment.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const paymentData = payment.rows[0];

    // Check if user has access to this payment
    if (paymentData.user_id !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ payment: paymentData });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Process refund (admin only)
router.post('/:id/refund', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Refund reason is required' });
    }

    const payment = await pool.query(
      'SELECT * FROM payments WHERE id = $1',
      [id]
    );

    if (payment.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.rows[0].payment_status !== 'completed') {
      return res.status(400).json({ error: 'Only completed payments can be refunded' });
    }

    // Check if Stripe is properly configured
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ 
        error: 'Payment processing is not configured',
        message: 'Stripe API key is required for payment processing'
      });
    }

    // Process Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: payment.rows[0].stripe_payment_intent_id,
      reason: 'requested_by_customer'
    });

    // Update payment status
    await pool.query(
      'UPDATE payments SET payment_status = $1 WHERE id = $2',
      ['refunded', id]
    );

    // Update booking status
    await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2',
      ['cancelled', payment.rows[0].booking_id]
    );

    // Mark apartment as available again
    await pool.query(
      'UPDATE apartments SET is_available = true WHERE id = (SELECT apartment_id FROM bookings WHERE id = $1)',
      [payment.rows[0].booking_id]
    );

    res.json({
      message: 'Refund processed successfully',
      refund_id: refund.id,
      payment_status: 'refunded'
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

// Webhook for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Check if Stripe is properly configured
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ 
        error: 'Payment processing is not configured',
        message: 'Stripe API key is required for payment processing'
      });
    }

    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
