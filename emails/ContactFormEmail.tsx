import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Section,
    Text,
} from '@react-email/components';

interface ContactFormEmailProps {
    name: string;
    email: string;
    message: string;
}

export const ContactFormEmail = ({ name, email, message }: ContactFormEmailProps) => (
    <Html>
        <Head />
        <Body style={{ backgroundColor: '#f6f9fc', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <Container style={{ backgroundColor: '#ffffff', border: '1px solid #f0f0f0', borderRadius: '4px', margin: '0 auto', padding: '20px', maxWidth: '600px' }}>
                <Heading as="h2" style={{ color: '#333' }}>New Contact Form Submission</Heading>
                <Section>
                    <Text style={{ color: '#555' }}>You have received a new message from your portfolio contact form.</Text>
                    <Hr style={{ borderColor: '#e6ebf1', margin: '20px 0' }} />
                    <Text><strong>From:</strong> {name}</Text>
                    <Text><strong>Email:</strong> <a href={`mailto:${email}`}>{email}</a></Text>
                    <Hr style={{ borderColor: '#e6ebf1', margin: '20px 0' }} />
                    <Heading as="h3" style={{ color: '#333' }}>Message:</Heading>
                    <Text style={{ whiteSpace: 'pre-wrap', color: '#555' }}>{message}</Text>
                </Section>
            </Container>
        </Body>
    </Html>
);

export default ContactFormEmail;