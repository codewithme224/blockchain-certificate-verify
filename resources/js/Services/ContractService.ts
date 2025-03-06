import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers';
import axios from 'axios';

interface CertificateData {
    certificateNumber: string;
    recipientAddress: string;
    courseId: string;
    courseName: string;
    recipientName: string;
    contractAddress: string;
    contractABI: string;
}

export class ContractService {
    private contract: ethers.Contract | null = null;
    private signer: JsonRpcSigner | null = null;

    constructor(signer: JsonRpcSigner | null = null) {
        this.signer = signer;
    }

    private async initializeContract(contractAddress: string, contractABI: string) {
        if (!this.signer) {
            throw new Error('Signer not initialized');
        }
        this.contract = new ethers.Contract(contractAddress, JSON.parse(contractABI), this.signer);
    }

    public async issueCertificate(
        certificateNumber: string,
        recipientAddress: string,
        courseId: string,
        courseName: string,
        recipientName: string
    ): Promise<string> {
        try {
            // Get contract data from backend
            const response = await axios.post<{ success: boolean; data: CertificateData }>('/api/certificates/prepare-issuance', {
                certificateNumber,
                recipientAddress,
                courseId,
                courseName,
                recipientName
            });

            if (!response.data.success) {
                throw new Error('Failed to prepare certificate data');
            }

            const { contractAddress, contractABI } = response.data.data;

            // Initialize contract with received data
            await this.initializeContract(contractAddress, contractABI);

            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            // Issue certificate
            const tx = await this.contract.issueCertificate(
                certificateNumber,
                recipientAddress,
                courseId,
                courseName,
                recipientName
            );

            const receipt = await tx.wait();
            return receipt.transactionHash;
        } catch (error) {
            console.error('Error issuing certificate:', error);
            throw error;
        }
    }

    public async verifyCertificate(certificateNumber: string) {
        try {
            // Get contract data from backend
            const response = await axios.post<{ success: boolean; data: { contractAddress: string; contractABI: string } }>('/api/certificates/prepare-verification', {
                certificateNumber
            });

            if (!response.data.success) {
                throw new Error('Failed to prepare verification data');
            }

            const { contractAddress, contractABI } = response.data.data;

            // Initialize contract with received data
            await this.initializeContract(contractAddress, contractABI);

            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const result = await this.contract.verifyCertificate(certificateNumber);
            return {
                exists: result.exists,
                isValid: result.isValid,
                issuer: result.issuer,
                recipient: result.recipient,
                issuedAt: result.issuedAt.toString(),
                courseId: result.courseId,
                courseName: result.courseName,
                recipientName: result.recipientName
            };
        } catch (error) {
            console.error('Error verifying certificate:', error);
            throw error;
        }
    }

    public async checkNetwork(): Promise<boolean> {
        if (!this.signer) {
            throw new Error('Signer not initialized');
        }

        const provider = this.signer.provider as BrowserProvider;
        const network = await provider.getNetwork();
        const chainId = parseInt(import.meta.env.VITE_CHAIN_ID || '11155111');
        return network.chainId === BigInt(chainId);
    }
} 