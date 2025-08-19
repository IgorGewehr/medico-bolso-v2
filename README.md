# 🏥 Médico no Bolso v2.0
## Guia Completo de Arquitetura Laravel/React

> **Sistema de Gestão Médica Profissional com Arquitetura Moderna**  
> Reconstruído do zero seguindo as melhores práticas de desenvolvimento

![Laravel](https://img.shields.io/badge/Laravel-11-red.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![MUI](https://img.shields.io/badge/MUI-6-blue.svg)
![PHP](https://img.shields.io/badge/PHP-8.3-purple.svg)

---

## 📋 **Índice**

1. [Stack Tecnológica](#stack-tecnológica)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Estrutura de Diretórios](#estrutura-de-diretórios)
4. [Padrões e Convenções](#padrões-e-convenções)
5. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
6. [Sistema de Autenticação](#sistema-de-autenticação)
7. [Sistema de Permissões](#sistema-de-permissões)
8. [APIs e Endpoints](#apis-e-endpoints)
9. [Frontend com React](#frontend-com-react)
10. [Serviços e Integrações](#serviços-e-integrações)
11. [Testes Automatizados](#testes-automatizados)
12. [Deploy e DevOps](#deploy-e-devops)
13. [Monitoramento e Logs](#monitoramento-e-logs)
14. [Documentação](#documentação)

---

## 🛠️ **Stack Tecnológica**

### **Backend**
```php
Laravel 11           - Framework principal
PHP 8.3+            - Linguagem
MySQL 8.0           - Banco de dados principal  
Redis 7.0           - Cache e filas
Laravel Sanctum     - Autenticação API
Laravel Horizon     - Monitoramento de filas
Laravel Telescope   - Debug e profiling
```

### **Frontend**
```javascript
React 18            - Framework frontend
Inertia.js          - SPA sem API complexity
TypeScript 5        - Tipagem estática
Material-UI (MUI) 6 - Sistema de design completo
Vite 7              - Build tool e desenvolvimento
```

### **Integrações**
```php
Stripe              - Pagamentos
OpenAI              - IA Médica
WhatsApp Business   - Comunicação
AWS S3              - Armazenamento de arquivos
Redis               - Cache e sessões
ElasticSearch       - Busca avançada (opcional)
```

### **DevOps & Qualidade**
```bash
PHPUnit             - Testes PHP
Pest                - Testes mais limpos
Larastan            - Análise estática
PHP CS Fixer        - Code style
GitHub Actions      - CI/CD
Docker              - Containerização
Nginx               - Servidor web
Supervisor          - Gerenciamento de processos
```

---

## 🏗️ **Arquitetura do Sistema**

### **Padrões Arquiteturais**

#### **1. Clean Architecture + DDD**
```
Apresentação (Controllers/Views)
    ↓
Aplicação (Services/Use Cases)
    ↓
Domínio (Models/Entities)
    ↓
Infraestrutura (Repositories/External APIs)
```

#### **2. CQRS (Command Query Responsibility Segregation)**
```php
// Commands - Modificam estado
CreatePatientCommand
UpdateConsultationCommand
ProcessPaymentCommand

// Queries - Leem dados
GetPatientQuery  
GetConsultationsQuery
GetFinancialReportQuery
```

#### **3. Event-Driven Architecture**
```php
// Events
PatientCreated
ConsultationScheduled
PaymentProcessed
SubscriptionUpdated

// Listeners
SendWelcomeEmail
CreateInitialConsultation
UpdateFinancialMetrics
SyncWithStripe
```

#### **4. Repository Pattern**
```php
// Interface
interface PatientRepositoryInterface
{
    public function findByDoctor(int $doctorId): Collection;
    public function createWithRelations(array $data): Patient;
}

// Implementation
class EloquentPatientRepository implements PatientRepositoryInterface
{
    // Implementação específica do Eloquent
}
```

---

## 📁 **Estrutura de Diretórios**

### **Backend (Laravel)**
```
app/
├── Actions/                    # Single-purpose actions
│   ├── Patients/
│   │   ├── CreatePatientAction.php
│   │   ├── UpdatePatientAction.php
│   │   └── DeletePatientAction.php
│   ├── Consultations/
│   ├── Payments/
│   └── Reports/
├── Console/
│   ├── Commands/               # Artisan commands
│   └── Kernel.php
├── Data/                       # DTOs (Data Transfer Objects)
│   ├── PatientData.php
│   ├── ConsultationData.php
│   └── PaymentData.php
├── Enums/                      # PHP 8.1+ Enums
│   ├── PlanType.php
│   ├── ConsultationStatus.php
│   └── TransactionType.php
├── Events/                     # Domain events
│   ├── PatientCreated.php
│   ├── ConsultationCompleted.php
│   └── SubscriptionChanged.php
├── Exceptions/                 # Custom exceptions
│   ├── PatientNotFoundException.php
│   ├── InvalidPermissionException.php
│   └── PaymentFailedException.php
├── Http/
│   ├── Controllers/
│   │   ├── Api/               # API controllers
│   │   │   ├── V1/
│   │   │   │   ├── PatientController.php
│   │   │   │   ├── ConsultationController.php
│   │   │   │   └── PaymentController.php
│   │   │   └── V2/           # Versioning
│   │   ├── Web/              # Web controllers (Inertia)
│   │   │   ├── DashboardController.php
│   │   │   ├── PatientController.php
│   │   │   └── SettingsController.php
│   │   └── Webhooks/         # Webhook controllers
│   │       ├── StripeWebhookController.php
│   │       └── WhatsAppWebhookController.php
│   ├── Middleware/
│   │   ├── CheckPlanLimits.php
│   │   ├── CheckModuleAccess.php
│   │   ├── EnsureEmailIsVerified.php
│   │   └── HandleInertiaRequests.php
│   ├── Requests/              # Form requests
│   │   ├── Patients/
│   │   │   ├── StorePatientRequest.php
│   │   │   └── UpdatePatientRequest.php
│   │   ├── Consultations/
│   │   └── Auth/
│   ├── Resources/             # API resources
│   │   ├── PatientResource.php
│   │   ├── ConsultationResource.php
│   │   └── Collections/
│   └── Responses/             # Custom responses
├── Jobs/                      # Queue jobs
│   ├── SendWhatsAppReminder.php
│   ├── ProcessAiAnalysis.php
│   ├── GenerateMonthlyReport.php
│   └── SyncStripeCustomer.php
├── Listeners/                 # Event listeners
│   ├── SendWelcomeEmail.php
│   ├── CreateStripeCustomer.php
│   └── UpdateUserModules.php
├── Mail/                      # Mail classes
│   ├── WelcomeMail.php
│   ├── ConsultationReminder.php
│   └── PaymentConfirmation.php
├── Models/                    # Eloquent models
│   ├── User.php
│   ├── Patient.php
│   ├── Consultation.php
│   ├── Prescription.php
│   ├── FinancialTransaction.php
│   ├── Secretary.php
│   └── Traits/
│       ├── HasModules.php
│       ├── BelongsToDoctor.php
│       └── HasUuid.php
├── Notifications/             # Notifications
│   ├── ConsultationScheduled.php
│   ├── PaymentDue.php
│   └── ExamResultReady.php
├── Observers/                 # Model observers
│   ├── PatientObserver.php
│   ├── ConsultationObserver.php
│   └── UserObserver.php
├── Policies/                  # Authorization policies
│   ├── PatientPolicy.php
│   ├── ConsultationPolicy.php
│   └── SecretaryPolicy.php
├── Providers/
│   ├── AppServiceProvider.php
│   ├── AuthServiceProvider.php
│   ├── EventServiceProvider.php
│   └── RepositoryServiceProvider.php
├── Queries/                   # Query builders complexos
│   ├── PatientQuery.php
│   ├── ConsultationQuery.php
│   └── FinancialQuery.php
├── Repositories/              # Repository pattern
│   ├── Contracts/
│   │   ├── PatientRepositoryInterface.php
│   │   ├── ConsultationRepositoryInterface.php
│   │   └── PaymentRepositoryInterface.php
│   └── Eloquent/
│       ├── PatientRepository.php
│       ├── ConsultationRepository.php
│       └── PaymentRepository.php
├── Services/                  # Business logic services
│   ├── AI/
│   │   ├── ExamAnalysisService.php
│   │   ├── MedicalChatService.php
│   │   └── AudioTranscriptionService.php
│   ├── Communication/
│   │   ├── WhatsAppService.php
│   │   ├── EmailService.php
│   │   └── NotificationService.php
│   ├── Financial/
│   │   ├── StripeService.php
│   │   ├── BillingService.php
│   │   └── ReportService.php
│   ├── Medical/
│   │   ├── PatientService.php
│   │   ├── ConsultationService.php
│   │   └── PrescriptionService.php
│   └── Core/
│       ├── ModuleService.php
│       ├── PermissionService.php
│       └── AuditService.php
├── States/                    # State machines
│   ├── ConsultationState.php
│   ├── PaymentState.php
│   └── SubscriptionState.php
└── Support/                   # Helpers e utilities
    ├── Helpers/
    │   ├── DateHelper.php
    │   ├── MoneyHelper.php
    │   └── FileHelper.php
    ├── Macros/
    └── Traits/
```

### **Frontend (React + Inertia)**
```
resources/
├── js/
│   ├── Components/           # Componentes reutilizáveis
│   │   ├── Base/            # Componentes básicos
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Table.tsx
│   │   ├── Forms/           # Componentes de formulário
│   │   │   ├── PatientForm.tsx
│   │   │   ├── ConsultationForm.tsx
│   │   │   └── PrescriptionForm.tsx
│   │   ├── Layout/          # Componentes de layout
│   │   │   ├── AppLayout.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── Medical/         # Componentes específicos
│   │   │   ├── PatientCard.tsx
│   │   │   ├── ConsultationCard.tsx
│   │   │   ├── ExamAnalysis.tsx
│   │   │   └── AIChat.tsx
│   │   └── Charts/          # Componentes de gráficos
│   │       ├── LineChart.tsx
│   │       ├── BarChart.tsx
│   │       └── PieChart.tsx
│   ├── Hooks/         # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── usePatients.ts
│   │   ├── usePermissions.ts
│   │   ├── useAPI.ts
│   │   └── useModals.ts
│   ├── Layouts/             # Layouts principais
│   │   ├── AppLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   └── GuestLayout.tsx
│   ├── Pages/               # Páginas (Inertia)
│   │   ├── Auth/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ForgotPassword.tsx
│   │   ├── Dashboard/
│   │   │   └── Index.tsx
│   │   ├── Patients/
│   │   │   ├── Index.tsx
│   │   │   ├── Show.tsx
│   │   │   ├── Create.tsx
│   │   │   └── Edit.tsx
│   │   ├── Consultations/
│   │   ├── Financial/
│   │   ├── Reports/
│   │   └── Settings/
│   ├── Context/             # React Context providers
│   │   ├── auth.ts
│   │   ├── patients.ts
│   │   ├── consultations.ts
│   │   ├── notifications.ts
│   │   └── ui.ts
│   ├── Types/               # TypeScript types
│   │   ├── models.ts
│   │   ├── api.ts
│   │   └── global.ts
│   ├── Utils/               # Utilitários
│   │   ├── api.ts
│   │   ├── helpers.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   └── app.ts               # Ponto de entrada
├── css/
│   └── app.css              # Material-UI (MUI)
└── views/
    └── app.blade.php        # Template principal
```

---

## 📋 **Padrões e Convenções**

### **PHP/Laravel Conventions**

#### **1. Naming Conventions**
```php
// Classes - PascalCase
class PatientService {}
class CreatePatientAction {}

// Methods - camelCase
public function createPatient() {}
public function getActiveConsultations() {}

// Variables - camelCase
$patientData = [];
$consultationList = [];

// Constants - UPPER_SNAKE_CASE
const MAX_PATIENTS_FREE_PLAN = 50;
const DEFAULT_CONSULTATION_DURATION = 30;

// Database - snake_case
'first_name', 'last_name', 'created_at'
```

#### **2. File Organization**
```php
<?php

declare(strict_types=1);

namespace App\Services\Medical;

use App\Models\Patient;
use App\Data\PatientData;
use App\Events\PatientCreated;
use App\Exceptions\PatientNotFoundException;
use Illuminate\Support\Collection;

/**
 * Service responsible for patient management
 * 
 * @author Your Name
 * @since 1.0.0
 */
final class PatientService
{
    public function __construct(
        private readonly PatientRepositoryInterface $patientRepository,
        private readonly PermissionService $permissionService
    ) {}
    
    /**
     * Create a new patient
     * 
     * @throws InvalidPermissionException
     * @throws ValidationException
     */
    public function create(PatientData $data, User $doctor): Patient
    {
        $this->permissionService->ensureCanCreatePatient($doctor);
        
        $patient = $this->patientRepository->create($data->toArray());
        
        event(new PatientCreated($patient));
        
        return $patient;
    }
}
```

#### **3. Resource Controllers Pattern**
```php
<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patients\StorePatientRequest;
use App\Http\Requests\Patients\UpdatePatientRequest;
use App\Services\Medical\PatientService;
use Inertia\Inertia;

class PatientController extends Controller
{
    public function __construct(
        private readonly PatientService $patientService
    ) {}

    public function index(): \Inertia\Response
    {
        return Inertia::render('Patients/Index', [
            'patients' => $this->patientService->getPaginatedForDoctor(auth()->user()),
            'can' => [
                'create' => auth()->user()->can('create', Patient::class),
                'export' => auth()->user()->can('export', Patient::class),
            ]
        ]);
    }

    public function store(StorePatientRequest $request): \Illuminate\Http\RedirectResponse
    {
        $this->patientService->create(
            PatientData::from($request->validated()),
            $request->user()
        );

        return redirect()->route('patients.index')
            ->with('success', 'Paciente criado com sucesso!');
    }
}
```

### **React/TypeScript Conventions**

#### **1. Component Structure**
```typescript
import React, { useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Box, 
  Button, 
  Chip 
} from '@mui/material';

interface PatientCardProps {
  patient: {
    name: string;
    phone: string;
    email: string;
    birthDate: string;
  };
  canEdit: boolean;
  onEdit: () => void;
}

export default function PatientCard({ patient, canEdit, onEdit }: PatientCardProps) {
  const patientAge = useMemo(() => {
    const today = new Date();
    const birthDate = new Date(patient.birthDate);
    return today.getFullYear() - birthDate.getFullYear();
  }, [patient.birthDate]);

  return (
    <Card elevation={2} sx={{ p: 2, '&:hover': { elevation: 4 } }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h3">
            {patient.name}
          </Typography>
          <Chip label={`${patientAge} anos`} size="small" />
        </Box>
        
        <Box mb={2}>
          <Typography variant="body2" color="text.secondary">
            {patient.phone}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {patient.email}
          </Typography>
        </Box>
        
        <CardActions>
          <Button 
            variant="contained"
            onClick={onEdit}
            disabled={!canEdit}
            size="small"
          >
            Editar
          </Button>
        </CardActions>
      </CardContent>
    </Card>
  );
}
```

// Interface já definida acima

const { can } = usePermissions()

const patientAge = useMemo(() => {
  // Cálculo da idade
  return new Date().getFullYear() - new Date(props.patient.birth_date).getFullYear()
})

const canEdit = useMemo(() => can('update', 'Patient'))

const editPatient = () => {
  // Lógica de edição
}
</script>

<style scoped>
// Usando MUI - estilos definidos inline com sx prop ou styled components
// Exemplo de styled component para customização avançada:

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
  transition: theme.transitions.create(['box-shadow']),
}));

// Ou usando sx prop diretamente nos componentes
</style>
```

#### **2. Hooks Pattern**
```typescript
// usePatients.ts
import { ref, computed } from 'react'
import { router } from '@inertiajs/react'
import type { Patient, PaginationMeta } from '@/Types/models'

export function usePatients() {
  const patients = ref<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const meta = ref<PaginationMeta | null>(null)
  
  const totalPatients = useMemo(() => meta?.total ?? 0)
  
  const fetchPatients = async (page = 1, filters = {}) => {
    loading = true
    
    try {
      router.get(route('patients.index'), 
        { page, ...filters },
        {
          preserveState: true,
          onSuccess: (data) => {
            patients = data.props.patients.data
            meta = data.props.patients.meta
          }
        }
      )
    } finally {
      loading = false
    }
  }
  
  const createPatient = async (data: Partial<Patient>) => {
    router.post(route('patients.store'), data, {
      onSuccess: () => {
        // Handle success
      },
      onError: () => {
        // Handle error
      }
    })
  }
  
  return {
    patients: readonly(patients),
    loading: readonly(loading),
    totalPatients,
    fetchPatients,
    createPatient
  }
}
```

### **Database Conventions**

#### **1. Migration Structure**
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('doctor_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('cpf', 14)->nullable()->index();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->json('address')->nullable();
            $table->json('medical_data')->nullable();
            $table->json('emergency_contact')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['doctor_id', 'created_at']);
            $table->index(['doctor_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
```

#### **2. Model Best Practices**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Traits\BelongsToDoctor;
use App\Models\Traits\HasUuid;

class Patient extends Model
{
    use HasFactory, SoftDeletes, BelongsToDoctor, HasUuid;

    protected $fillable = [
        'doctor_id',
        'name',
        'cpf',
        'birth_date',
        'gender',
        'phone',
        'email',
        'address',
        'medical_data',
        'emergency_contact',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'address' => 'array',
        'medical_data' => 'array',
        'emergency_contact' => 'array',
    ];

    protected $appends = [
        'age',
        'last_consultation_date',
    ];

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function consultations(): HasMany
    {
        return $this->hasMany(Consultation::class);
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function getAgeAttribute(): ?int
    {
        return $this->birth_date?->age;
    }

    public function getLastConsultationDateAttribute(): ?string
    {
        return $this->consultations()
            ->latest('consultation_date')
            ->value('consultation_date');
    }

    protected static function booted(): void
    {
        static::creating(function (Patient $patient) {
            $patient->uuid = Str::uuid();
        });
    }
}
```

---

## 🗄️ **Estrutura do Banco de Dados**

### **Schema Principal**

#### **Users (Médicos)**
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    crm VARCHAR(20) NULL,
    specialty VARCHAR(100) NULL,
    plan_type ENUM('free', 'monthly', 'quarterly', 'annual', 'enterprise') DEFAULT 'free',
    plan_expires_at TIMESTAMP NULL,
    stripe_customer_id VARCHAR(255) NULL,
    modules JSON NULL,
    settings JSON NULL,
    address JSON NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_plan_type (plan_type),
    INDEX idx_active (is_active),
    INDEX idx_created_at (created_at)
);
```

#### **Secretaries**
```sql
CREATE TABLE secretaries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) UNIQUE NOT NULL,
    doctor_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    permissions JSON NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);
```

#### **Patients**
```sql
CREATE TABLE patients (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) UNIQUE NOT NULL,
    doctor_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NULL,
    birth_date DATE NULL,
    gender ENUM('male', 'female', 'other') NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(255) NULL,
    address JSON NULL,
    medical_data JSON NULL,
    emergency_contact JSON NULL,
    notes TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_name (name),
    INDEX idx_cpf (cpf),
    INDEX idx_phone (phone),
    INDEX idx_doctor_created (doctor_id, created_at),
    FULLTEXT idx_search (name, notes)
);
```

#### **Consultations**
```sql
CREATE TABLE consultations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) UNIQUE NOT NULL,
    doctor_id BIGINT UNSIGNED NOT NULL,
    patient_id BIGINT UNSIGNED NOT NULL,
    consultation_date DATE NOT NULL,
    consultation_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    type ENUM('presencial', 'telemedicina', 'retorno') DEFAULT 'presencial',
    status ENUM('agendada', 'confirmada', 'em_andamento', 'concluida', 'cancelada', 'faltou') DEFAULT 'agendada',
    reason_for_visit TEXT NULL,
    clinical_notes TEXT NULL,
    diagnosis TEXT NULL,
    treatment_plan TEXT NULL,
    follow_up JSON NULL,
    attachments JSON NULL,
    price DECIMAL(10,2) NULL,
    paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    INDEX idx_doctor_date (doctor_id, consultation_date),
    INDEX idx_patient_date (patient_id, consultation_date),
    INDEX idx_status (status),
    INDEX idx_datetime (consultation_date, consultation_time),
    FULLTEXT idx_search (reason_for_visit, clinical_notes, diagnosis)
);
```

#### **Prescriptions**
```sql
CREATE TABLE prescriptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) UNIQUE NOT NULL,
    doctor_id BIGINT UNSIGNED NOT NULL,
    patient_id BIGINT UNSIGNED NOT NULL,
    consultation_id BIGINT UNSIGNED NULL,
    medications JSON NOT NULL,
    instructions TEXT NULL,
    observations TEXT NULL,
    valid_until DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE SET NULL,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_consultation_id (consultation_id),
    INDEX idx_created_at (created_at)
);
```

#### **Financial Transactions**
```sql
CREATE TABLE financial_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) UNIQUE NOT NULL,
    doctor_id BIGINT UNSIGNED NOT NULL,
    patient_id BIGINT UNSIGNED NULL,
    consultation_id BIGINT UNSIGNED NULL,
    type ENUM('income', 'expense') NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_date DATE NOT NULL,
    due_date DATE NULL,
    payment_date DATE NULL,
    payment_method ENUM('money', 'card', 'pix', 'bank_transfer', 'insurance') NULL,
    status ENUM('pending', 'paid', 'cancelled', 'overdue') DEFAULT 'pending',
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_config JSON NULL,
    attachments JSON NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE SET NULL,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_due_date (due_date),
    INDEX idx_doctor_date (doctor_id, transaction_date)
);
```

#### **Ai Conversations**
```sql
CREATE TABLE ai_conversations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) UNIQUE NOT NULL,
    doctor_id BIGINT UNSIGNED NOT NULL,
    patient_id BIGINT UNSIGNED NULL,
    type ENUM('medical_chat', 'exam_analysis', 'prescription_help', 'diagnosis_support') NOT NULL,
    title VARCHAR(255) NULL,
    messages JSON NOT NULL,
    context JSON NULL,
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(8,4) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
    INDEX idx_doctor_id (doctor_id),
    INDEX idx_patient_id (patient_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);
```

#### **Subscriptions**
```sql
CREATE TABLE subscriptions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    stripe_id VARCHAR(255) NOT NULL UNIQUE,
    stripe_status VARCHAR(255) NOT NULL,
    stripe_price VARCHAR(255) NULL,
    quantity INTEGER NULL,
    trial_ends_at TIMESTAMP NULL,
    ends_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_stripe_status (stripe_status)
);
```

---

## 🔐 **Sistema de Autenticação**

### **Configuração Laravel Sanctum**

#### **1. Configuração Básica**
```php
// config/sanctum.php
<?php

return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
        Sanctum::currentApplicationUrlWithPort()
    ))),

    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],

    'expiration' => null,
    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),
];
```

#### **2. Middleware de Autenticação**
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check() && !Auth::user()->is_active) {
            Auth::logout();
            
            return redirect()->route('login')
                ->withErrors(['account' => 'Sua conta foi desativada.']);
        }

        return $next($request);
    }
}
```

#### **3. Controllers de Autenticação**
```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\Auth\AuthService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    public function __construct(
        private readonly AuthService $authService
    ) {}

    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $user = $this->authService->authenticate(
            $request->only('email', 'password'),
            $request->boolean('remember')
        );

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        $this->authService->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
```

### **Sistema de Dois Fatores (2FA)**

#### **1. Migration**
```php
Schema::table('users', function (Blueprint $table) {
    $table->text('two_factor_secret')->nullable();
    $table->text('two_factor_recovery_codes')->nullable();
    $table->timestamp('two_factor_confirmed_at')->nullable();
});
```

#### **2. Service de 2FA**
```php
<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Collection;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;

class TwoFactorAuthService
{
    public function __construct(
        private readonly TwoFactorAuthenticationProvider $provider
    ) {}

    public function enable(User $user): array
    {
        $user->forceFill([
            'two_factor_secret' => encrypt($this->provider->generateSecretKey()),
            'two_factor_recovery_codes' => encrypt(json_encode(
                Collection::times(8, fn () => RecoveryCode::generate())
                    ->all()
            )),
        ])->save();

        return [
            'qr_code' => $this->generateQrCode($user),
            'secret_key' => $user->two_factor_secret,
            'recovery_codes' => json_decode(decrypt($user->two_factor_recovery_codes)),
        ];
    }

    private function generateQrCode(User $user): string
    {
        return $this->provider->qrCodeUrl(
            config('app.name'),
            $user->email,
            decrypt($user->two_factor_secret)
        );
    }
}
```

---

## 🛡️ **Sistema de Permissões**

### **Implementação com Laravel Gates & Policies**

#### **1. Enums para Planos e Módulos**
```php
<?php

namespace App\Enums;

enum PlanType: string
{
    case FREE = 'free';
    case MONTHLY = 'monthly';
    case QUARTERLY = 'quarterly';
    case ANNUAL = 'annual';
    case ENTERPRISE = 'enterprise';

    public function getModules(): array
    {
        return match($this) {
            self::FREE => [
                'patients' => ['read' => true, 'write' => true, 'limit' => 50],
                'consultations' => ['read' => true, 'write' => true],
                'prescriptions' => ['read' => true, 'write' => true],
            ],
            self::MONTHLY => [
                'patients' => ['read' => true, 'write' => true, 'limit' => 200],
                'consultations' => ['read' => true, 'write' => true],
                'prescriptions' => ['read' => true, 'write' => true],
                'financial' => ['read' => true, 'write' => true],
                'reports' => ['read' => true, 'write' => false],
            ],
            self::ANNUAL => [
                'patients' => ['read' => true, 'write' => true, 'limit' => 1000],
                'consultations' => ['read' => true, 'write' => true],
                'prescriptions' => ['read' => true, 'write' => true],
                'financial' => ['read' => true, 'write' => true],
                'reports' => ['read' => true, 'write' => true],
                'ai' => ['read' => true, 'write' => true],
                'secretaries' => ['read' => true, 'write' => true, 'limit' => 3],
            ],
            self::ENTERPRISE => [
                // Todos os módulos sem limites
                'patients' => ['read' => true, 'write' => true, 'limit' => -1],
                'consultations' => ['read' => true, 'write' => true],
                'prescriptions' => ['read' => true, 'write' => true],
                'financial' => ['read' => true, 'write' => true],
                'reports' => ['read' => true, 'write' => true],
                'ai' => ['read' => true, 'write' => true],
                'secretaries' => ['read' => true, 'write' => true, 'limit' => -1],
                'admin' => ['read' => true, 'write' => true],
            ],
        };
    }
}
```

#### **2. Service de Módulos**
```php
<?php

namespace App\Services\Core;

use App\Models\User;
use App\Enums\PlanType;

class ModuleService
{
    public function hasAccess(User $user, string $module, string $action = 'read'): bool
    {
        // Admin sempre tem acesso
        if ($user->is_admin) {
            return true;
        }

        // Secretária: verificar permissões específicas
        if ($user instanceof Secretary) {
            return $this->checkSecretaryPermissions($user, $module, $action);
        }

        // Médico: verificar módulos do plano
        $userModules = $user->modules ?? $this->getModulesForPlan($user->plan_type);
        
        return isset($userModules[$module][$action]) && $userModules[$module][$action] === true;
    }

    public function checkLimits(User $user, string $module): bool
    {
        $userModules = $user->modules ?? $this->getModulesForPlan($user->plan_type);
        
        if (!isset($userModules[$module]['limit'])) {
            return true;
        }

        $limit = $userModules[$module]['limit'];
        
        if ($limit === -1) {
            return true; // Sem limite
        }

        $currentCount = $this->getCurrentCount($user, $module);
        
        return $currentCount < $limit;
    }

    private function getCurrentCount(User $user, string $module): int
    {
        return match($module) {
            'patients' => $user->patients()->count(),
            'secretaries' => $user->secretaries()->count(),
            default => 0,
        };
    }

    private function checkSecretaryPermissions(Secretary $secretary, string $module, string $action): bool
    {
        return isset($secretary->permissions[$module][$action]) 
            && $secretary->permissions[$module][$action] === true;
    }

    private function getModulesForPlan(PlanType $planType): array
    {
        return $planType->getModules();
    }
}
```

#### **3. Policies**
```php
<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Patient;
use App\Services\Core\ModuleService;

class PatientPolicy
{
    public function __construct(
        private readonly ModuleService $moduleService
    ) {}

    public function viewAny(User $user): bool
    {
        return $this->moduleService->hasAccess($user, 'patients', 'read');
    }

    public function view(User $user, Patient $patient): bool
    {
        return $this->belongsToUser($user, $patient) 
            && $this->moduleService->hasAccess($user, 'patients', 'read');
    }

    public function create(User $user): bool
    {
        return $this->moduleService->hasAccess($user, 'patients', 'write')
            && $this->moduleService->checkLimits($user, 'patients');
    }

    public function update(User $user, Patient $patient): bool
    {
        return $this->belongsToUser($user, $patient)
            && $this->moduleService->hasAccess($user, 'patients', 'write');
    }

    public function delete(User $user, Patient $patient): bool
    {
        return $this->belongsToUser($user, $patient)
            && $this->moduleService->hasAccess($user, 'patients', 'write');
    }

    private function belongsToUser(User $user, Patient $patient): bool
    {
        if ($user instanceof Secretary) {
            return $patient->doctor_id === $user->doctor_id;
        }

        return $patient->doctor_id === $user->id;
    }
}
```

#### **4. Middleware de Verificação**
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\Core\ModuleService;

class CheckModuleAccess
{
    public function __construct(
        private readonly ModuleService $moduleService
    ) {}

    public function handle(Request $request, Closure $next, string $module, string $action = 'read')
    {
        $user = $request->user();

        if (!$this->moduleService->hasAccess($user, $module, $action)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Acesso negado a este módulo.',
                    'required_module' => $module,
                    'required_action' => $action,
                ], 403);
            }

            return redirect()->route('dashboard')
                ->with('error', 'Você não tem permissão para acessar este módulo.');
        }

        return $next($request);
    }
}
```

---

## 🚀 **APIs e Endpoints**

### **Estrutura da API**

#### **1. API Routes (Versioned)**
```php
<?php

// routes/api.php
use Illuminate\Support\Facades\Route;

// V1 API Routes
Route::prefix('v1')->name('api.v1.')->group(function () {
    // Auth routes
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('login', [AuthController::class, 'login'])->name('login');
        Route::post('register', [AuthController::class, 'register'])->name('register');
        Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum')->name('logout');
        Route::post('refresh', [AuthController::class, 'refresh'])->middleware('auth:sanctum')->name('refresh');
    });

    // Protected routes
    Route::middleware(['auth:sanctum', 'active'])->group(function () {
        // Patients
        Route::apiResource('patients', PatientController::class)
            ->middleware('module:patients');
        
        // Consultations
        Route::apiResource('consultations', ConsultationController::class)
            ->middleware('module:consultations');
        
        // Financial
        Route::prefix('financial')->name('financial.')->group(function () {
            Route::get('dashboard', [FinancialController::class, 'dashboard']);
            Route::get('transactions', [FinancialController::class, 'transactions']);
            Route::post('transactions', [FinancialController::class, 'store']);
            Route::get('reports/{period}', [FinancialController::class, 'reports']);
        })->middleware('module:financial');

        // AI Services
        Route::prefix('ai')->name('ai.')->group(function () {
            Route::post('chat', [AIController::class, 'chat']);
            Route::post('analyze-exam', [AIController::class, 'analyzeExam']);
            Route::post('transcribe-audio', [AIController::class, 'transcribeAudio']);
        })->middleware('module:ai');
    });
});
```

#### **2. API Controllers**
```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Patients\StorePatientRequest;
use App\Http\Requests\Patients\UpdatePatientRequest;
use App\Http\Resources\PatientResource;
use App\Services\Medical\PatientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function __construct(
        private readonly PatientService $patientService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Patient::class);

        $patients = $this->patientService->getPaginatedForDoctor(
            doctor: $request->user(),
            filters: $request->only(['search', 'gender', 'active']),
            perPage: $request->integer('per_page', 15)
        );

        return response()->json([
            'data' => PatientResource::collection($patients->items()),
            'meta' => [
                'current_page' => $patients->currentPage(),
                'per_page' => $patients->perPage(),
                'total' => $patients->total(),
                'last_page' => $patients->lastPage(),
            ],
            'links' => [
                'first' => $patients->url(1),
                'last' => $patients->url($patients->lastPage()),
                'prev' => $patients->previousPageUrl(),
                'next' => $patients->nextPageUrl(),
            ]
        ]);
    }

    public function store(StorePatientRequest $request): JsonResponse
    {
        $this->authorize('create', Patient::class);

        $patient = $this->patientService->create(
            PatientData::from($request->validated()),
            $request->user()
        );

        return response()->json([
            'message' => 'Paciente criado com sucesso!',
            'data' => new PatientResource($patient)
        ], 201);
    }

    public function show(Patient $patient): JsonResponse
    {
        $this->authorize('view', $patient);

        return response()->json([
            'data' => new PatientResource($patient->load([
                'consultations' => fn($q) => $q->latest()->take(5),
                'prescriptions' => fn($q) => $q->latest()->take(3),
            ]))
        ]);
    }

    public function update(UpdatePatientRequest $request, Patient $patient): JsonResponse
    {
        $this->authorize('update', $patient);

        $patient = $this->patientService->update(
            $patient,
            PatientData::from($request->validated())
        );

        return response()->json([
            'message' => 'Paciente atualizado com sucesso!',
            'data' => new PatientResource($patient)
        ]);
    }

    public function destroy(Patient $patient): JsonResponse
    {
        $this->authorize('delete', $patient);

        $this->patientService->delete($patient);

        return response()->json([
            'message' => 'Paciente removido com sucesso!'
        ]);
    }
}
```

#### **3. API Resources**
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PatientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'cpf' => $this->cpf,
            'birth_date' => $this->birth_date?->format('Y-m-d'),
            'age' => $this->age,
            'gender' => $this->gender,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'medical_data' => $this->when(
                $request->user()->can('viewMedicalData', $this->resource),
                $this->medical_data
            ),
            'emergency_contact' => $this->emergency_contact,
            'last_consultation_date' => $this->last_consultation_date,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            
            // Relacionamentos condicionais
            'consultations' => ConsultationResource::collection(
                $this->whenLoaded('consultations')
            ),
            'prescriptions' => PrescriptionResource::collection(
                $this->whenLoaded('prescriptions')
            ),
            
            // Permissões
            'can' => [
                'update' => $request->user()->can('update', $this->resource),
                'delete' => $request->user()->can('delete', $this->resource),
                'view_medical_data' => $request->user()->can('viewMedicalData', $this->resource),
            ],
        ];
    }
}
```

#### **4. Rate Limiting**
```php
<?php

// app/Providers/RouteServiceProvider.php
protected function configureRateLimiting()
{
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });

    RateLimiter::for('ai', function (Request $request) {
        return [
            Limit::perMinute(10)->by($request->user()->id),
            Limit::perDay(100)->by($request->user()->id),
        ];
    });

    RateLimiter::for('uploads', function (Request $request) {
        return Limit::perMinute(5)->by($request->user()->id);
    });
}
```

---

## 💻 **Frontend com React**

### **Estrutura Base do Frontend**

#### **1. Configuração Principal (app.tsx)**
```typescript
import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Médico Bolso V2';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
```

#### **2. Hooks React para Lógica Reutilizável**
```typescript
// useAuth.ts
import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import type { User } from '@/Types/models';

export function useAuth() {
  const { props } = usePage();
  
  const user = useMemo((): User | null => {
    return (props as any).auth?.user || null;
  }, [props]);
  
  const isAuthenticated = useMemo((): boolean => !!user, [user]);
  
  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) ?? false;
  };
  
  const can = (permission: string, resource?: any): boolean => {
    if (!user) return false;
    
    // Check specific resource permissions
    if (resource?.can) {
      return resource.can[permission] ?? false;
    }
    
    // Check general permissions
    return user.permissions?.includes(permission) ?? false;
  };
  
  return {
    user,
    isAuthenticated,
    hasRole,
    can
  };
}
```

```typescript
// useAPI.ts
import { router } from '@inertiajs/react'
import { ref } from 'react'

interface APIOptions {
  onSuccess?: (data: any) => void
  onError?: (errors: any) => void
  preserveState?: boolean
  preserveScroll?: boolean
}

export function useAPI() {
  const [loading, setLoading] = useState(false)
  const errors = ref<Record<string, string>>({})
  
  const get = (url: string, data: Record<string, any> = {}, options: APIOptions = {}) => {
    loading = true
    errors.value = {}
    
    router.get(url, data, {
      preserveState: options.preserveState ?? true,
      preserveScroll: options.preserveScroll ?? true,
      onSuccess: (response) => {
        loading = false
        options.onSuccess?.(response)
      },
      onError: (responseErrors) => {
        loading = false
        errors.value = responseErrors
        options.onError?.(responseErrors)
      }
    })
  }
  
  const post = (url: string, data: Record<string, any> = {}, options: APIOptions = {}) => {
    loading = true
    errors.value = {}
    
    router.post(url, data, {
      preserveState: options.preserveState ?? true,
      preserveScroll: options.preserveScroll ?? false,
      onSuccess: (response) => {
        loading = false
        options.onSuccess?.(response)
      },
      onError: (responseErrors) => {
        loading = false
        errors.value = responseErrors
        options.onError?.(responseErrors)
      }
    })
  }
  
  return {
    loading: readonly(loading),
    errors: readonly(errors),
    get,
    post,
    put: (url: string, data: Record<string, any> = {}, options: APIOptions = {}) => {
      data._method = 'PUT'
      return post(url, data, options)
    },
    delete: (url: string, options: APIOptions = {}) => {
      router.delete(url, {
        preserveState: options.preserveState ?? true,
        onSuccess: options.onSuccess,
        onError: options.onError
      })
    }
  }
}
```

#### **3. Context Providers com React**
```typescript
// contexts/PatientsContext.tsx
import { createContext, useContext, useState, useMemo, ReactNode } from 'react'
import type { Patient, PaginationMeta } from '@/Types/models'

interface PatientsContextType {
  patients: Patient[];
  loading: boolean;
  createPatient: (data: Partial<Patient>) => Promise<void>;
  updatePatient: (id: string, data: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  fetchPatients: () => Promise<void>;
}

const PatientsContext = createContext<PatientsContextType | null>(null);

export function PatientsProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  const contextValue = useMemo(() => ({
    patients,
    loading,
    createPatient: async (data: Partial<Patient>) => {
      setLoading(true);
      // Implementar lógica
      setLoading(false);
    },
    updatePatient: async (id: string, data: Partial<Patient>) => {
      // Implementar lógica
    },
    deletePatient: async (id: string) => {
      // Implementar lógica
    },
    fetchPatients: async () => {
      setLoading(true);
      // Implementar lógica
      setLoading(false);
    }
  }), [patients, loading]);

  return (
    <PatientsContext.Provider value={contextValue}>
      {children}
    </PatientsContext.Provider>
  );
}

export function usePatients() {
  const context = useContext(PatientsContext);
  if (!context) {
    throw new Error('usePatients must be used within a PatientsProvider');
  }
  return context;
}
```
    
    try {
      const params = {
        page,
        ...filters.value,
        ...additionalFilters
      }
      
      const response = await fetch(route('api.v1.patients.index', params))
      const data = await response.json()
      
      patients = data.data
      meta = data.meta
    } catch (error) {
      console.error('Error fetching patients:', error)
      throw error
    } finally {
      loading = false
    }
  }
  
  const createPatient = async (patientData: Partial<Patient>) => {
    loading = true
    
    try {
      const response = await fetch(route('api.v1.patients.store'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify(patientData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        patients.unshift(data.data)
        return data.data
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error('Error creating patient:', error)
      throw error
    } finally {
      loading = false
    }
  }
  
  const updatePatient = async (id: number, patientData: Partial<Patient>) => {
    loading = true
    
    try {
      const response = await fetch(route('api.v1.patients.update', id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        body: JSON.stringify(patientData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        const index = patients.findIndex(p => p.id === id)
        if (index !== -1) {
          patients[index] = data.data
        }
        return data.data
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error('Error updating patient:', error)
      throw error
    } finally {
      loading = false
    }
  }
  
  const deletePatient = async (id: number) => {
    loading = true
    
    try {
      const response = await fetch(route('api.v1.patients.destroy', id), {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
      })
      
      if (response.ok) {
        patients = patients.filter(p => p.id !== id)
      } else {
        const data = await response.json()
        throw new Error(data.message)
      }
    } catch (error) {
      console.error('Error deleting patient:', error)
      throw error
    } finally {
      loading = false
    }
  }
  
  const setCurrentPatient = (patient: Patient | null) => {
    currentPatient.value = patient
  }
  
  const updateFilters = (newFilters: Partial<typeof filters.value>) => {
    filters.value = { ...filters.value, ...newFilters }
  }
  
  const clearFilters = () => {
    filters.value = {
      search: '',
      gender: '',
      active: true
    }
  }
  
  return {
    // State
    patients: readonly(patients),
    currentPatient: readonly(currentPatient),
    loading: readonly(loading),
    meta: readonly(meta),
    filters: readonly(filters),
    
    // Getters
    totalPatients,
    hasPatients,
    filteredPatients,
    
    // Actions
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    setCurrentPatient,
    updateFilters,
    clearFilters
  }
})
```

#### **4. Componentes Base Reutilizáveis**
```typescript
// Components/Base/Button.tsx
import React from 'react';
import { Button, CircularProgress } from '@mui/material';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  children,
  icon
}: ButtonProps) {
  return (
    <Button
      type={type as 'button' | 'submit' | 'reset'}
      disabled={disabled || loading}
      variant={variant === 'primary' ? 'contained' : 
               variant === 'secondary' ? 'outlined' : 
               variant === 'danger' ? 'contained' : 'text'}
      color={variant === 'danger' ? 'error' : 'primary'}
      size={size}
      fullWidth={fullWidth}
      onClick={onClick}
      startIcon={loading ? <CircularProgress size={16} /> : icon}
      sx={{
        textTransform: 'none',
        fontWeight: 500,
      }}
    >
      {children}
    </Button>
  );
}
```

```typescript
// Components/Base/Input.tsx
import React from 'react';
import { TextField, InputAdornment } from '@mui/material';

interface InputProps {
  id?: string;
  label?: string;
  type?: string;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  onChange?: (value: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  endAdornment?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
}

export default function Input({
  id,
  label,
  type = 'text',
  value = '',
  placeholder,
  disabled = false,
  required = false,
  error = false,
  helperText,
  onChange,
  onBlur,
  onFocus,
  endAdornment,
  multiline = false,
  rows = 4
}: InputProps) {
  return (
    <TextField
      id={id}
      label={label}
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      error={error}
      helperText={helperText}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={onBlur}
      onFocus={onFocus}
      fullWidth
      multiline={multiline}
      rows={multiline ? rows : undefined}
      variant="outlined"
      size="medium"
      InputProps={{
        endAdornment: endAdornment ? (
          <InputAdornment position="end">
            {endAdornment}
          </InputAdornment>
        ) : undefined,
      }}
    />
  );
}
```

### **Types TypeScript**
```typescript
// Types/models.ts
export interface User {
  id: number
  uuid: string
  name: string
  email: string
  email_verified_at?: string
  crm?: string
  specialty?: string
  plan_type: PlanType
  plan_expires_at?: string
  modules?: Record<string, ModulePermissions>
  settings?: Record<string, any>
  address?: Address
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
  
  // Relations
  patients?: Patient[]
  secretaries?: Secretary[]
  consultations?: Consultation[]
  
  // Computed
  patients_count?: number
  secretaries_count?: number
  
  // Permissions
  can?: Record<string, boolean>
  permissions?: string[]
  roles?: string[]
}

export interface Patient {
  id: number
  uuid: string
  doctor_id: number
  name: string
  cpf?: string
  birth_date?: string
  age?: number
  gender?: 'male' | 'female' | 'other'
  phone?: string
  email?: string
  address?: Address
  medical_data?: MedicalData
  emergency_contact?: EmergencyContact
  notes?: string
  is_active: boolean
  last_consultation_date?: string
  created_at: string
  updated_at: string
  
  // Relations
  doctor?: User
  consultations?: Consultation[]
  prescriptions?: Prescription[]
  
  // Computed
  consultations_count?: number
  
  // Permissions
  can?: Record<string, boolean>
}

export interface Consultation {
  id: number
  uuid: string
  doctor_id: number
  patient_id: number
  consultation_date: string
  consultation_time: string
  duration_minutes: number
  type: 'presencial' | 'telemedicina' | 'retorno'
  status: 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada' | 'faltou'
  reason_for_visit?: string
  clinical_notes?: string
  diagnosis?: string
  treatment_plan?: string
  follow_up?: FollowUp
  attachments?: string[]
  price?: number
  paid: boolean
  created_at: string
  updated_at: string
  
  // Relations
  doctor?: User
  patient?: Patient
  prescriptions?: Prescription[]
  
  // Permissions
  can?: Record<string, boolean>
}

export type PlanType = 'free' | 'monthly' | 'quarterly' | 'annual' | 'enterprise'

export interface ModulePermissions {
  read: boolean
  write: boolean
  limit?: number
}

export interface Address {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  postal_code: string
}

export interface MedicalData {
  blood_type?: string
  height_cm?: number
  weight_kg?: number
  allergies?: string[]
  chronic_diseases?: string[]
  medications?: string[]
  vital_signs?: VitalSigns
}

export interface VitalSigns {
  blood_pressure?: string
  heart_rate?: number
  temperature?: number
  respiratory_rate?: number
  oxygen_saturation?: number
}

export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

export interface FollowUp {
  required: boolean
  timeframe?: string
  instructions?: string
  next_appointment_date?: string
}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number
  to: number
}

export interface ApiResponse<T = any> {
  data: T
  message?: string
  meta?: PaginationMeta
  links?: PaginationLinks
}

export interface PaginationLinks {
  first: string
  last: string
  prev?: string
  next?: string
}
```

---

## 🔧 **Serviços e Integrações**

### **Service Layer Architecture**

#### **1. Base Service Class**
```php
<?php

namespace App\Services;

abstract class BaseService
{
    protected function handleException(\Throwable $exception, string $context = ''): void
    {
        \Log::error("Service Exception in {$context}", [
            'exception' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
            'context' => $context
        ]);
        
        throw $exception;
    }
    
    protected function validateBusinessRules(array $rules): void
    {
        foreach ($rules as $rule => $condition) {
            if (!$condition) {
                throw new BusinessRuleException("Business rule violation: {$rule}");
            }
        }
    }
}
```

#### **2. Stripe Service**
```php
<?php

namespace App\Services\Financial;

use App\Services\BaseService;
use App\Models\User;
use App\Events\SubscriptionUpdated;
use Stripe\StripeClient;
use Stripe\Exception\ApiErrorException;

class StripeService extends BaseService
{
    private StripeClient $stripe;
    
    public function __construct()
    {
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }
    
    public function createCustomer(User $user): string
    {
        try {
            $customer = $this->stripe->customers->create([
                'email' => $user->email,
                'name' => $user->name,
                'metadata' => [
                    'user_id' => $user->id,
                    'crm' => $user->crm,
                ]
            ]);
            
            $user->update(['stripe_customer_id' => $customer->id]);
            
            return $customer->id;
        } catch (ApiErrorException $e) {
            $this->handleException($e, 'createCustomer');
        }
    }
    
    public function createSubscription(User $user, string $priceId, array $options = []): array
    {
        try {
            $customerId = $user->stripe_customer_id ?? $this->createCustomer($user);
            
            $subscription = $this->stripe->subscriptions->create([
                'customer' => $customerId,
                'items' => [['price' => $priceId]],
                'payment_behavior' => 'default_incomplete',
                'payment_settings' => ['save_default_payment_method' => 'on_subscription'],
                'expand' => ['latest_invoice.payment_intent'],
                ...$options
            ]);
            
            return [
                'subscription_id' => $subscription->id,
                'client_secret' => $subscription->latest_invoice->payment_intent->client_secret,
                'status' => $subscription->status
            ];
        } catch (ApiErrorException $e) {
            $this->handleException($e, 'createSubscription');
        }
    }
    
    public function handleWebhook(array $payload): void
    {
        try {
            $event = \Stripe\Webhook::constructEvent(
                json_encode($payload),
                request()->header('Stripe-Signature'),
                config('services.stripe.webhook_secret')
            );
            
            match($event->type) {
                'customer.subscription.created' => $this->handleSubscriptionCreated($event->data->object),
                'customer.subscription.updated' => $this->handleSubscriptionUpdated($event->data->object),
                'customer.subscription.deleted' => $this->handleSubscriptionDeleted($event->data->object),
                'invoice.payment_succeeded' => $this->handlePaymentSucceeded($event->data->object),
                'invoice.payment_failed' => $this->handlePaymentFailed($event->data->object),
                default => \Log::info("Unhandled Stripe event: {$event->type}")
            };
        } catch (\Exception $e) {
            $this->handleException($e, 'handleWebhook');
        }
    }
    
    private function handleSubscriptionUpdated($subscription): void
    {
        $user = User::where('stripe_customer_id', $subscription->customer)->first();
        
        if (!$user) return;
        
        $planType = $this->mapStripePriceToPlan($subscription->items->data[0]->price->id);
        
        $user->update([
            'plan_type' => $planType,
            'plan_expires_at' => $subscription->current_period_end ? 
                now()->createFromTimestamp($subscription->current_period_end) : null
        ]);
        
        // Update user modules based on new plan
        app(ModuleService::class)->updateUserModulesFromPlan($user);
        
        event(new SubscriptionUpdated($user, $subscription));
    }
    
    private function mapStripePriceToPlan(string $priceId): string
    {
        return match($priceId) {
            config('services.stripe.prices.monthly') => 'monthly',
            config('services.stripe.prices.quarterly') => 'quarterly',
            config('services.stripe.prices.annual') => 'annual',
            config('services.stripe.prices.enterprise') => 'enterprise',
            default => 'free'
        };
    }
}
```

#### **3. OpenAI Service**
```php
<?php

namespace App\Services\AI;

use App\Services\BaseService;
use App\Models\User;
use OpenAI\Client;
use OpenAI\Factory;

class OpenAIService extends BaseService
{
    private Client $client;
    
    public function __construct()
    {
        $this->client = Factory::create([
            'api_key' => config('services.openai.api_key'),
            'organization' => config('services.openai.organization'),
        ]);
    }
    
    public function medicalChat(array $messages, User $user): array
    {
        try {
            $this->validateChatLimits($user);
            
            $systemPrompt = $this->getMedicalSystemPrompt($user);
            
            $response = $this->client->chat()->create([
                'model' => 'gpt-4',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ...$messages
                ],
                'temperature' => 0.1,
                'max_tokens' => 1000,
                'user' => "user_{$user->id}"
            ]);
            
            $this->trackUsage($user, $response->usage->totalTokens, 'chat');
            
            return [
                'response' => $response->choices[0]->message->content,
                'tokens_used' => $response->usage->totalTokens,
                'model' => $response->model
            ];
        } catch (\Exception $e) {
            $this->handleException($e, 'medicalChat');
        }
    }
    
    public function analyzeExam(string $examText, User $user, ?string $patientContext = null): array
    {
        try {
            $this->validateAnalysisLimits($user);
            
            $prompt = $this->buildExamAnalysisPrompt($examText, $patientContext);
            
            $response = $this->client->chat()->create([
                'model' => 'gpt-4',
                'messages' => [
                    ['role' => 'system', 'content' => $this->getExamAnalysisSystemPrompt()],
                    ['role' => 'user', 'content' => $prompt]
                ],
                'temperature' => 0.2,
                'max_tokens' => 1500
            ]);
            
            $analysis = json_decode($response->choices[0]->message->content, true);
            
            $this->trackUsage($user, $response->usage->totalTokens, 'exam_analysis');
            
            return [
                'analysis' => $analysis,
                'tokens_used' => $response->usage->totalTokens,
                'confidence' => $analysis['confidence'] ?? 'medium'
            ];
        } catch (\Exception $e) {
            $this->handleException($e, 'analyzeExam');
        }
    }
    
    public function transcribeAudio(string $audioPath, User $user): array
    {
        try {
            $this->validateTranscriptionLimits($user);
            
            $response = $this->client->audio()->transcribe([
                'model' => 'whisper-1',
                'file' => fopen($audioPath, 'r'),
                'response_format' => 'verbose_json',
                'language' => 'pt'
            ]);
            
            $this->trackUsage($user, strlen($response->text), 'transcription');
            
            return [
                'text' => $response->text,
                'duration' => $response->duration,
                'language' => $response->language
            ];
        } catch (\Exception $e) {
            $this->handleException($e, 'transcribeAudio');
        }
    }
    
    private function getMedicalSystemPrompt(User $user): string
    {
        return "Você é um assistente médico especializado para Dr(a). {$user->name} ({$user->specialty}).
        
        DIRETRIZES:
        - Forneça informações médicas precisas e baseadas em evidências
        - Sempre recomende consulta presencial quando necessário
        - Não substitua o julgamento clínico do médico
        - Use terminologia médica apropriada
        - Seja conciso mas completo
        - Em caso de dúvida, recomende segunda opinião
        
        LIMITAÇÕES:
        - Não forneça diagnósticos definitivos
        - Não recomende medicamentos específicos sem contexto
        - Sempre considere contraindicações
        - Lembre que este é um auxílio, não substituição da consulta";
    }
    
    private function getExamAnalysisSystemPrompt(): string
    {
        return "Você é um especialista em análise de exames médicos. Analise o exame fornecido e retorne um JSON estruturado com:
        
        {
            \"summary\": \"Resumo dos principais achados\",
            \"abnormal_findings\": [\"Lista de achados anormais\"],
            \"normal_findings\": [\"Lista de achados normais\"],
            \"recommendations\": [\"Recomendações clínicas\"],
            \"urgent\": boolean,
            \"follow_up\": \"Recomendações de seguimento\",
            \"confidence\": \"high|medium|low\"
        }
        
        Seja preciso, objetivo e baseado em evidências médicas.";
    }
    
    private function validateChatLimits(User $user): void
    {
        $monthlyUsage = $this->getMonthlyUsage($user, 'chat');
        $planLimits = $this->getPlanLimits($user->plan_type);
        
        $this->validateBusinessRules([
            'chat_limit_not_exceeded' => $monthlyUsage < $planLimits['chat_monthly_limit']
        ]);
    }
    
    private function trackUsage(User $user, int $tokens, string $type): void
    {
        // Track usage in database for billing and limits
        \DB::table('ai_usage')->insert([
            'user_id' => $user->id,
            'type' => $type,
            'tokens' => $tokens,
            'cost' => $this->calculateCost($tokens, $type),
            'created_at' => now()
        ]);
    }
}
```

#### **4. WhatsApp Service**
```php
<?php

namespace App\Services\Communication;

use App\Services\BaseService;
use App\Models\User;
use App\Models\Consultation;
use App\Jobs\SendWhatsAppMessage;

class WhatsAppService extends BaseService
{
    public function sendConsultationReminder(Consultation $consultation): void
    {
        if (!$consultation->patient->phone) {
            return;
        }
        
        $message = $this->buildReminderMessage($consultation);
        
        SendWhatsAppMessage::dispatch(
            $consultation->patient->phone,
            $message,
            $consultation->doctor_id
        );
    }
    
    public function sendWelcomeMessage(User $doctor, string $phone): void
    {
        $message = $this->buildWelcomeMessage($doctor);
        
        SendWhatsAppMessage::dispatch($phone, $message, $doctor->id);
    }
    
    private function buildReminderMessage(Consultation $consultation): string
    {
        $date = $consultation->consultation_date->format('d/m/Y');
        $time = $consultation->consultation_time;
        $doctorName = $consultation->doctor->name;
        
        return "🏥 *Lembrete de Consulta*\n\n" .
               "Olá {$consultation->patient->name}!\n\n" .
               "Você tem uma consulta marcada:\n" .
               "📅 Data: {$date}\n" .
               "🕐 Horário: {$time}\n" .
               "👨‍⚕️ Médico: Dr(a). {$doctorName}\n\n" .
               "Por favor, confirme sua presença respondendo este message.\n\n" .
               "_Mensagem automática - Médico no Bolso_";
    }
    
    private function buildWelcomeMessage(User $doctor): string
    {
        return "🎉 *Bem-vindo ao consultório Dr(a). {$doctor->name}!*\n\n" .
               "Agora você receberá lembretes automáticos de suas consultas.\n\n" .
               "Para confirmar sua presença, basta responder 'CONFIRMO'.\n" .
               "Para cancelar, responda 'CANCELAR'.\n\n" .
               "_Powered by Médico no Bolso_";
    }
}
```

---

## 🧪 **Testes Automatizados**

### **Estratégia de Testes**

#### **1. Configuração PHPUnit + Pest**
```php
<?php

// tests/Pest.php
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(Tests\TestCase::class, RefreshDatabase::class)->in('Feature');
uses(Tests\TestCase::class)->in('Unit');

function createUser(array $attributes = []): User
{
    return User::factory()->create($attributes);
}

function createPatient(User $doctor = null, array $attributes = []): Patient
{
    return Patient::factory()
        ->for($doctor ?? createUser())
        ->create($attributes);
}

function createConsultation(Patient $patient = null, array $attributes = []): Consultation
{
    $patient = $patient ?? createPatient();
    
    return Consultation::factory()
        ->for($patient->doctor, 'doctor')
        ->for($patient)
        ->create($attributes);
}

function actingAsDoctor(array $attributes = []): User
{
    $user = createUser($attributes);
    test()->actingAs($user);
    return $user;
}
```

#### **2. Testes de Feature**
```php
<?php

// tests/Feature/PatientManagementTest.php
use App\Models\User;
use App\Models\Patient;

beforeEach(function () {
    $this->doctor = actingAsDoctor(['plan_type' => 'annual']);
});

it('can create a patient', function () {
    $patientData = [
        'name' => 'João Silva',
        'cpf' => '123.456.789-00',
        'birth_date' => '1990-01-01',
        'gender' => 'male',
        'phone' => '(11) 99999-9999',
        'email' => 'joao@example.com'
    ];
    
    $response = $this->post(route('patients.store'), $patientData);
    
    $response->assertRedirect(route('patients.index'));
    $response->assertSessionHas('success');
    
    $this->assertDatabaseHas('patients', [
        'name' => 'João Silva',
        'doctor_id' => $this->doctor->id
    ]);
});

it('cannot create patient when exceeding plan limits', function () {
    $this->doctor->update(['plan_type' => 'free']);
    
    // Create maximum patients for free plan
    Patient::factory()->count(50)->for($this->doctor)->create();
    
    $response = $this->post(route('patients.store'), [
        'name' => 'Paciente Extra',
        'birth_date' => '1990-01-01'
    ]);
    
    $response->assertForbidden();
});

it('can update patient information', function () {
    $patient = createPatient($this->doctor);
    
    $updateData = [
        'name' => 'Nome Atualizado',
        'phone' => '(11) 88888-8888'
    ];
    
    $response = $this->put(route('patients.update', $patient), $updateData);
    
    $response->assertRedirect(route('patients.show', $patient));
    
    $this->assertDatabaseHas('patients', [
        'id' => $patient->id,
        'name' => 'Nome Atualizado',
        'phone' => '(11) 88888-8888'
    ]);
});

it('cannot access patients from other doctors', function () {
    $otherDoctor = createUser();
    $otherPatient = createPatient($otherDoctor);
    
    $response = $this->get(route('patients.show', $otherPatient));
    
    $response->assertForbidden();
});
```

#### **3. Testes de Unidade**
```php
<?php

// tests/Unit/Services/ModuleServiceTest.php
use App\Services\Core\ModuleService;
use App\Models\User;
use App\Enums\PlanType;

beforeEach(function () {
    $this->moduleService = app(ModuleService::class);
});

it('grants access for valid module and action', function () {
    $user = createUser(['plan_type' => 'annual']);
    
    $hasAccess = $this->moduleService->hasAccess($user, 'patients', 'write');
    
    expect($hasAccess)->toBeTrue();
});

it('denies access for invalid module', function () {
    $user = createUser(['plan_type' => 'free']);
    
    $hasAccess = $this->moduleService->hasAccess($user, 'ai', 'read');
    
    expect($hasAccess)->toBeFalse();
});

it('respects plan limits correctly', function () {
    $user = createUser(['plan_type' => 'free']);
    
    // Create 49 patients (within limit)
    Patient::factory()->count(49)->for($user)->create();
    
    expect($this->moduleService->checkLimits($user, 'patients'))->toBeTrue();
    
    // Create one more patient (reaches limit)
    Patient::factory()->for($user)->create();
    
    expect($this->moduleService->checkLimits($user, 'patients'))->toBeFalse();
});
```

#### **4. Testes de API**
```php
<?php

// tests/Feature/Api/PatientApiTest.php
use App\Models\Patient;

beforeEach(function () {
    $this->doctor = createUser(['plan_type' => 'annual']);
    $this->actingAs($this->doctor, 'sanctum');
});

it('can list patients via api', function () {
    $patients = Patient::factory()->count(3)->for($this->doctor)->create();
    
    $response = $this->getJson(route('api.v1.patients.index'));
    
    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'cpf', 'phone', 'email', 'created_at']
            ],
            'meta' => ['current_page', 'per_page', 'total', 'last_page'],
            'links' => ['first', 'last', 'prev', 'next']
        ])
        ->assertJsonCount(3, 'data');
});

it('can create patient via api', function () {
    $patientData = [
        'name' => 'API Patient',
        'cpf' => '123.456.789-00',
        'phone' => '(11) 99999-9999'
    ];
    
    $response = $this->postJson(route('api.v1.patients.store'), $patientData);
    
    $response->assertCreated()
        ->assertJsonFragment(['name' => 'API Patient']);
    
    $this->assertDatabaseHas('patients', $patientData);
});

it('validates required fields', function () {
    $response = $this->postJson(route('api.v1.patients.store'), []);
    
    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});

it('respects rate limiting', function () {
    // Simulate 61 requests within a minute
    for ($i = 0; $i < 61; $i++) {
        $response = $this->getJson(route('api.v1.patients.index'));
        
        if ($i < 60) {
            $response->assertOk();
        } else {
            $response->assertStatus(429); // Too Many Requests
        }
    }
});
```

#### **5. Testes de Integração**
```php
<?php

// tests/Feature/Integration/StripeWebhookTest.php
use App\Services\Financial\StripeService;

it('handles subscription created webhook', function () {
    $user = createUser(['stripe_customer_id' => 'cus_test123']);
    
    $webhookPayload = [
        'type' => 'customer.subscription.created',
        'data' => [
            'object' => [
                'id' => 'sub_test123',
                'customer' => 'cus_test123',
                'status' => 'active',
                'items' => [
                    'data' => [
                        [
                            'price' => [
                                'id' => config('services.stripe.prices.annual')
                            ]
                        ]
                    ]
                ],
                'current_period_end' => now()->addYear()->timestamp
            ]
        ]
    ];
    
    $response = $this->postJson(route('webhooks.stripe'), $webhookPayload, [
        'Stripe-Signature' => $this->generateStripeSignature($webhookPayload)
    ]);
    
    $response->assertOk();
    
    $user->refresh();
    expect($user->plan_type)->toBe('annual');
    expect($user->plan_expires_at)->not->toBeNull();
});

private function generateStripeSignature(array $payload): string
{
    $timestamp = time();
    $signature = hash_hmac('sha256', $timestamp . '.' . json_encode($payload), config('services.stripe.webhook_secret'));
    
    return "t={$timestamp},v1={$signature}";
}
```

### **Coverage e Qualidade**

#### **1. Configuração de Coverage**
```xml
<!-- phpunit.xml -->
<coverage>
    <include>
        <directory suffix=".php">./app</directory>
    </include>
    <exclude>
        <directory>./app/Console</directory>
        <directory>./app/Exceptions</directory>
        <file>./app/Http/Kernel.php</file>
    </exclude>
    <report>
        <html outputDirectory="coverage-html"/>
        <text outputFile="coverage.txt"/>
    </report>
</coverage>
```

#### **2. GitHub Actions para CI**
```yaml
# .github/workflows/tests.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  tests:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: testing
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3

    steps:
      - uses: actions/checkout@v3

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: 8.3
          extensions: dom, curl, libxml, mbstring, zip, pcntl, pdo, sqlite, pdo_sqlite, bcmath, soap, intl, gd, exif, iconv
          coverage: xdebug

      - name: Install Composer dependencies
        run: composer install --prefer-dist --no-interaction --no-progress

      - name: Copy environment file
        run: cp .env.testing.example .env.testing

      - name: Generate application key
        run: php artisan key:generate --env=testing

      - name: Run migrations
        run: php artisan migrate --env=testing

      - name: Run tests with coverage
        run: php artisan test --coverage --min=80

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
```

---

## 🚀 **Deploy e DevOps**

### **Containerização com Docker**

#### **1. Dockerfile**
```dockerfile
# Dockerfile
FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    mysql-client \
    nodejs \
    npm

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy existing application directory contents
COPY . /var/www

# Copy existing application directory permissions
COPY --chown=www-data:www-data . /var/www

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# Install Node dependencies and build assets
RUN npm install && npm run build

# Change current user to www
USER www-data

# Expose port 9000
EXPOSE 9000

CMD ["php-fpm"]
```

#### **2. Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: medico-app
    restart: unless-stopped
    working_dir: /var/www
    volumes:
      - ./:/var/www
      - ./storage:/var/www/storage
    networks:
      - medico-network
    depends_on:
      - db
      - redis

  nginx:
    image: nginx:alpine
    container_name: medico-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./:/var/www
      - ./docker/nginx:/etc/nginx/conf.d
      - ./docker/ssl:/etc/ssl/certs
    networks:
      - medico-network
    depends_on:
      - app

  db:
    image: mysql:8.0
    container_name: medico-db
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: medico_bolso
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_PASSWORD: secret
      MYSQL_USER: medico
    volumes:
      - dbdata:/var/lib/mysql
      - ./docker/mysql/my.cnf:/etc/mysql/my.cnf
    ports:
      - "3306:3306"
    networks:
      - medico-network

  redis:
    image: redis:alpine
    container_name: medico-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    networks:
      - medico-network

  queue:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: medico-queue
    restart: unless-stopped
    command: php artisan queue:work --sleep=3 --tries=3
    volumes:
      - ./:/var/www
    networks:
      - medico-network
    depends_on:
      - db
      - redis

  scheduler:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: medico-scheduler
    restart: unless-stopped
    command: |
      sh -c "while true; do
        php artisan schedule:run
        sleep 60
      done"
    volumes:
      - ./:/var/www
    networks:
      - medico-network
    depends_on:
      - db
      - redis

volumes:
  dbdata:
  redisdata:

networks:
  medico-network:
    driver: bridge
```

#### **3. Nginx Configuration**
```nginx
# docker/nginx/default.conf
upstream php-fpm {
    server app:9000;
}

server {
    listen 80;
    server_name localhost;
    root /var/www/public;
    index index.php index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: *.stripe.com; font-src 'self'; connect-src 'self' *.stripe.com api.openai.com;" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Handle static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Main location block
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP processing
    location ~ \.php$ {
        fastcgi_pass php-fpm;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
        
        # Security
        fastcgi_hide_header X-Powered-By;
        
        # Timeouts
        fastcgi_connect_timeout 60s;
        fastcgi_send_timeout 60s;
        fastcgi_read_timeout 60s;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ ^/(\.env|\.git|composer\.|package\.|webpack\.) {
        deny all;
        access_log off;
        log_not_found off;
    }

    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        try_files $uri $uri/ /index.php?$query_string;
    }
}

# Rate limiting zones
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=60r/m;
}
```

### **Deploy Automation**

#### **1. GitHub Actions Deploy**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: 8.3

      - name: Install dependencies
        run: composer install --no-dev --optimize-autoloader

      - name: Build assets
        run: |
          npm install
          npm run build

      - name: Deploy to server
        uses: appleboy/ssh-action@v0.1.7
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/medico-bolso
            git pull origin main
            
            # Backup database
            php artisan backup:run --only-db
            
            # Update dependencies
            composer install --no-dev --optimize-autoloader
            npm install && npm run build
            
            # Run migrations
            php artisan migrate --force
            
            # Clear caches
            php artisan config:cache
            php artisan route:cache
            php artisan view:cache
            php artisan queue:restart
            
            # Reload PHP-FPM
            sudo systemctl reload php8.3-fpm
            
            # Health check
            curl -f http://localhost/health || exit 1

      - name: Slack notification
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

#### **2. Zero-Downtime Deploy Script**
```bash
#!/bin/bash
# deploy.sh

set -e

APP_DIR="/var/www/medico-bolso"
BACKUP_DIR="/var/backups/medico-bolso"
RELEASE_DIR="${APP_DIR}/releases/$(date +%Y%m%d_%H%M%S)"
CURRENT_LINK="${APP_DIR}/current"

echo "🚀 Starting zero-downtime deployment..."

# Create release directory
mkdir -p $RELEASE_DIR

# Clone latest code
git clone --depth 1 https://github.com/username/medico-bolso.git $RELEASE_DIR

cd $RELEASE_DIR

# Install dependencies
composer install --no-dev --optimize-autoloader
npm install && npm run build

# Copy environment file
cp $APP_DIR/.env $RELEASE_DIR/.env

# Link storage and cache directories
ln -nfs $APP_DIR/storage $RELEASE_DIR/storage
ln -nfs $APP_DIR/bootstrap/cache $RELEASE_DIR/bootstrap/cache

# Run Laravel optimizations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Backup current database
php artisan backup:run --only-db

# Run migrations
php artisan migrate --force

# Update symlink atomically
ln -nfs $RELEASE_DIR $CURRENT_LINK

# Restart services
sudo systemctl reload php8.3-fpm
php artisan queue:restart

# Cleanup old releases (keep last 3)
ls -dt $APP_DIR/releases/* | tail -n +4 | xargs rm -rf

echo "✅ Deployment completed successfully!"

# Health check
curl -f http://localhost/health || {
    echo "❌ Health check failed!"
    exit 1
}

echo "🎉 Application is healthy and running!"
```

### **Monitoring e Observabilidade**

#### **1. Health Check Endpoint**
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class HealthController extends Controller
{
    public function check(): JsonResponse
    {
        $checks = [
            'database' => $this->checkDatabase(),
            'cache' => $this->checkCache(),
            'queue' => $this->checkQueue(),
            'storage' => $this->checkStorage(),
        ];
        
        $healthy = collect($checks)->every(fn($check) => $check['status'] === 'ok');
        
        return response()->json([
            'status' => $healthy ? 'healthy' : 'unhealthy',
            'timestamp' => now()->toISOString(),
            'checks' => $checks,
            'version' => config('app.version'),
        ], $healthy ? 200 : 503);
    }
    
    private function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            $users = DB::table('users')->count();
            
            return [
                'status' => 'ok',
                'response_time' => '< 50ms',
                'details' => ['users_count' => $users]
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }
    
    private function checkCache(): array
    {
        try {
            $key = 'health_check_' . now()->timestamp;
            Cache::put($key, 'test', 10);
            $value = Cache::get($key);
            Cache::forget($key);
            
            return [
                'status' => $value === 'test' ? 'ok' : 'error',
                'message' => 'Cache read/write successful'
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }
    
    private function checkQueue(): array
    {
        try {
            $failed = DB::table('failed_jobs')->count();
            $size = \Queue::size();
            
            return [
                'status' => 'ok',
                'details' => [
                    'pending_jobs' => $size,
                    'failed_jobs' => $failed
                ]
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }
    
    private function checkStorage(): array
    {
        try {
            $diskUsage = disk_free_space(storage_path()) / disk_total_space(storage_path()) * 100;
            
            return [
                'status' => $diskUsage > 10 ? 'ok' : 'warning',
                'details' => [
                    'disk_usage_percent' => 100 - $diskUsage,
                    'free_space' => formatBytes(disk_free_space(storage_path()))
                ]
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }
}
```

---

## 📊 **Monitoramento e Logs**

### **Configuração de Logs**

#### **1. Structured Logging**
```php
<?php

// config/logging.php
return [
    'default' => env('LOG_CHANNEL', 'stack'),
    
    'channels' => [
        'stack' => [
            'driver' => 'stack',
            'channels' => ['single', 'sentry'],
            'ignore_exceptions' => false,
        ],
        
        'single' => [
            'driver' => 'single',
            'path' => storage_path('logs/laravel.log'),
            'level' => env('LOG_LEVEL', 'debug'),
            'formatter' => Monolog\Formatter\JsonFormatter::class,
        ],
        
        'medical_actions' => [
            'driver' => 'daily',
            'path' => storage_path('logs/medical_actions.log'),
            'level' => 'info',
            'days' => 30,
            'formatter' => Monolog\Formatter\JsonFormatter::class,
        ],
        
        'security' => [
            'driver' => 'daily',
            'path' => storage_path('logs/security.log'),
            'level' => 'warning',
            'days' => 90,
            'formatter' => Monolog\Formatter\JsonFormatter::class,
        ],
        
        'performance' => [
            'driver' => 'daily',
            'path' => storage_path('logs/performance.log'),
            'level' => 'info',
            'days' => 7,
            'formatter' => Monolog\Formatter\JsonFormatter::class,
        ],
        
        'sentry' => [
            'driver' => 'sentry',
            'level' => 'error',
            'bubble' => true,
        ],
    ],
];
```

#### **2. Custom Log Middleware**
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class LogRequests
{
    public function handle(Request $request, Closure $next)
    {
        $startTime = microtime(true);
        
        $response = $next($request);
        
        $endTime = microtime(true);
        $duration = ($endTime - $startTime) * 1000; // Convert to milliseconds
        
        $logData = [
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => auth()->id(),
            'response_status' => $response->getStatusCode(),
            'duration_ms' => round($duration, 2),
            'memory_usage' => memory_get_peak_usage(true),
            'timestamp' => now()->toISOString(),
        ];
        
        // Log slow requests
        if ($duration > 1000) {
            Log::channel('performance')->warning('Slow request detected', $logData);
        }
        
        // Log error responses
        if ($response->getStatusCode() >= 400) {
            Log::channel('security')->info('HTTP error response', $logData);
        }
        
        return $response;
    }
}
```

#### **3. Medical Action Logger**
```php
<?php

namespace App\Services\Audit;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class MedicalActionLogger
{
    public static function log(string $action, array $context, User $user): void
    {
        $logData = [
            'action' => $action,
            'user_id' => $user->id,
            'user_name' => $user->name,
            'user_crm' => $user->crm,
            'context' => $context,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now()->toISOString(),
        ];
        
        Log::channel('medical_actions')->info($action, $logData);
    }
    
    public static function patientCreated(Patient $patient, User $doctor): void
    {
        self::log('patient_created', [
            'patient_id' => $patient->id,
            'patient_name' => $patient->name,
            'patient_cpf' => $patient->cpf,
        ], $doctor);
    }
    
    public static function consultationCompleted(Consultation $consultation, User $doctor): void
    {
        self::log('consultation_completed', [
            'consultation_id' => $consultation->id,
            'patient_id' => $consultation->patient_id,
            'patient_name' => $consultation->patient->name,
            'diagnosis' => $consultation->diagnosis,
        ], $doctor);
    }
    
    public static function prescriptionCreated(Prescription $prescription, User $doctor): void
    {
        self::log('prescription_created', [
            'prescription_id' => $prescription->id,
            'patient_id' => $prescription->patient_id,
            'medications_count' => count($prescription->medications ?? []),
        ], $doctor);
    }
}
```

### **Application Performance Monitoring**

#### **1. Laravel Telescope Configuration**
```php
<?php

// config/telescope.php
return [
    'enabled' => env('TELESCOPE_ENABLED', false),
    
    'storage' => [
        'database' => [
            'connection' => env('TELESCOPE_DB_CONNECTION', 'mysql'),
            'chunk' => 1000,
        ],
    ],
    
    'watchers' => [
        Watchers\CacheWatcher::class => env('TELESCOPE_CACHE_WATCHER', true),
        Watchers\CommandWatcher::class => env('TELESCOPE_COMMAND_WATCHER', true),
        Watchers\DumpWatcher::class => env('TELESCOPE_DUMP_WATCHER', true),
        Watchers\EventWatcher::class => env('TELESCOPE_EVENT_WATCHER', true),
        Watchers\ExceptionWatcher::class => env('TELESCOPE_EXCEPTION_WATCHER', true),
        Watchers\JobWatcher::class => env('TELESCOPE_JOB_WATCHER', true),
        Watchers\LogWatcher::class => env('TELESCOPE_LOG_WATCHER', true),
        Watchers\MailWatcher::class => env('TELESCOPE_MAIL_WATCHER', true),
        Watchers\ModelWatcher::class => [
            'enabled' => env('TELESCOPE_MODEL_WATCHER', true),
            'hydrations' => true,
        ],
        Watchers\NotificationWatcher::class => env('TELESCOPE_NOTIFICATION_WATCHER', true),
        Watchers\QueryWatcher::class => [
            'enabled' => env('TELESCOPE_QUERY_WATCHER', true),
            'slow' => 100, // Log queries slower than 100ms
        ],
        Watchers\RedisWatcher::class => env('TELESCOPE_REDIS_WATCHER', true),
        Watchers\RequestWatcher::class => [
            'enabled' => env('TELESCOPE_REQUEST_WATCHER', true),
            'size_limit' => 64,
        ],
        Watchers\ScheduleWatcher::class => env('TELESCOPE_SCHEDULE_WATCHER', true),
        Watchers\ViewWatcher::class => env('TELESCOPE_VIEW_WATCHER', true),
    ],
];
```

#### **2. Custom Performance Metrics**
```php
<?php

namespace App\Services\Monitoring;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class MetricsCollector
{
    public function collectSystemMetrics(): array
    {
        return [
            'database' => $this->getDatabaseMetrics(),
            'cache' => $this->getCacheMetrics(),
            'queue' => $this->getQueueMetrics(),
            'application' => $this->getApplicationMetrics(),
        ];
    }
    
    private function getDatabaseMetrics(): array
    {
        $connectionName = config('database.default');
        $connection = DB::connection($connectionName);
        
        // Get slow queries from the last hour
        $slowQueries = DB::table('telescope_entries')
            ->where('type', 'query')
            ->where('created_at', '>=', now()->subHour())
            ->whereRaw('JSON_EXTRACT(content, "$.time") > 100')
            ->count();
        
        return [
            'connection_status' => 'connected',
            'slow_queries_last_hour' => $slowQueries,
            'active_connections' => $this->getActiveConnections(),
        ];
    }
    
    private function getCacheMetrics(): array
    {
        $hitRate = Cache::get('cache_hit_rate', 0);
        $missRate = Cache::get('cache_miss_rate', 0);
        
        return [
            'hit_rate' => $hitRate,
            'miss_rate' => $missRate,
            'memory_usage' => $this->getCacheMemoryUsage(),
        ];
    }
    
    private function getQueueMetrics(): array
    {
        return [
            'pending_jobs' => DB::table('jobs')->count(),
            'failed_jobs' => DB::table('failed_jobs')->count(),
            'processed_jobs_last_hour' => $this->getProcessedJobsCount(),
        ];
    }
    
    private function getApplicationMetrics(): array
    {
        return [
            'active_users' => $this->getActiveUsersCount(),
            'total_patients' => DB::table('patients')->count(),
            'consultations_today' => DB::table('consultations')
                ->whereDate('consultation_date', today())
                ->count(),
            'memory_usage' => memory_get_peak_usage(true),
            'cpu_usage' => sys_getloadavg()[0],
        ];
    }
    
    private function getActiveUsersCount(): int
    {
        return DB::table('users')
            ->where('last_login_at', '>=', now()->subMinutes(30))
            ->count();
    }
    
    private function getProcessedJobsCount(): int
    {
        return DB::table('telescope_entries')
            ->where('type', 'job')
            ->where('created_at', '>=', now()->subHour())
            ->count();
    }
}
```

### **Error Tracking com Sentry**

#### **1. Configuração Sentry**
```php
<?php

// config/sentry.php
return [
    'dsn' => env('SENTRY_LARAVEL_DSN'),
    
    'breadcrumbs' => [
        'logs' => true,
        'cache' => true,
        'livewire' => true,
        'sql_queries' => true,
        'sql_bindings' => true,
        'queue_info' => true,
        'command_info' => true,
    ],
    
    'tracing' => [
        'enabled' => env('SENTRY_TRACING_ENABLED', false),
        'sample_rate' => env('SENTRY_TRACING_SAMPLE_RATE', 0.2),
        'queue_job_transactions' => true,
        'queue_jobs' => true,
        'sql_queries' => true,
        'redis_commands' => true,
        'http_client_requests' => true,
    ],
    
    'profiles' => [
        'sample_rate' => env('SENTRY_PROFILING_SAMPLE_RATE', 0.0),
    ],
    
    'send_default_pii' => false,
    'attach_stacktrace' => true,
    'context_lines' => 5,
    
    'environment' => env('SENTRY_ENVIRONMENT', env('APP_ENV')),
    'release' => env('SENTRY_RELEASE'),
    
    'before_send' => function (\Sentry\Event $event): ?\Sentry\Event {
        // Filter out sensitive data
        if ($event->getRequest()) {
            $request = $event->getRequest();
            $request->setData(array_filter($request->getData() ?? [], function ($key) {
                return !in_array($key, ['password', 'token', 'credit_card']);
            }, ARRAY_FILTER_USE_KEY));
        }
        
        return $event;
    },
];
```

#### **2. Custom Error Handler**
```php
<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Sentry\Laravel\Integration;

class Handler extends ExceptionHandler
{
    protected $dontReport = [
        \Illuminate\Auth\AuthenticationException::class,
        \Illuminate\Auth\Access\AuthorizationException::class,
        \Symfony\Component\HttpKernel\Exception\HttpException::class,
        \Illuminate\Database\Eloquent\ModelNotFoundException::class,
        \Illuminate\Session\TokenMismatchException::class,
        \Illuminate\Validation\ValidationException::class,
    ];

    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            if (app()->bound('sentry')) {
                app('sentry')->configureScope(function (\Sentry\State\Scope $scope) {
                    if (auth()->check()) {
                        $scope->setUser([
                            'id' => auth()->id(),
                            'email' => auth()->user()->email,
                            'plan_type' => auth()->user()->plan_type,
                        ]);
                    }
                    
                    $scope->setContext('server', [
                        'name' => gethostname(),
                        'version' => app()->version(),
                        'environment' => app()->environment(),
                    ]);
                });
            }
        });

        $this->renderable(function (\App\Exceptions\BusinessRuleException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'type' => 'business_rule_violation'
                ], 422);
            }
        });
    }
}
```

#### **3. Custom Exceptions**
```php
<?php

namespace App\Exceptions;

use Exception;

class BusinessRuleException extends Exception
{
    public function __construct(string $message, int $code = 422)
    {
        parent::__construct($message, $code);
    }
    
    public function report(): bool
    {
        // Don't report business rule exceptions to Sentry
        return false;
    }
}

class PaymentFailedException extends Exception
{
    public function __construct(string $message, ?Throwable $previous = null)
    {
        parent::__construct($message, 500, $previous);
    }
    
    public function context(): array
    {
        return [
            'payment_gateway' => 'stripe',
            'timestamp' => now()->toISOString(),
        ];
    }
}

class ModuleLimitExceededException extends Exception
{
    public function __construct(string $module, int $limit, int $current)
    {
        $message = "Limite do módulo '{$module}' excedido. Limite: {$limit}, Atual: {$current}";
        parent::__construct($message, 403);
    }
}
```

---

## 📚 **Documentação**

### **API Documentation com Scribe**

#### **1. Configuração Scribe**
```php
<?php

// config/scribe.php
return [
    'theme' => 'default',
    'title' => 'Médico no Bolso API',
    'description' => 'API completa para sistema de gestão médica',
    'base_url' => null,
    'routes' => [
        [
            'match' => [
                'domains' => ['*'],
                'prefixes' => ['api/*'],
                'versions' => ['v1'],
            ],
            'include' => [
                // Specific routes to include
            ],
            'exclude' => [
                'api/health',
                'api/webhooks/*',
            ],
        ],
    ],
    'type' => 'static',
    'static' => [
        'output_path' => 'public/docs',
    ],
    'laravel' => [
        'add_routes' => true,
        'docs_url' => '/docs',
    ],
    'try_it_out' => [
        'enabled' => true,
        'base_url' => null,
        'use_csrf' => false,
    ],
    'auth' => [
        'enabled' => true,
        'default' => false,
        'in' => 'bearer',
        'name' => 'Authorization',
        'use_value' => env('SCRIBE_AUTH_KEY'),
        'placeholder' => '{YOUR_AUTH_KEY}',
        'extra_info' => 'You can retrieve your token by making a POST request to `/api/v1/auth/login`.',
    ],
];
```

#### **2. Documentar Controllers**
```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;

/**
 * @group Patient Management
 * 
 * APIs for managing patients
 */
class PatientController extends Controller
{
    /**
     * List patients
     * 
     * Get a paginated list of patients for the authenticated doctor.
     * 
     * @queryParam page integer The page number. Example: 1
     * @queryParam per_page integer Number of patients per page. Example: 15
     * @queryParam search string Filter patients by name, CPF, or phone. Example: João
     * @queryParam gender string Filter by gender. Example: male
     * @queryParam active boolean Filter by active status. Example: true
     * 
     * @response 200 {
     *   "data": [
     *     {
     *       "id": 1,
     *       "uuid": "550e8400-e29b-41d4-a716-446655440000",
     *       "name": "João Silva",
     *       "cpf": "123.456.789-00",
     *       "birth_date": "1990-01-01",
     *       "age": 33,
     *       "gender": "male",
     *       "phone": "(11) 99999-9999",
     *       "email": "joao@example.com",
     *       "last_consultation_date": "2024-01-15",
     *       "created_at": "2024-01-01T10:00:00.000000Z",
     *       "can": {
     *         "update": true,
     *         "delete": true,
     *         "view_medical_data": true
     *       }
     *     }
     *   ],
     *   "meta": {
     *     "current_page": 1,
     *     "per_page": 15,
     *     "total": 50,
     *     "last_page": 4
     *   },
     *   "links": {
     *     "first": "http://localhost/api/v1/patients?page=1",
     *     "last": "http://localhost/api/v1/patients?page=4",
     *     "prev": null,
     *     "next": "http://localhost/api/v1/patients?page=2"
     *   }
     * }
     * 
     * @authenticated
     */
    public function index(Request $request): JsonResponse
    {
        // Implementation...
    }

    /**
     * Create patient
     * 
     * Create a new patient for the authenticated doctor.
     * 
     * @bodyParam name string required Patient's full name. Example: João Silva
     * @bodyParam cpf string Patient's CPF. Example: 123.456.789-00
     * @bodyParam birth_date date Patient's birth date. Example: 1990-01-01
     * @bodyParam gender string Patient's gender. Example: male
     * @bodyParam phone string Patient's phone number. Example: (11) 99999-9999
     * @bodyParam email string Patient's email. Example: joao@example.com
     * @bodyParam address object Patient's address information.
     * @bodyParam address.street string Street name. Example: Rua das Flores
     * @bodyParam address.number string House/building number. Example: 123
     * @bodyParam address.city string City name. Example: São Paulo
     * @bodyParam address.state string State abbreviation. Example: SP
     * @bodyParam address.postal_code string Postal code. Example: 01234-567
     * 
     * @response 201 {
     *   "message": "Paciente criado com sucesso!",
     *   "data": {
     *     "id": 1,
     *     "uuid": "550e8400-e29b-41d4-a716-446655440000",
     *     "name": "João Silva",
     *     "cpf": "123.456.789-00",
     *     "birth_date": "1990-01-01",
     *     "age": 33,
     *     "gender": "male",
     *     "phone": "(11) 99999-9999",
     *     "email": "joao@example.com",
     *     "created_at": "2024-01-01T10:00:00.000000Z"
     *   }
     * }
     * 
     * @response 422 {
     *   "message": "The given data was invalid.",
     *   "errors": {
     *     "name": ["The name field is required."],
     *     "cpf": ["The cpf format is invalid."]
     *   }
     * }
     * 
     * @response 403 {
     *   "message": "Limite de pacientes excedido para seu plano atual."
     * }
     * 
     * @authenticated
     */
    public function store(StorePatientRequest $request): JsonResponse
    {
        // Implementation...
    }
}
```

### **Code Documentation Standards**

#### **1. PHP Doc Standards**
```php
<?php

namespace App\Services\Medical;

/**
 * Service responsible for patient management operations
 * 
 * This service handles all business logic related to patient management,
 * including creation, updates, medical history, and relationship management.
 * 
 * @package App\Services\Medical
 * @author Development Team
 * @since 1.0.0
 * @version 1.2.0
 */
class PatientService
{
    /**
     * Create a new patient with full validation and business rules
     * 
     * This method validates plan limits, creates the patient record,
     * and triggers relevant events for audit and notification purposes.
     * 
     * @param PatientData $data The validated patient data
     * @param User $doctor The doctor creating the patient
     * 
     * @return Patient The created patient instance
     * 
     * @throws ModuleLimitExceededException When patient limit is exceeded
     * @throws ValidationException When data validation fails
     * @throws BusinessRuleException When business rules are violated
     * 
     * @example
     * ```php
     * $patientData = PatientData::from([
     *     'name' => 'João Silva',
     *     'cpf' => '123.456.789-00',
     *     'birth_date' => '1990-01-01'
     * ]);
     * 
     * $patient = $patientService->create($patientData, $doctor);
     * ```
     * 
     * @see PatientData For data structure
     * @see Patient For return type
     * @since 1.0.0
     */
    public function create(PatientData $data, User $doctor): Patient
    {
        // Implementation...
    }

    /**
     * Update patient information with change tracking
     * 
     * @param Patient $patient The patient to update
     * @param PatientData $data The new patient data
     * 
     * @return Patient The updated patient instance
     * 
     * @throws AuthorizationException When user cannot update this patient
     * @throws ValidationException When data validation fails
     * 
     * @since 1.0.0
     * @version 1.1.0 Added change tracking
     */
    public function update(Patient $patient, PatientData $data): Patient
    {
        // Implementation...
    }
}
```

#### **2. Frontend Documentation**
```typescript
/**
 * Composable for patient management operations
 * 
 * Provides reactive state management and API operations for patient data.
 * Handles loading states, error management, and cache invalidation.
 * 
 * @example
 * ```typescript
 * const patientsHook = usePatientsStore();
 * const { 
 *   patients, 
 *   loading, 
 *   createPatient, 
 *   fetchPatients 
 * } = usePatients()
 * 
 * // Load patients
 * await fetchPatients()
 * 
 * // Create new patient
 * await createPatient({
 *   name: 'João Silva',
 *   cpf: '123.456.789-00'
 * })
 * </script>
 * ```
*
* @returns {Object} Patient management operations and state
* @since 1.0.0
  */
  export function usePatients() {
  /**
    * Reactive array of patients
    * @type {Ref<Patient[]>}
      */
      const patients = ref<Patient[]>([])

  /**
    * Loading state indicator
    * @type {Ref<boolean>}
      */
      const [loading, setLoading] = useState(false)

  /**
    * Create a new patient
    *
    * @param {Partial<Patient>} patientData - Patient information
    * @returns {Promise<Patient>} Created patient
    * @throws {Error} When creation fails
      */
      const createPatient = async (patientData: Partial<Patient>): Promise<Patient> => {
      // Implementation...
      }

  return {
  patients: readonly(patients),
  loading: readonly(loading),
  createPatient,
  // ... other methods
  }
  }
```

### **Deployment Documentation**

#### **1. README.md Principal**
```markdown
# 🏥 Médico no Bolso v2.0

Sistema completo de gestão médica construído com Laravel e React, seguindo as melhores práticas de desenvolvimento.

## 🚀 Quick Start

### Pré-requisitos
- PHP 8.3+
- Node.js 18+
- MySQL 8.0+
- Redis 7.0+
- Composer 2.x

### Instalação Local

1. **Clone o repositório**
```bash
git clone https://github.com/username/medico-bolso-v2.git
cd medico-bolso-v2
```

2. **Instale dependências**
```bash
composer install
npm install
```

3. **Configure ambiente**
```bash
cp .env.example .env
php artisan key:generate
```

4. **Configure banco de dados**
```bash
php artisan migrate --seed
```

5. **Build assets**
```bash
npm run build
```

6. **Inicie servidor**
```bash
php artisan serve
```

### Docker Setup

```bash
docker-compose up -d
docker-compose exec app php artisan migrate --seed
```

## 📖 Documentação

- [📋 API Documentation](./docs/api.md)
- [🏗️ Architecture Guide](./docs/architecture.md)
- [🔧 Development Setup](./docs/development.md)
- [🚀 Deployment Guide](./docs/deployment.md)
- [🧪 Testing Guide](./docs/testing.md)
- [🔒 Security Guidelines](./docs/security.md)

## 🧪 Testes

```bash
# Rodar todos os testes
php artisan test

# Testes com coverage
php artisan test --coverage

# Testes específicos
php artisan test --filter=PatientManagementTest
```

## 📊 Métricas de Qualidade

- **Test Coverage**: > 80%
- **PHPStan Level**: 8
- **Performance**: < 200ms average response time
- **Security**: A+ rating

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
```

#### **2. Environment Configuration Guide**
```markdown
# 🔧 Environment Configuration

## Environment Variables

### Application
```env
APP_NAME="Médico no Bolso"
APP_ENV=production
APP_KEY=base64:GENERATED_KEY
APP_DEBUG=false
APP_URL=https://mediconobolso.app
APP_VERSION=2.0.0
```

### Database
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=medico_bolso
DB_USERNAME=username
DB_PASSWORD=password
```

### Redis
```env
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
REDIS_DB=0
```

### External Services
```env
# Stripe
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI
OPENAI_API_KEY=sk-...

# WhatsApp
WHATSAPP_API_TOKEN=...

# Sentry
SENTRY_LARAVEL_DSN=https://...@sentry.io/...
SENTRY_TRACES_SAMPLE_RATE=0.1
```

### Mail
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@mediconobolso.app
MAIL_FROM_NAME="${APP_NAME}"
```

## Production Optimizations

### PHP Configuration
```ini
# php.ini
memory_limit=256M
max_execution_time=60
max_input_vars=3000
post_max_size=50M
upload_max_filesize=50M
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
```

### MySQL Configuration
```ini
# my.cnf
[mysqld]
innodb_buffer_pool_size=1G
innodb_log_file_size=256M
innodb_flush_log_at_trx_commit=2
query_cache_type=1
query_cache_size=64M
max_connections=200
```

### Nginx Configuration
```nginx
# Optimizations
client_max_body_size 50M;
fastcgi_read_timeout 300;
fastcgi_buffers 16 16k;
fastcgi_buffer_size 32k;

# Gzip
gzip on;
gzip_types text/css text/javascript application/javascript application/json;
gzip_min_length 1000;
```
```

---

## 🎯 **Roadmap e Próximos Passos**

### **Fase 1: Setup e Fundação (Semanas 1-4)**

#### **Semana 1: Infraestrutura Base**
- ✅ Setup inicial do Laravel 11
- ✅ Configuração MySQL + Redis
- ✅ Docker containerization
- ✅ CI/CD básico com GitHub Actions
- ✅ Configuração de ambientes (dev/staging/prod)

#### **Semana 2: Autenticação e Autorização**
- ✅ Sistema de autenticação com Sanctum
- ✅ Two-factor authentication (2FA)
- ✅ Sistema de permissões por planos
- ✅ Middleware de verificação de módulos
- ✅ Policies para autorização

#### **Semana 3: Base Models e Migrations**
- ✅ Todas as migrations principais
- ✅ Models com relationships
- ✅ Factories e Seeders
- ✅ Model Observers
- ✅ Soft deletes e UUID

#### **Semana 4: Frontend Foundation**
- ✅ Setup React 18 + Inertia.js
- ✅ Configuração Material-UI (MUI)
- ✅ Componentes base reutilizáveis
- ✅ Stores com React Context
- ✅ Hooks principais

### **Fase 2: Módulos Core (Semanas 5-10)**

#### **Semana 5-6: Gestão de Pacientes**
- ✅ CRUD completo de pacientes
- ✅ Upload de documentos
- ✅ Histórico médico
- ✅ Busca e filtros avançados
- ✅ Exportação de dados (PDF/Excel)

#### **Semana 7-8: Sistema de Consultas**
- ✅ Agendamento de consultas
- ✅ Calendário interativo
- ✅ Status de consultas
- ✅ Notas clínicas
- ✅ Prescrições integradas

#### **Semana 9-10: Sistema de Secretárias**
- ✅ Criação de contas isoladas
- ✅ Permissões granulares
- ✅ Dashboard específico
- ✅ Logs de auditoria
- ✅ Gerenciamento pelo médico

### **Fase 3: Funcionalidades Avançadas (Semanas 11-16)**

#### **Semana 11-12: Sistema Financeiro**
- ✅ Transações de receitas/despesas
- ✅ Contas a receber/pagar
- ✅ Dashboard financeiro
- ✅ Relatórios e gráficos
- ✅ Exportação de relatórios

#### **Semana 13-14: Integrações Externas**
- ✅ Stripe para pagamentos
- ✅ OpenAI para IA médica
- ✅ WhatsApp para comunicação
- ✅ Email transacional
- ✅ Webhooks e sincronização

#### **Semana 15-16: Features Avançadas**
- ✅ Sistema de relatórios automáticos
- ✅ Backup automático
- ✅ Análise de exames com IA
- ✅ Transcrição de áudio
- ✅ Chat médico inteligente

### **Fase 4: Otimização e Deploy (Semanas 17-20)**

#### **Semana 17: Performance e Otimização**
- ✅ Query optimization
- ✅ Cache estratégico
- ✅ Image optimization
- ✅ Lazy loading
- ✅ Database indexing

#### **Semana 18: Testes e Qualidade**
- ✅ Test coverage > 80%
- ✅ E2E testing
- ✅ Performance testing
- ✅ Security testing
- ✅ Code quality analysis

#### **Semana 19: Monitoramento e Observabilidade**
- ✅ Application monitoring
- ✅ Error tracking com Sentry
- ✅ Performance metrics
- ✅ Health checks
- ✅ Alerting system

#### **Semana 20: Deploy e Go-Live**
- ✅ Production deployment
- ✅ Migration script do Firebase
- ✅ DNS e SSL setup
- ✅ Monitoring setup
- ✅ Documentation final

---

## 🏆 **Benefícios Esperados da Migração**

### **Técnicos**

#### **Performance**
- **50%+ melhoria** na velocidade de carregamento
- **Redução de 70%** no tempo de resposta das APIs
- **Cache inteligente** com Redis
- **Queries otimizadas** com Eloquent

#### **Escalabilidade**
- **Suporte a 10x mais usuários** simultâneos
- **Architecture serverless-ready**
- **Horizontal scaling** capabilities
- **Database optimization** para grandes volumes

#### **Maintainability**
- **Clean Architecture** bem definida
- **SOLID principles** aplicados
- **Dependency injection** nativo
- **Automated testing** com > 80% coverage

#### **Developer Experience**
- **Hot reload** para desenvolvimento
- **Type safety** com TypeScript
- **IDE support** superior
- **Debugging tools** avançadas

### **Organizacionais**

#### **Custo**
- **Redução de 60%** nos custos de Firebase
- **Hosting mais barato** em VPS/cloud
- **Menos vendor lock-in**
- **Maior controle sobre infraestrutura**

#### **Flexibilidade**
- **Customizações ilimitadas**
- **Integrações mais fáceis**
- **Deploy em qualquer ambiente**
- **Backup e restore completo**

#### **Compliance**
- **LGPD compliance** nativo
- **Audit logs** completos
- **Data sovereignty** garantida
- **Security controls** granulares

---

## ⚠️ **Considerações e Riscos**

### **Riscos Técnicos**

#### **Migration Complexity**
- **Complexidade alta** na migração de dados
- **Possível downtime** durante migração
- **Data integrity** challenges
- **Feature parity** durante transição

**Mitigação:**
- Migração gradual por módulos
- Parallel running dos sistemas
- Extensive testing da migração
- Rollback plan detalhado

#### **Learning Curve**
- **Team training** necessário
- **Laravel/React** proficiency required
- **New patterns** e conventions
- **DevOps** knowledge needed

**Mitigação:**
- Training program estruturado
- Code review process rigoroso
- Documentation completa
- Mentoring durante transição

### **Riscos de Negócio**

#### **Timeline Risk**
- **Projeto pode estender** além de 20 semanas
- **Resource allocation** intensivo
- **Opportunity cost** de outras features
- **Market timing** considerations

**Mitigação:**
- Agile methodology com sprints
- MVP approach por módulo
- Continuous delivery
- Stakeholder communication regular

#### **User Impact**
- **Interface changes** podem confundir usuários
- **Training** dos usuários existentes
- **Potential bugs** durante transição
- **Support overhead** increased

**Mitigação:**
- UI/UX consistency mantida
- User training materials
- Gradual rollout strategy
- Enhanced support durante transição

---

## 🎉 **Conclusão**

Este guia apresenta uma **arquitetura robusta e profissional** para migrar o sistema Médico no Bolso para uma stack moderna Laravel + React. Os benefícios superam significativamente os riscos:

### **Principais Vantagens:**

1. **🏗️ Arquitetura Sólida**: Clean Architecture + DDD + SOLID principles
2. **⚡ Performance Superior**: 50%+ melhoria na velocidade
3. **💰 Redução de Custos**: 60% economia em infraestrutura
4. **🔒 Segurança Avançada**: LGPD compliance + audit logs
5. **📈 Escalabilidade**: Suporte a 10x mais usuários
6. **🛠️ Maintainability**: Código limpo e testável
7. **🧪 Quality Assurance**: 80%+ test coverage
8. **📊 Observabilidade**: Monitoring e alerting completos

### **Recomendações para o Sucesso:**

1. **📋 Planejamento Detalhado**: Seguir o roadmap de 20 semanas
2. **🧪 Testing First**: TDD desde o início
3. **📚 Documentation**: Manter documentação atualizada
4. **🔄 Iterative Approach**: Deploy incremental por módulos
5. **👥 Team Alignment**: Training e code review regulares
6. **📊 Monitoring**: Métricas desde o primeiro deploy
7. **🚀 CI/CD**: Automatização completa do pipeline

### **Próximos Passos Imediatos:**

1. ✅ **Setup do ambiente** de desenvolvimento
2. ✅ **Configuração inicial** do Laravel + React
3. ✅ **Implementação da autenticação** básica
4. ✅ **Criação dos primeiros** models e migrations
5. ✅ **Setup do CI/CD** pipeline

Com esse guia em mãos, você tem todas as ferramentas necessárias para construir um sistema de gestão médica **profissional, escalável e maintível**. A migração será um investimento que pagará dividendos técnicos e organizacionais por anos.

**Boa sorte na jornada! 🚀**

---

<div align="center">

**💡 Lembre-se: "A arquitetura é sobre as decisões importantes que são difíceis de mudar depois."**

*Construído com ❤️ seguindo as melhores práticas da indústria*

</div>
