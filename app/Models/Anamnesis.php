<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Anamnesis extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'anamneses';

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'anamnese_date',
        'chief_complaint',
        'illness_history',
        'medical_history',
        'surgical_history',
        'family_history',
        'social_history',
        'current_medications',
        'allergies',
        'systems_review',
        'physical_exam',
        'diagnosis',
        'treatment_plan',
        'additional_notes',
    ];

    protected $casts = [
        'anamnese_date' => 'datetime',
        'medical_history' => 'array',
        'surgical_history' => 'array',
        'social_history' => 'array',
        'current_medications' => 'array',
        'allergies' => 'array',
        'systems_review' => 'array',
        'physical_exam' => 'array',
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
}
