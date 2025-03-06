<?php

use App\Http\Controllers\Api\CertificateController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('certificates')->group(function () {
    Route::post('/prepare-issuance', [CertificateController::class, 'prepareIssuance']);
    Route::get('/generate-number', [CertificateController::class, 'generateCertificateNumber']);
    Route::post('/prepare-verification', [CertificateController::class, 'prepareVerification']);
    Route::post('/verify', [CertificateController::class, 'verify']);
}); 
