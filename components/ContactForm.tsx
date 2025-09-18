import { useState, FormEvent } from 'react';

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<SubmissionStatus>('idle');
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, message }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setFeedbackMessage(data.message);
                setName('');
                setEmail('');
                setMessage('');
            } else {
                throw new Error(data.message || 'Something went wrong.');
            }
        } catch (error: any) {
            setStatus('error');
            setFeedbackMessage(error.message);
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-2">Contact Me</h2>
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md border border-slate-200">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700">Message</label>
                    <textarea
                        id="message"
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    ></textarea>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700 disabled:bg-slate-400"
                    >
                        {status === 'submitting' ? 'Sending...' : 'Send Message'}
                    </button>
                </div>
                {status === 'success' && <p className="text-green-600 text-center">{feedbackMessage}</p>}
                {status === 'error' && <p className="text-red-600 text-center">{feedbackMessage}</p>}
            </form>
        </div>
    );
}