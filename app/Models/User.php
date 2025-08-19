<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'crm',
        'specialty',
        'clinic_name',
        'clinic_address',
        'avatar',
        'timezone',
        'locale',
        'notifications_enabled',
        'whatsapp_enabled',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'notifications_enabled' => 'boolean',
            'whatsapp_enabled' => 'boolean',
        ];
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (!$model->getKey()) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
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
    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class, 'doctor_id');
    }

    public function consultations(): HasMany
    {
        return $this->hasMany(Consultation::class, 'doctor_id');
    }

    public function anamneses(): HasMany
    {
        return $this->hasMany(Anamnesis::class, 'doctor_id');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class, 'doctor_id');
    }

    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class, 'doctor_id');
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class, 'doctor_id');
    }

    public function financialTransactions(): HasMany
    {
        return $this->hasMany(FinancialTransaction::class, 'user_id');
    }

    public function whatsappConnection(): HasMany
    {
        return $this->hasMany(WhatsAppConnection::class, 'user_id');
    }

    public function whatsappMessages(): HasMany
    {
        return $this->hasMany(WhatsAppMessage::class, 'user_id');
    }
}
