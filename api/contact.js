const nodemailer = require('nodemailer');

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, message } = req.body ?? {};

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER,
            replyTo: email.trim(),
            subject: `Portfolio Contact from ${name.trim()}`,
            text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\nMessage:\n${message.trim()}`,
            html: `
                <h3>New message from your portfolio</h3>
                <p><strong>Name:</strong> ${escapeHtml(name.trim())}</p>
                <p><strong>Email:</strong> ${escapeHtml(email.trim())}</p>
                <p><strong>Message:</strong></p>
                <p>${escapeHtml(message.trim()).replace(/\n/g, '<br>')}</p>
            `,
        });

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Email send error:', err);
        return res.status(500).json({ error: 'Failed to send message' });
    }
};
