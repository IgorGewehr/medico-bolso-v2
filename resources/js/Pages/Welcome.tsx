import React from 'react';
import { Head } from '@inertiajs/react';

export default function Welcome() {
    return (
        <>
            <Head title="Bem-vindo" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Médico Bolso V2
                        </h1>
                        <p className="text-gray-600">
                            Sistema médico desenvolvido com React + Laravel
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-gray-700">React 18</span>
                        </div>
                        
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-gray-700">Laravel + Inertia.js</span>
                        </div>
                        
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-gray-700">Tailwind CSS v4</span>
                        </div>
                        
                        <div className="flex items-center justify-center space-x-2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-gray-700">TypeScript</span>
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                            Começar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}