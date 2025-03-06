<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CertificateController extends Controller
{
    /**
     * Show the certificate issuance form.
     */
    public function issue()
    {
        return Inertia::render('Certificates/Issue');
    }

    /**
     * Show the certificate verification form.
     */
    public function verify()
    {
        return Inertia::render('Certificates/Verify');
    }

    /**
     * Generate a unique certificate number.
     */
    public function generateCertificateNumber()
    {
        $prefix = 'CERT';
        $timestamp = now()->format('YmdHis');
        $random = strtoupper(substr(uniqid(), -4));
        return response()->json([
            'certificateNumber' => "{$prefix}-{$timestamp}-{$random}"
        ]);
    }
} 