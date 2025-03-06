<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\CertificateController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Route::middleware(['auth'])->group(function () {
    Route::get('/', function () {
        return redirect()->route('certificates.issue');
    });

    Route::get('/certificates/issue', [CertificateController::class, 'issue'])->name('certificates.issue');
    Route::get('/certificates/verify', [CertificateController::class, 'verify'])->name('certificates.verify');
    Route::get('/certificates/generate-number', [CertificateController::class, 'generateCertificateNumber'])->name('certificates.generate-number');
// });

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
