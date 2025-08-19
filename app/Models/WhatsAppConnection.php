<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class WhatsAppConnection extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'session_id',
        'status',
        'connected',
        'qr_code',
        'phone_number',
        'device_info',
        'connected_at',
        'expires_at',
    ];

    protected $casts = [
        'connected' => 'boolean',
        'device_info' => 'array',
        'connected_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            $model->{$model->getKeyName()} = (string) Str::uuid();
            if (!$model->session_id) {
                $model->session_id = 'session_' . Str::random(16);
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

    public function messages(): HasMany
    {
        return $this->hasMany(WhatsAppMessage::class, 'user_id', 'user_id');
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(WhatsAppReminder::class, 'user_id', 'user_id');
    }

    // Scopes
    public function scopeConnected($query)
    {
        return $query->where('connected', true);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'connected')
                    ->where('connected', true);
    }

    // Methods
    public function markAsConnected(string $phoneNumber): void
    {
        $this->update([
            'status' => 'connected',
            'connected' => true,
            'phone_number' => $phoneNumber,
            'connected_at' => now(),
            'qr_code' => null,
        ]);
    }

    public function markAsDisconnected(): void
    {
        $this->update([
            'status' => 'disconnected',
            'connected' => false,
            'connected_at' => null,
        ]);
    }

    public function updateQRCode(string $qrCode): void
    {
        $this->update([
            'qr_code' => $qrCode,
            'status' => 'waiting_for_qr_scan',
            'expires_at' => now()->addMinutes(2), // QR expires in 2 minutes
        ]);
    }

    // Accessors
    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
}