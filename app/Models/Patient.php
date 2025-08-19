<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'nome',
        'data_nascimento',
        'celular',
        'fixo',
        'email',
        'endereco',
        'cidade',
        'estado',
        'cep',
        'tipo_sanguineo',
        'patient_name',
        'patient_age',
        'patient_gender',
        'patient_phone',
        'patient_email',
        'patient_address',
        'patient_cpf',
        'patient_rg',
        'blood_type',
        'height_cm',
        'weight_kg',
        'is_smoker',
        'is_alcohol_consumer',
        'allergies',
        'congenital_diseases',
        'chronic_diseases',
        'medications',
        'surgical_history',
        'family_history',
        'vital_signs',
        'emergency_contact',
        'health_insurance',
        'doctor_id',
        'notes',
        'last_consultation_date',
        'favorite',
    ];

    protected $casts = [
        'data_nascimento' => 'date',
        'patient_age' => 'integer',
        'height_cm' => 'integer',
        'weight_kg' => 'float',
        'is_smoker' => 'boolean',
        'is_alcohol_consumer' => 'boolean',
        'allergies' => 'array',
        'congenital_diseases' => 'array',
        'chronic_diseases' => 'array',
        'medications' => 'array',
        'surgical_history' => 'array',
        'family_history' => 'array',
        'vital_signs' => 'array',
        'emergency_contact' => 'array',
        'health_insurance' => 'array',
        'last_consultation_date' => 'datetime',
        'favorite' => 'boolean',
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
    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function consultations(): HasMany
    {
        return $this->hasMany(Consultation::class);
    }

    public function anamneses(): HasMany
    {
        return $this->hasMany(Anamnesis::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }

    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class);
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function medicalRecord(): HasMany
    {
        return $this->hasMany(MedicalRecord::class);
    }

    // Accessors & Mutators
    public function getFullNameAttribute(): string
    {
        return $this->nome ?: $this->patient_name;
    }

    public function getPhoneAttribute(): string
    {
        return $this->celular ?: $this->patient_phone;
    }

    public function getAgeAttribute(): int
    {
        if ($this->data_nascimento) {
            return $this->data_nascimento->age;
        }
        return $this->patient_age ?: 0;
    }
}