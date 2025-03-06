import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { ethers } from 'ethers';
import PublicLayout from '@/Layouts/PublicLayout';

interface VerificationResult {
    exists: boolean;
    isValid: boolean;
    issuer: string;
    recipient: string;
    issuedAt: string;
    courseId: string;
    courseName: string;
    recipientName: string;
}

export default function Home() {
    const [certificateNumber, setCertificateNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<VerificationResult | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

    useEffect(() => {
        const initProvider = async () => {
            if (window.ethereum) {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();
                    setProvider(provider);
                    setSigner(signer);
                } catch (error) {
                    console.error('Failed to initialize provider:', error);
                }
            }
        };
        initProvider();
    }, []);

    const validateCertificateNumber = (number: string): boolean => {
        // Format should be CERT-YYYY-XXXXX
        const regex = /^CERT-\d{4}-\d{5}$/;
        return regex.test(number);
    };

    const switchToSepolia = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
            });
            return true;
        } catch (error: any) {
            if (error.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0xaa36a7',
                            chainName: 'Sepolia',
                            nativeCurrency: {
                                name: 'ETH',
                                symbol: 'ETH',
                                decimals: 18
                            },
                            rpcUrls: ['https://sepolia.infura.io/v3/'],
                            blockExplorerUrls: ['https://sepolia.etherscan.io']
                        }]
                    });
                    return true;
                } catch (addError) {
                    console.error('Failed to add Sepolia network:', addError);
                    return false;
                }
            }
            console.error('Failed to switch network:', error);
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);

        if (!validateCertificateNumber(certificateNumber)) {
            setError('Invalid certificate format. Format should be CERT-YYYY-XXXXX');
            setIsLoading(false);
            return;
        }

        try {
            // Get certificate details from the API
            const response = await axios.post<{
                success: boolean;
                data: {
                    certificateNumber: string;
                    recipientName: string;
                    recipientAddress: string;
                    courseId: string;
                    courseName: string;
                    issuedAt: number;
                    exists: boolean;
                    isValid: boolean;
                }
            }>('/api/certificates/verify', {
                certificateNumber
            });

            if (!response.data.success) {
                throw new Error('Certificate not found');
            }

            const { data } = response.data;

            // Format the verification result
            const formattedResult: VerificationResult = {
                exists: data.exists,
                isValid: data.isValid,
                issuer: 'Verified Institution', // Since we're not using blockchain, we can set a default issuer
                recipient: data.recipientAddress,
                issuedAt: data.issuedAt.toString(),
                courseId: data.courseId,
                courseName: data.courseName,
                recipientName: data.recipientName
            };

            console.log('Formatted result:', formattedResult);
            setResult(formattedResult);

        } catch (err) {
            console.error('Verification error:', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to verify certificate');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PublicLayout>
            <Head title="Verify Certificate" />

            <div className="min-h-screen py-12 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                            Certificate Verification
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Instantly verify the authenticity of your blockchain-based certificates with our secure verification system
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-lg bg-opacity-90">
                        <div className="p-8 md:p-12">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="relative">
                                    <label className="block text-lg font-medium text-gray-700 mb-3">
                                        Certificate Number
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input
                                            type="text"
                                            value={certificateNumber}
                                            onChange={(e) => setCertificateNumber(e.target.value)}
                                            required
                                            placeholder="Enter your certificate ID (e.g., CERT-2024-001)"
                                            className="block w-full px-6 py-4 text-lg rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-blue-500 text-black 
                                            focus:border-blue-500 transition-all duration-200 ease-in-out"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="rounded-lg bg-red-50 p-4 border-l-4 border-red-500">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-base text-red-700">{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center py-4 px-6 text-lg font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 ease-in-out hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Verifying Certificate...
                                        </>
                                    ) : 'Verify Certificate'}
                                </button>
                            </form>

                            {result && (
                                <div className="mt-12 border-t border-gray-200 pt-8">
                                    <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-8">
                                        <div className="flex items-center justify-center mb-8">
                                            {result.exists ? (
                                                result.isValid ? (
                                                    <div className="flex flex-col items-center text-green-600">
                                                        <div className="rounded-full bg-green-100 p-3 mb-4">
                                                            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <h3 className="text-2xl font-bold">Valid Certificate</h3>
                                                        <p className="text-green-600 mt-1">This certificate is authentic and valid</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center text-red-600">
                                                        <div className="rounded-full bg-red-100 p-3 mb-4">
                                                            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <h3 className="text-2xl font-bold">Invalid Certificate</h3>
                                                        <p className="text-red-600 mt-1">This certificate has been revoked or is invalid</p>
                                                    </div>
                                                )
                                            ) : (
                                                <div className="flex flex-col items-center text-red-600">
                                                    <div className="rounded-full bg-red-100 p-3 mb-4">
                                                        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-2xl font-bold">Certificate Not Found</h3>
                                                    <p className="text-red-600 mt-1">This certificate does not exist in our records</p>
                                                </div>
                                            )}
                                        </div>

                                        {result.exists && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="bg-white rounded-lg p-6 shadow-sm">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Certificate Details</h4>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Recipient Name</p>
                                                            <p className="mt-1 text-lg text-gray-900">{result.recipientName}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Course Name</p>
                                                            <p className="mt-1 text-lg text-gray-900">{result.courseName}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Course ID</p>
                                                            <p className="mt-1 text-base text-gray-900">{result.courseId}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-white rounded-lg p-6 shadow-sm">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Details</h4>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Issued Date</p>
                                                            <p className="mt-1 text-base text-gray-900">
                                                                {new Date(parseInt(result.issuedAt) * 1000).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Issuer Address</p>
                                                            <p className="mt-1 text-sm font-mono text-gray-900 break-all">{result.issuer}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-500">Recipient Address</p>
                                                            <p className="mt-1 text-sm font-mono text-gray-900 break-all">{result.recipient}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
} 