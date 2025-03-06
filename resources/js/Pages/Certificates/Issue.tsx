import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { useWeb3 } from '@/Contexts/Web3Context';
import { ContractService } from '@/Services/ContractService';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';

export default function Issue({ auth }: PageProps) {
    const { account, signer, connectWallet, isConnecting, error: web3Error } = useWeb3();
    const [formData, setFormData] = useState({
        certificateNumber: '',
        recipientAddress: '',
        courseId: '',
        courseName: '',
        recipientName: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (!signer) {
                throw new Error('Please connect your wallet first');
            }

            const contractService = new ContractService(signer);
            const isCorrectNetwork = await contractService.checkNetwork();

            if (!isCorrectNetwork) {
                throw new Error('Please switch to the correct network (Sepolia)');
            }

            const txHash = await contractService.issueCertificate(
                formData.certificateNumber,
                formData.recipientAddress,
                formData.courseId,
                formData.courseName,
                formData.recipientName
            );

            setSuccess(`Certificate issued successfully! Transaction hash: ${txHash}`);
            setFormData({
                certificateNumber: '',
                recipientAddress: '',
                courseId: '',
                courseName: '',
                recipientName: '',
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to issue certificate');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Issue Certificate</h2>}
        >
            <Head title="Issue Certificate" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {!account ? (
                                <div className="text-center">
                                    <button
                                        onClick={connectWallet}
                                        disabled={isConnecting}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                                    </button>
                                    {web3Error && <p className="text-red-500 mt-2">{web3Error}</p>}
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Certificate Number
                                        </label>
                                        <input
                                            type="text"
                                            name="certificateNumber"
                                            value={formData.certificateNumber}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Recipient Address
                                        </label>
                                        <input
                                            type="text"
                                            name="recipientAddress"
                                            value={formData.recipientAddress}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Course ID
                                        </label>
                                        <input
                                            type="text"
                                            name="courseId"
                                            value={formData.courseId}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Course Name
                                        </label>
                                        <input
                                            type="text"
                                            name="courseName"
                                            value={formData.courseName}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Recipient Name
                                        </label>
                                        <input
                                            type="text"
                                            name="recipientName"
                                            value={formData.recipientName}
                                            onChange={handleInputChange}
                                            required
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    {error && (
                                        <div className="text-red-500 text-sm">{error}</div>
                                    )}

                                    {success && (
                                        <div className="text-green-500 text-sm">{success}</div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Issuing...' : 'Issue Certificate'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 