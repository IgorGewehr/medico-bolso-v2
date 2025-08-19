<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class MedicalRecord extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'patient_info',
        'health_summary',
        'consultation_ids',
        'anamnese_ids',
        'exam_ids',
        'prescription_ids',
        'last_updated',
    ];

    protected $casts = [
        'patient_info' => 'array',
        'health_summary' => 'array',
        'consultation_ids' => 'array',
        'anamnese_ids' => 'array',
        'exam_ids' => 'array',
        'prescription_ids' => 'array',
        'last_updated' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            $model->{$model->getKeyName()} = (string) Str::uuid();
        });

        static::updating(function ($model) {
            $model->last_updated = now();
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

    // Helper methods
    public function addConsultationId(string $consultationId): void
    {
        $ids = $this->consultation_ids ?: [];
        if (!in_array($consultationId, $ids)) {
            $ids[] = $consultationId;
            $this->update(['consultation_ids' => $ids]);
        }
    }

    public function addAnamneseId(string $anamneseId): void
    {
        $ids = $this->anamnese_ids ?: [];
        if (!in_array($anamneseId, $ids)) {
            $ids[] = $anamneseId;
            $this->update(['anamnese_ids' => $ids]);
        }
    }

    public function addExamId(string $examId): void
    {
        $ids = $this->exam_ids ?: [];
        if (!in_array($examId, $ids)) {
            $ids[] = $examId;
            $this->update(['exam_ids' => $ids]);
        }
    }

    public function addPrescriptionId(string $prescriptionId): void
    {
        $ids = $this->prescription_ids ?: [];
        if (!in_array($prescriptionId, $ids)) {
            $ids[] = $prescriptionId;
            $this->update(['prescription_ids' => $ids]);
        }
    }
}