<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class WhatsAppReminder extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'patient_id',
        'consultation_id',
        'patient_name',
        'patient_phone',
        'consultation_date',
        'consultation_time',
        'reminder_type',
        'reminder_time',
        'status',
        'message_id',
        'sent_at',
        'error',
        'scheduled_for',
    ];

    protected $casts = [
        'consultation_date' => 'datetime',
        'reminder_time' => 'integer',
        'sent_at' => 'datetime',
        'error' => 'array',
        'scheduled_for' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            $model->{$model->getKeyName()} = (string) Str::uuid();
            
            // Calcular quando o lembrete deve ser enviado
            if (!$model->scheduled_for && $model->consultation_date && $model->reminder_time) {
                $model->scheduled_for = $model->consultation_date->subHours($model->reminder_time);
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
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    // Scopes
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('reminder_type', $type);
    }

    public function scopeDueForSending($query)
    {
        return $query->where('status', 'scheduled')
                    ->where('scheduled_for', '<=', now());
    }

    // Methods
    public function markAsSent(string $messageId): void
    {
        $this->update([
            'status' => 'sent',
            'message_id' => $messageId,
            'sent_at' => now(),
        ]);
    }

    public function markAsFailed(array $error): void
    {
        $this->update([
            'status' => 'failed',
            'error' => $error,
        ]);
    }

    public function markAsCancelled(): void
    {
        $this->update(['status' => 'cancelled']);
    }

    // Accessors
    public function getReminderMessageAttribute(): string
    {
        $date = $this->consultation_date->format('d/m/Y');
        $time = $this->consultation_time;
        
        switch ($this->reminder_type) {
            case 'consultation':
                return "Olá {$this->patient_name}! Lembrete: você tem uma consulta agendada para {$date} às {$time}. Em caso de necessidade de reagendamento, entre em contato conosco.";
            case 'exam':
                return "Olá {$this->patient_name}! Lembrete: você tem um exame agendado para {$date} às {$time}. Não se esqueça de seguir as orientações de preparo.";
            case 'medication':
                return "Olá {$this->patient_name}! Lembrete: não se esqueça de tomar sua medicação conforme prescrito.";
            default:
                return "Olá {$this->patient_name}! Você tem um compromisso agendado para {$date} às {$time}.";
        }
    }

    public function getHoursUntilReminderAttribute(): int
    {
        return now()->diffInHours($this->scheduled_for, false);
    }
}