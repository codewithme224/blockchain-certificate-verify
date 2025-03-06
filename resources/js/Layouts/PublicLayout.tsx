import { Link } from '@inertiajs/react';

interface Props {
    header?: React.ReactNode;
    children: React.ReactNode;
}

export default function PublicLayout({ header, children }: Props) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center">
                                <Link href="/">
                                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                        Certificate Verifier
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main>{children}</main>

            <footer className="bg-white mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-gray-500 text-sm">
                        © {new Date().getFullYear()} Certificate Verifier. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
} 