import Link from 'next/link';
import Image from 'next/image';

interface CardProps {
    title: string;
    href: string;
    imageUrl?: string;
}

const Card = ({ title, href, imageUrl }: CardProps) => {
    return (
        <Link
            href={href}
            className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
        >
            {imageUrl && (
                <Image
                    src={imageUrl}
                    alt={title}
                    className="w-full h-48 object-cover"
                    width={400}
                    height={192} />
            )}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            </div>
        </Link>
    );
};

export default Card;