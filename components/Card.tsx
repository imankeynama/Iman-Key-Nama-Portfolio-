import Link from 'next/link';

interface CardProps {
    title: string;
    href: string;
    description?: string;
    imageUrl?: string;
}

const Card = ({ title, href, description, imageUrl }: CardProps) => {
    return (
        <Link
            href={href}
            className="group block bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
        >
            {imageUrl && (
                <div className="overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}
            <div className="p-6">
                <h3 className="mb-2 text-xl font-bold tracking-tight text-slate-800">{title}</h3>
                {description && <p className="text-slate-600">{description}</p>}
            </div>
        </Link>
    );
};

export default Card;