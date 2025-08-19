<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Note extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'note_title',
        'note_text',
        'consultation_date',
        'note_type',
        'is_important',
        'attachments',
        'last_modified',
        'modified_by',
        'view_count',
    ];

    protected $casts = [
        'consultation_date' => 'datetime',
        'is_important' => 'boolean',
        'attachments' => 'array',
        'last_modified' => 'datetime',
        'view_count' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            $model->{$model->getKeyName()} = (string) Str::uuid();
        });

        static::updating(function ($model) {
            $model->last_modified = now();
        });
    }

    public function getIncrementing()
    {
        return false;
    }

    public function getKeyType()
    {
        return 'string';
    }

    // Relationships
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function modifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'modified_by');
    }

    // Scopes
    public function scopeImportant($query)
    {
        return $query->where('is_important', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('note_type', $type);
    }

    // Methods
    public function incrementViewCount()
    {
        $this->increment('view_count');
    }
}