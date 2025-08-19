<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Prescription extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'consultation_id',
        'titulo',
        'tipo',
        'data_emissao',
        'expiration_date',
        'medicamentos',
        'medications',
        'general_instructions',
        'status',
        'pdf_url',
        'additional_notes',
    ];

    protected $casts = [
        'data_emissao' => 'datetime',
        'expiration_date' => 'datetime',
        'medicamentos' => 'array',
        'medications' => 'array',
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

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function consultations(): HasMany
    {
        return $this->hasMany(Consultation::class);
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('tipo', $type);
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['active', 'Ativa']);
    }

    public function scopeExpired($query)
    {
        return $query->where('expiration_date', '<', now());
    }
}