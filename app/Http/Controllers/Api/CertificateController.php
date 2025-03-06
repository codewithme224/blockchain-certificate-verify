<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Services\BlockchainService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Exception;

class CertificateController extends Controller
{
    private BlockchainService $blockchainService;
    private $contractAddress;
    private $contractABI;
    private string $contractAbiPath;
    private array $contractAbi;

    public function __construct(BlockchainService $blockchainService)
    {
        $this->blockchainService = $blockchainService;
        $this->contractAddress = config('services.blockchain.contract_address');
        $this->contractABI = file_get_contents(base_path('resources/contracts/CertificateVerifier.json'));
        $this->contractAbiPath = resource_path('contracts/CertificateVerifier.json');
        $this->contractAbi = json_decode(file_get_contents($this->contractAbiPath), true);
    }

    /**
     * Prepare data for certificate issuance
     */
    public function prepareIssuance(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'certificateNumber' => 'required|string',
                'recipientAddress' => 'required|string',
                'courseId' => 'required|string',
                'courseName' => 'required|string',
                'recipientName' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $data = $this->blockchainService->prepareCertificateData(
                $request->certificateNumber,
                $request->recipientAddress,
                $request->courseId,
                $request->courseName,
                $request->recipientName
            );

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            Log::error('Certificate issuance preparation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }


    private function storeCertificate($certificateNumber, $recipientAddress, $courseId, $courseName, $recipientName)
    {
        $certificate = new Certificate();
        $certificate->certificate_number = $certificateNumber;
        $certificate->recipient_address = $recipientAddress;
        $certificate->course_id = $courseId;
    }

    /**
     * Generate a unique certificate number
     */
    public function generateCertificateNumber()
    {
        $prefix = 'CERT';
        $year = date('Y');
        
        // Get the current sequence from cache or start at 1
        $sequence = Cache::get('certificate_sequence', 0) + 1;
        Cache::put('certificate_sequence', $sequence, now()->addYear());
        
        // Format: CERT-2024-001
        $certificateNumber = sprintf("%s-%s-%03d", $prefix, $year, $sequence);
        
        return response()->json([
            'success' => true,
            'data' => [
                'certificateNumber' => $certificateNumber
            ]
        ]);
    }

    public function prepareVerification(Request $request)
    {
        $request->validate([
            'certificateNumber' => 'required|string'
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'contractAddress' => $this->contractAddress,
                'contractABI' => $this->contractABI
            ]
        ]);
    }

    /**
     * Verify a certificate
     */
    public function verify(Request $request)
    {
        try {
            $request->validate([
                'certificateNumber' => 'required|string'
            ]);

            $certificateNumber = $request->input('certificateNumber');

            Log::info('Verifying certificate', [
                'certificateNumber' => $certificateNumber
            ]);

            // Fetch certificate from database
            $certificate = Certificate::where('certificate_number', $certificateNumber)->first();

            if (!$certificate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Certificate not found'
                ], 404);
            }

            // Return certificate details
            return response()->json([
                'success' => true,
                'data' => [
                    'certificateNumber' => $certificate->certificate_number,
                    'recipientName' => $certificate->recipient_name,
                    'recipientAddress' => $certificate->recipient_address,
                    'courseId' => $certificate->course_id,
                    'courseName' => $certificate->course_name,
                    'issuedAt' => $certificate->created_at->timestamp,
                    'exists' => true,
                    'isValid' => true
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Certificate verification failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
} 