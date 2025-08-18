import React, { ReactNode } from 'react';
import { Head } from '@inertiajs/react';

interface AppLayoutProps {
    children: ReactNode;
    title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-gray-100">
                <nav className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Médico Bolso V2
                                </h1>
                            </div>
                        </div>
                    </div>
                </nav>
                
                <main className="py-6">
                    {children}
                </main>
            </div>
        </>
    );
}