<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ScheduleSlot extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'slot_id',
        'patient_id',
        'doctor_id',
        'schedule_date',
        'start_time',
        'end_time',
        'duration',
        'status',
        'patient_name',
        'patient_phone',
        'appointment_type',
        'appointment_reason',
        'notes',
    ];

    protected $casts = [
        'schedule_date' => 'date',
        'duration' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            $model->{$model->getKeyName()} = (string) Str::uuid();
            if (!$model->slot_id) {
                $model->slot_id = (string) Str::uuid();
            }
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

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'Disponível');
    }

    public function scopeBooked($query)
    {
        return $query->where('status', 'Agendado');
    }

    public function scopeForDate($query, $date)
    {
        return $query->whereDate('schedule_date', $date);
    }

    // Accessors
    public function getTimeSlotAttribute()
    {
        return $this->start_time . ' - ' . $this->end_time;
    }
}