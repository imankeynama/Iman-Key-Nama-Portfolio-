import Link from 'next/link';

const Header = () => {
    return (
        <header className="bg-white shadow-sm">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-gray-800">
                    Home
                </Link>
                <ul className="flex space-x-6">
                    <li>
                        <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
                            Portfolio
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;