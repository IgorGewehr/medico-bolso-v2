<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\AnamnesisController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\NoteController;

/*
|--------------------------------------------------------------------------
| Rotas da API - Médico no Bolso v2
|--------------------------------------------------------------------------
|
| Aqui são registradas todas as rotas da API para o sistema médico.
| Todas as rotas estão protegidas por autenticação e verificação de médico.
| Seguindo padrões RESTful com recursos aninhados quando apropriado.
|
*/

// Rota para obter dados do usuário autenticado
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Pacientes
    |--------------------------------------------------------------------------
    | Gestão completa de pacientes incluindo CRUD, favoritos e busca rápida
    */
    Route::prefix('patients')->name('patients.')->group(function () {
        // CRUD básico de pacientes
        Route::get('/', [PatientController::class, 'index'])->name('index');
        Route::post('/', [PatientController::class, 'store'])->name('store');
        Route::get('/{patient}', [PatientController::class, 'show'])->name('show');
        Route::put('/{patient}', [PatientController::class, 'update'])->name('update');
        Route::patch('/{patient}', [PatientController::class, 'update'])->name('patch');
        Route::delete('/{patient}', [PatientController::class, 'destroy'])->name('destroy');
        
        // Ações especiais de pacientes
        Route::patch('/{patient}/favorite', [PatientController::class, 'toggleFavorite'])->name('toggle-favorite');
        Route::get('/search/quick', [PatientController::class, 'search'])->name('search');
        
        // Recursos aninhados por paciente
        Route::prefix('{patient}')->group(function () {
            // Consultas do paciente
            Route::get('/consultations', [ConsultationController::class, 'byPatient'])->name('consultations');
            
            // Anamneses do paciente
            Route::get('/anamneses', [AnamnesisController::class, 'byPatient'])->name('anamneses');
            
            // Exames do paciente
            Route::get('/exams', [ExamController::class, 'byPatient'])->name('exams');
            
            // Prescrições do paciente
            Route::get('/prescriptions', [PrescriptionController::class, 'byPatient'])->name('prescriptions');
            
            // Anotações do paciente
            Route::get('/notes', [NoteController::class, 'byPatient'])->name('notes');
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Consultas
    |--------------------------------------------------------------------------
    | Agendamento e gestão de consultas médicas com diferentes modalidades
    */
    Route::prefix('consultations')->name('consultations.')->group(function () {
        // CRUD básico de consultas
        Route::get('/', [ConsultationController::class, 'index'])->name('index');
        Route::post('/', [ConsultationController::class, 'store'])->name('store');
        Route::get('/{consultation}', [ConsultationController::class, 'show'])->name('show');
        Route::put('/{consultation}', [ConsultationController::class, 'update'])->name('update');
        Route::patch('/{consultation}', [ConsultationController::class, 'update'])->name('patch');
        Route::delete('/{consultation}', [ConsultationController::class, 'destroy'])->name('destroy');
        
        // Ações especiais de consultas
        Route::patch('/{consultation}/status', [ConsultationController::class, 'updateStatus'])->name('update-status');
        
        // Consultas por período e status
        Route::get('/filter/today', [ConsultationController::class, 'today'])->name('today');
        Route::get('/filter/upcoming', [ConsultationController::class, 'upcoming'])->name('upcoming');
        
        // Estatísticas e relatórios
        Route::get('/reports/stats', [ConsultationController::class, 'stats'])->name('stats');
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Anamneses
    |--------------------------------------------------------------------------
    | Criação e gestão de anamneses médicas com templates inteligentes
    */
    Route::prefix('anamneses')->name('anamneses.')->group(function () {
        // CRUD básico de anamneses
        Route::get('/', [AnamnesisController::class, 'index'])->name('index');
        Route::post('/', [AnamnesisController::class, 'store'])->name('store');
        Route::get('/{anamnesis}', [AnamnesisController::class, 'show'])->name('show');
        Route::put('/{anamnesis}', [AnamnesisController::class, 'update'])->name('update');
        Route::patch('/{anamnesis}', [AnamnesisController::class, 'update'])->name('patch');
        Route::delete('/{anamnesis}', [AnamnesisController::class, 'destroy'])->name('destroy');
        
        // Template para nova anamnese baseada na última
        Route::get('/template/{patient}', [AnamnesisController::class, 'template'])->name('template');
        
        // Relatórios e estatísticas
        Route::get('/reports/period', [AnamnesisController::class, 'report'])->name('report');
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Exames
    |--------------------------------------------------------------------------
    | Solicitação e acompanhamento de exames médicos
    */
    Route::prefix('exams')->name('exams.')->group(function () {
        // CRUD básico de exames
        Route::get('/', [ExamController::class, 'index'])->name('index');
        Route::post('/', [ExamController::class, 'store'])->name('store');
        Route::get('/{exam}', [ExamController::class, 'show'])->name('show');
        Route::put('/{exam}', [ExamController::class, 'update'])->name('update');
        Route::patch('/{exam}', [ExamController::class, 'update'])->name('patch');
        Route::delete('/{exam}', [ExamController::class, 'destroy'])->name('destroy');
        
        // Ações especiais de exames
        Route::patch('/{exam}/status', [ExamController::class, 'updateStatus'])->name('update-status');
        
        // Filtros especiais
        Route::get('/filter/pending', [ExamController::class, 'pending'])->name('pending');
        
        // Relatórios e estatísticas
        Route::get('/reports/period', [ExamController::class, 'report'])->name('report');
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Prescrições
    |--------------------------------------------------------------------------
    | Criação e gestão de prescrições médicas com geração de PDF
    */
    Route::prefix('prescriptions')->name('prescriptions.')->group(function () {
        // CRUD básico de prescrições
        Route::get('/', [PrescriptionController::class, 'index'])->name('index');
        Route::post('/', [PrescriptionController::class, 'store'])->name('store');
        Route::get('/{prescription}', [PrescriptionController::class, 'show'])->name('show');
        Route::put('/{prescription}', [PrescriptionController::class, 'update'])->name('update');
        Route::patch('/{prescription}', [PrescriptionController::class, 'update'])->name('patch');
        Route::delete('/{prescription}', [PrescriptionController::class, 'destroy'])->name('destroy');
        
        // Filtros especiais
        Route::get('/filter/active', [PrescriptionController::class, 'active'])->name('active');
        Route::get('/filter/expired', [PrescriptionController::class, 'expired'])->name('expired');
        
        // Geração de PDF
        Route::post('/{prescription}/pdf', [PrescriptionController::class, 'generatePdf'])->name('generate-pdf');
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Anotações
    |--------------------------------------------------------------------------
    | Sistema de anotações médicas com importância e busca avançada
    */
    Route::prefix('notes')->name('notes.')->group(function () {
        // CRUD básico de anotações
        Route::get('/', [NoteController::class, 'index'])->name('index');
        Route::post('/', [NoteController::class, 'store'])->name('store');
        Route::get('/{note}', [NoteController::class, 'show'])->name('show');
        Route::put('/{note}', [NoteController::class, 'update'])->name('update');
        Route::patch('/{note}', [NoteController::class, 'update'])->name('patch');
        Route::delete('/{note}', [NoteController::class, 'destroy'])->name('destroy');
        
        // Ações especiais
        Route::patch('/{note}/important', [NoteController::class, 'toggleImportant'])->name('toggle-important');
        
        // Filtros especiais
        Route::get('/filter/important', [NoteController::class, 'important'])->name('important');
        
        // Busca rápida
        Route::get('/search/quick', [NoteController::class, 'search'])->name('search');
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Dashboard e Estatísticas Gerais
    |--------------------------------------------------------------------------
    | Informações agregadas e visão geral do sistema
    */
    Route::prefix('dashboard')->name('dashboard.')->group(function () {
        // Estatísticas gerais
        Route::get('/stats', function (Request $request) {
            $doctorId = auth()->id();
            
            return response()->json([
                'patients' => [
                    'total' => \App\Models\Patient::where('doctor_id', $doctorId)->count(),
                    'favorites' => \App\Models\Patient::where('doctor_id', $doctorId)->where('favorite', true)->count(),
                    'new_this_month' => \App\Models\Patient::where('doctor_id', $doctorId)
                        ->whereMonth('created_at', now()->month)
                        ->whereYear('created_at', now()->year)
                        ->count(),
                ],
                'consultations' => [
                    'total' => \App\Models\Consultation::where('doctor_id', $doctorId)->count(),
                    'today' => \App\Models\Consultation::where('doctor_id', $doctorId)->today()->count(),
                    'upcoming' => \App\Models\Consultation::where('doctor_id', $doctorId)->upcoming()->count(),
                    'this_month' => \App\Models\Consultation::where('doctor_id', $doctorId)
                        ->whereMonth('consultation_date', now()->month)
                        ->whereYear('consultation_date', now()->year)
                        ->count(),
                ],
                'exams' => [
                    'total' => \App\Models\Exam::where('doctor_id', $doctorId)->count(),
                    'pending' => \App\Models\Exam::where('doctor_id', $doctorId)->byStatus('pending')->count(),
                    'completed' => \App\Models\Exam::where('doctor_id', $doctorId)->byStatus('completed')->count(),
                ],
                'prescriptions' => [
                    'total' => \App\Models\Prescription::where('doctor_id', $doctorId)->count(),
                    'active' => \App\Models\Prescription::where('doctor_id', $doctorId)->active()->count(),
                    'expired' => \App\Models\Prescription::where('doctor_id', $doctorId)->expired()->count(),
                ],
                'notes' => [
                    'total' => \App\Models\Note::where('doctor_id', $doctorId)->count(),
                    'important' => \App\Models\Note::where('doctor_id', $doctorId)->important()->count(),
                ]
            ]);
        })->name('stats');
        
        // Atividades recentes
        Route::get('/recent-activity', function (Request $request) {
            $doctorId = auth()->id();
            $limit = $request->get('limit', 10);
            
            // Últimas consultas
            $recentConsultations = \App\Models\Consultation::where('doctor_id', $doctorId)
                ->with('patient:id,patient_name,nome')
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($item) {
                    return [
                        'type' => 'consultation',
                        'title' => 'Consulta agendada',
                        'description' => 'Paciente: ' . ($item->patient->patient_name ?? $item->patient->nome),
                        'date' => $item->consultation_date,
                        'created_at' => $item->created_at
                    ];
                });
            
            // Últimos exames
            $recentExams = \App\Models\Exam::where('doctor_id', $doctorId)
                ->with('patient:id,patient_name,nome')
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($item) {
                    return [
                        'type' => 'exam',
                        'title' => 'Exame solicitado',
                        'description' => $item->exam_name . ' - ' . ($item->patient->patient_name ?? $item->patient->nome),
                        'date' => $item->exam_date,
                        'created_at' => $item->created_at
                    ];
                });
            
            // Últimas prescrições
            $recentPrescriptions = \App\Models\Prescription::where('doctor_id', $doctorId)
                ->with('patient:id,patient_name,nome')
                ->orderBy('created_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($item) {
                    return [
                        'type' => 'prescription',
                        'title' => 'Prescrição criada',
                        'description' => $item->titulo . ' - ' . ($item->patient->patient_name ?? $item->patient->nome),
                        'date' => $item->data_emissao,
                        'created_at' => $item->created_at
                    ];
                });
            
            // Combinar e ordenar por data de criação
            $activities = collect()
                ->concat($recentConsultations)
                ->concat($recentExams)
                ->concat($recentPrescriptions)
                ->sortByDesc('created_at')
                ->take($limit)
                ->values();
            
            return response()->json([
                'activities' => $activities
            ]);
        })->name('recent-activity');
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Busca Global
    |--------------------------------------------------------------------------
    | Sistema de busca unificada em todos os recursos
    */
    Route::prefix('search')->name('search.')->group(function () {
        // Busca global em todos os recursos
        Route::get('/global', function (Request $request) {
            $query = $request->get('q', '');
            $doctorId = auth()->id();
            
            if (strlen($query) < 2) {
                return response()->json([
                    'patients' => [],
                    'consultations' => [],
                    'notes' => [],
                    'exams' => [],
                    'prescriptions' => []
                ]);
            }
            
            // Buscar pacientes
            $patients = \App\Models\Patient::where('doctor_id', $doctorId)
                ->where(function ($q) use ($query) {
                    $q->where('patient_name', 'like', "%{$query}%")
                      ->orWhere('nome', 'like', "%{$query}%")
                      ->orWhere('patient_email', 'like', "%{$query}%");
                })
                ->select(['id', 'patient_name', 'nome', 'patient_email'])
                ->limit(5)
                ->get();
            
            // Buscar consultas
            $consultations = \App\Models\Consultation::where('doctor_id', $doctorId)
                ->where(function ($q) use ($query) {
                    $q->where('reason_for_visit', 'like', "%{$query}%")
                      ->orWhere('diagnosis', 'like', "%{$query}%");
                })
                ->with('patient:id,patient_name,nome')
                ->select(['id', 'patient_id', 'reason_for_visit', 'consultation_date'])
                ->limit(5)
                ->get();
            
            // Buscar anotações
            $notes = \App\Models\Note::where('doctor_id', $doctorId)
                ->where(function ($q) use ($query) {
                    $q->where('note_title', 'like', "%{$query}%")
                      ->orWhere('note_text', 'like', "%{$query}%");
                })
                ->with('patient:id,patient_name,nome')
                ->select(['id', 'patient_id', 'note_title', 'created_at'])
                ->limit(5)
                ->get();
            
            // Buscar exames
            $exams = \App\Models\Exam::where('doctor_id', $doctorId)
                ->where('exam_name', 'like', "%{$query}%")
                ->with('patient:id,patient_name,nome')
                ->select(['id', 'patient_id', 'exam_name', 'exam_date', 'status'])
                ->limit(5)
                ->get();
            
            // Buscar prescrições
            $prescriptions = \App\Models\Prescription::where('doctor_id', $doctorId)
                ->where(function ($q) use ($query) {
                    $q->where('titulo', 'like', "%{$query}%")
                      ->orWhere('general_instructions', 'like', "%{$query}%");
                })
                ->with('patient:id,patient_name,nome')
                ->select(['id', 'patient_id', 'titulo', 'data_emissao'])
                ->limit(5)
                ->get();
            
            return response()->json([
                'patients' => $patients,
                'consultations' => $consultations,
                'notes' => $notes,
                'exams' => $exams,
                'prescriptions' => $prescriptions
            ]);
        })->name('global');
    });
});