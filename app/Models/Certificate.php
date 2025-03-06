<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Certificate extends Model
{
    use SoftDeletes;
    protected $fillable = [
        'certificate_number',
        'recipient_address',
        'course_id',
        'course_name',
        'recipient_name',
        'contract_address',
        'contract_abi'
    ];
}
