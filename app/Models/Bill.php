<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Bill extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'description',
        'amount',
        'due_date',
        'category',
        'status',
        'paid_at',
        'barcode',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
        'paid_at' => 'datetime',
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
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue')
                    ->orWhere(function ($q) {
                        $q->where('status', 'pending')
                          ->where('due_date', '<', now());
                    });
    }

    public function scopeDueThisMonth($query)
    {
        return $query->whereMonth('due_date', now()->month)
                    ->whereYear('due_date', now()->year);
    }

    // Accessors
    public function getIsOverdueAttribute(): bool
    {
        return $this->status === 'pending' && $this->due_date->isPast();
    }

    public function getDaysUntilDueAttribute(): int
    {
        return now()->diffInDays($this->due_date, false);
    }

    // Methods
    public function markAsPaid(): void
    {
        $this->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }

    public function markAsOverdue(): void
    {
        if ($this->status === 'pending' && $this->due_date->isPast()) {
            $this->update(['status' => 'overdue']);
        }
    }
}