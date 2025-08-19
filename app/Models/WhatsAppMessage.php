<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class WhatsAppMessage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'to',
        'message',
        'type',
        'template_name',
        'template_params',
        'status',
        'message_id',
        'error',
        'sent_at',
        'delivered_at',
        'read_at',
    ];

    protected $casts = [
        'template_params' => 'array',
        'error' => 'array',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
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
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
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

    public function markAsDelivered(): void
    {
        $this->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);
    }

    public function markAsRead(): void
    {
        $this->update([
            'status' => 'read',
            'read_at' => now(),
        ]);
    }

    public function markAsFailed(array $error): void
    {
        $this->update([
            'status' => 'failed',
            'error' => $error,
        ]);
    }

    // Accessors
    public function getFormattedPhoneAttribute(): string
    {
        // Remove caracteres não numéricos
        $phone = preg_replace('/\D/', '', $this->to);
        
        // Formatar para exibição
        if (strlen($phone) === 13 && substr($phone, 0, 2) === '55') {
            return '+' . substr($phone, 0, 2) . ' ' . substr($phone, 2, 2) . ' ' . substr($phone, 4);
        }
        
        return $this->to;
    }
}