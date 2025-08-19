<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Medication extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'medication_name',
        'active_ingredient',
        'dosage',
        'form',
        'route',
        'frequency',
        'duration',
        'instructions',
        'side_effects',
        'contraindications',
        'interactions',
        'is_controlled',
        'controlled_type',
    ];

    protected $casts = [
        'side_effects' => 'array',
        'contraindications' => 'array',
        'interactions' => 'array',
        'is_controlled' => 'boolean',
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
    public function prescriptionMedications(): HasMany
    {
        return $this->hasMany(PrescriptionMedication::class);
    }

    // Scopes
    public function scopeControlled($query)
    {
        return $query->where('is_controlled', true);
    }

    public function scopeByForm($query, $form)
    {
        return $query->where('form', $form);
    }

    public function scopeByRoute($query, $route)
    {
        return $query->where('route', $route);
    }
}