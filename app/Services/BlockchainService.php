<?php

namespace App\Services;

use App\Models\Certificate;
use Illuminate\Support\Facades\Log;
use Exception;

class BlockchainService
{
    private string $contractAddress;
    private string $contractABI;

    public function __construct()
    {
        $this->contractAddress = config('blockchain.contract_address');
        $this->contractABI = json_encode($this->getContractABI());
    }

    /**
     * Prepare certificate data for blockchain
     */
    public function prepareCertificateData(
        string $certificateNumber,
        string $recipientAddress,
        string $courseId,
        string $courseName,
        string $recipientName
    ): array {
        try {
            // Validate Ethereum address format
            if (!preg_match('/^0x[a-fA-F0-9]{40}$/', $recipientAddress)) {
                throw new Exception("Invalid Ethereum address format for recipient");
            }
            $this->storeData($certificateNumber, $recipientAddress, $courseId, $courseName, $recipientName, $this->contractAddress, $this->contractABI,);
            return [
                'certificateNumber' => $certificateNumber,
                'recipientAddress' => $recipientAddress,
                'courseId' => $courseId,
                'courseName' => $courseName,
                'recipientName' => $recipientName,
                'contractAddress' => $this->contractAddress,
                'contractABI' => $this->contractABI
            ];
            
        } catch (Exception $e) {
            Log::error("Failed to prepare certificate data", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }


    public function storeData($certificateNumber, $recipientAddress, $courseId, $courseName, $recipientName, $contractAddress, $contractABI)
    {
        $certificate = new Certificate();
        $certificate->certificate_number = $certificateNumber;
        $certificate->recipient_address = $recipientAddress;
        $certificate->course_id = $courseId;
        $certificate->course_name = $courseName;
        $certificate->recipient_name = $recipientName;
        $certificate->contract_address = $contractAddress;
        $certificate->contract_abi = $contractABI;
        $certificate->save();
    }

    /**
     * Fetch certificate data by certificate number
     */
    public function getCertificateData(string $certificateNumber): ?array
    {
        try {
            $certificate = Certificate::where('certificate_number', $certificateNumber)->first();
            
            if (!$certificate) {
                return null;
            }

            return [
                'success' => true,
                'data' => [
                    'contractAddress' => $certificate->contract_address,
                    'contractABI' => $certificate->contract_abi,
                    'recipientAddress' => $certificate->recipient_address,
                    'courseId' => $certificate->course_id,
                    'courseName' => $certificate->course_name,
                    'recipientName' => $certificate->recipient_name
                ]
            ];
        } catch (Exception $e) {
            Log::error("Failed to fetch certificate data", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Get the contract ABI
     */
    private function getContractABI(): array
    {
        $abiPath = base_path('blockchain/artifacts/contracts/CertificateVerifier.sol/CertificateVerifier.json');
        $contractData = json_decode(file_get_contents($abiPath), true);
        return $contractData['abi'];
    }
} 