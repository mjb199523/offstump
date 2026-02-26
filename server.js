// =============================================
// OFFSTUMP — Backend Server
// Express + JSON File Storage + Nodemailer
// =============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// === BOOKINGS FILE PATH ===
const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

// Initialize bookings file if it doesn't exist
if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2));
}

// === MIDDLEWARE ===
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '.')));

// === RATE LIMITER ===
const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: 'Too many booking requests. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// === FILE STORAGE HELPERS ===
function readBookings() {
    try {
        const data = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function saveBooking(booking) {
    const bookings = readBookings();
    bookings.push(booking);
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
    return booking;
}

// === EMAIL NOTIFICATION ===
async function sendAdminNotification(booking) {
    const emailPass = process.env.EMAIL_PASS;
    const emailUser = process.env.EMAIL_USER || 'offstump26@gmail.com';

    if (!emailPass) {
        console.log('⚠️  EMAIL_PASS not set in .env — skipping email notification');
        return false;
    }

    console.log('📧 Attempting to send email...');
    console.log('   From:', emailUser);
    console.log('   To:', process.env.ADMIN_EMAIL || emailUser);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: emailUser,
            pass: emailPass
        }
    });

    const activityLabels = {
        'bowling-machine': '🏏 Automatic Cricket Bowling Machine',
        'manual-cricket': '🏏 Manual Cricket',
        'yoga': '🧘 Yoga Sessions',
        'other': '🎯 Other'
    };

    const istTime = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'medium'
    });

    const mailOptions = {
        from: `"OFFSTUMP Bookings" <${emailUser}>`,
        to: process.env.ADMIN_EMAIL || 'offstump26@gmail.com',
        subject: `New Booking: ${booking.name} - ${activityLabels[booking.activity] || booking.activity}`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a1a; color: #fff; border-radius: 16px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #FF6A00, #FF8C33); padding: 24px 32px;">
                    <h1 style="margin: 0; font-size: 24px; color: #fff;">New Booking Request</h1>
                    <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">OFFSTUMP - Play Beyond The Line</p>
                </div>
                <div style="padding: 32px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #333; color: #999; width: 140px;">Name</td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #333; font-weight: 600;">${booking.name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #333; color: #999;">Phone</td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #333;">${booking.phone}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #333; color: #999;">Email</td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #333;"><a href="mailto:${booking.email}" style="color: #FF8C33;">${booking.email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #333; color: #999;">Activity</td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #333;">${activityLabels[booking.activity] || booking.activity}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #333; color: #999;">Date</td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #333;">${booking.date}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #333; color: #999;">Time</td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #333;">${booking.time}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; border-bottom: 1px solid #333; color: #999;">Message</td>
                            <td style="padding: 12px 0; border-bottom: 1px solid #333;">${booking.message || 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0; color: #999;">Status</td>
                            <td style="padding: 12px 0;"><span style="background: #FF6A00; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">Pending</span></td>
                        </tr>
                    </table>
                    <p style="margin-top: 24px; font-size: 12px; color: #666;">Received at: ${istTime} IST</p>
                </div>
            </div>
        `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully! Message ID:', info.messageId);
    return true;
}

// === INPUT VALIDATION ===
function validateBookingInput(data) {
    const errors = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.push('Name is required');
    }
    if (!data.phone || typeof data.phone !== 'string' || data.phone.trim().length === 0) {
        errors.push('Phone number is required');
    }
    if (!data.email || typeof data.email !== 'string' || !/^\S+@\S+\.\S+$/.test(data.email.trim())) {
        errors.push('A valid email address is required');
    }
    const validActivities = ['bowling-machine', 'manual-cricket', 'yoga', 'other'];
    if (!data.activity || !validActivities.includes(data.activity)) {
        errors.push('A valid activity must be selected');
    }
    if (!data.date || typeof data.date !== 'string' || data.date.trim().length === 0) {
        errors.push('Preferred date is required');
    }
    if (!data.time || typeof data.time !== 'string' || data.time.trim().length === 0) {
        errors.push('Preferred time is required');
    }

    return errors;
}

// === API ROUTES ===

// POST /api/book-slot
app.post('/api/book-slot', bookingLimiter, async (req, res) => {
    try {
        // 1. Validate
        const errors = validateBookingInput(req.body);
        if (errors.length > 0) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }

        // 2. Prepare booking data
        const bookingData = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            name: req.body.name.trim(),
            phone: req.body.phone.trim(),
            email: req.body.email.trim().toLowerCase(),
            activity: req.body.activity,
            date: req.body.date.trim(),
            time: req.body.time.trim(),
            message: req.body.message ? req.body.message.trim() : '',
            status: 'Pending',
            createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        };

        // 3. Save to JSON file
        saveBooking(bookingData);
        console.log('✅ Booking saved:', bookingData.id, '-', bookingData.name);

        // 4. Send email notification (await it!)
        try {
            await sendAdminNotification(bookingData);
        } catch (emailError) {
            console.error('⚠️  Email failed:', emailError.message);
            // Booking still succeeds even if email fails
        }

        return res.status(201).json({
            success: true,
            message: 'Booking saved successfully',
            booking: {
                id: bookingData.id,
                name: bookingData.name,
                activity: bookingData.activity,
                date: bookingData.date,
                time: bookingData.time,
                status: bookingData.status
            }
        });

    } catch (error) {
        console.error('❌ Booking error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
});

// GET /api/bookings
app.get('/api/bookings', (req, res) => {
    const bookings = readBookings();
    res.json({ success: true, count: bookings.length, bookings });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'running',
        storage: 'JSON file',
        emailConfigured: !!process.env.EMAIL_PASS,
        emailUser: process.env.EMAIL_USER ? 'set' : 'missing',
        emailPass: process.env.EMAIL_PASS ? 'set (' + process.env.EMAIL_PASS.length + ' chars)' : 'missing',
        adminEmail: process.env.ADMIN_EMAIL ? 'set' : 'missing',
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    });
});

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// === START SERVER ===
app.listen(PORT, () => {
    console.log(`\n🏏 OFFSTUMP Server running at http://localhost:${PORT}`);
    console.log(`📋 API endpoint: http://localhost:${PORT}/api/book-slot`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📧 Email: ${process.env.EMAIL_PASS ? 'Configured ✅' : 'NOT configured ❌'}\n`);
});
