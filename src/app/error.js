'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Runtime Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-panel text-center max-w-md w-full animate-fade-in py-12 px-6">
                <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-red-50 rounded-full">
                        <AlertTriangle className="w-12 h-12 text-red-500" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Oops, Something Went Wrong!
                </h2>

                <p className="text-gray-500 mb-8">
                    {error.message || "An unexpected error occurred while processing your request."}
                </p>

                <button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                    className="w-full btn-primary flex items-center justify-center gap-2 group"
                >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    Try Again
                </button>

                <p className="mt-8 text-xs text-gray-400">
                    Error Code: {error.digest || 'UNKNOWN'}
                </p>
            </div>
        </div>
    );
}
