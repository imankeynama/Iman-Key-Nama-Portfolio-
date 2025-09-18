const Footer = () => {
    return (
        <footer className="bg-gray-100 border-t border-gray-200 mt-12">
            <div className="container mx-auto py-6 px-4 text-center text-gray-500">
                <p>&copy; {new Date().getFullYear()} Iman Key Nama. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;