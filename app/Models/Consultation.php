<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Consultation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'consultation_date',
        'consultation_time',
        'consultation_duration',
        'consultation_type',
        'room_link',
        'status',
        'reason_for_visit',
        'clinical_notes',
        'diagnosis',
        'procedures_performed',
        'referrals',
        'prescription_id',
        'exams_requested',
        'follow_up',
        'additional_notes',
    ];

    protected $casts = [
        'consultation_date' => 'datetime',
        'consultation_duration' => 'integer',
        'procedures_performed' => 'array',
        'referrals' => 'array',
        'exams_requested' => 'array',
        'follow_up' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            $model->{$model->getKeyName()} = (string) Str::uuid();
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

    public function prescription(): BelongsTo
    {
        return $this->belongsTo(Prescription::class);
    }

    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class);
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('consultation_type', $type);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('consultation_date', today());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('consultation_date', '>=', now());
    }

    // Accessors
    public function getFullDateTimeAttribute()
    {
        return $this->consultation_date->format('Y-m-d') . ' ' . $this->consultation_time;
    }
}