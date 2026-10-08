<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Notification extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'type', 'title', 'message', 'read', 'timestamp', 'entity_id',
    ];

    protected $casts = [
        'read' => 'boolean',
        'timestamp' => 'datetime',
    ];
}
