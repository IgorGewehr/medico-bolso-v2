<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class RecurringTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'description',
        'amount',
        'type',
        'category',
        'frequency',
        'start_date',
        'end_date',
        'day_of_month',
        'is_active',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'day_of_month' => 'integer',
        'is_active' => 'boolean',
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
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByFrequency($query, $frequency)
    {
        return $query->where('frequency', $frequency);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Methods
    public function getNextExecutionDate()
    {
        $now = now();
        
        switch ($this->frequency) {
            case 'daily':
                return $now->addDay();
            case 'weekly':
                return $now->addWeek();
            case 'monthly':
                return $now->day($this->day_of_month)->addMonth();
            case 'yearly':
                return $now->addYear();
            default:
                return null;
        }
    }
}