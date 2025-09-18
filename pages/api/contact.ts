import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { ContactFormEmail } from '@/emails/ContactFormEmail';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!process.env.RESEND_API_KEY || !process.env.CONTACT_FORM_TO_EMAIL) {
        console.error('ERROR: Missing Resend environment variables. Please check your .env.local file and restart the server.');
        return res.status(500).json({ message: 'Server configuration error.' });
    }

    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        const { data, error } = await resend.emails.send({
            from: 'Portfolio Contact <onboarding@resend.dev>',
            to: [process.env.CONTACT_FORM_TO_EMAIL],
            subject: `New message from ${name}`,
            replyTo: email,
            react: ContactFormEmail({ name, email, message }),
        });

        if (error) {
            console.error('Resend error:', error);
            return res.status(400).json({ message: error.message });
        }

        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error: any) {
        console.error('Contact API error:', error);
        res.status(500).json({ message: 'Something went wrong.' });
    }
}