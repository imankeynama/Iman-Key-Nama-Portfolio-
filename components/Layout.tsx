import Header from './Header';
import Footer from './Footer';
import { ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
};

export default Layout;