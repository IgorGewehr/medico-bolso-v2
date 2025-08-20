<?php

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\AnamnesisController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\NoteController;

/*
|--------------------------------------------------------------------------
| Rotas Web - Médico no Bolso v2
|--------------------------------------------------------------------------
|
| Aqui são registradas as rotas web que renderizam páginas usando Inertia.js
| Todas as rotas estão protegidas por autenticação e seguem o padrão SPA.
| As rotas de API estão em routes/api.php
|
*/

// Página inicial pública
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('home');

// Grupo de rotas autenticadas
Route::middleware(['auth:sanctum', config('jetstream.auth_session'), 'verified'])->group(function () {
    
    /*
    |--------------------------------------------------------------------------
    | Dashboard Principal
    |--------------------------------------------------------------------------
    | Página inicial do sistema com visão geral e estatísticas
    */
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Rotas de Pacientes - Interface Web
    |--------------------------------------------------------------------------
    | Páginas para gestão de pacientes
    */
    Route::prefix('patients')->name('patients.')->group(function () {
        // Páginas principais
        Route::get('/', [PatientController::class, 'index'])->name('index');
        Route::get('/create', [PatientController::class, 'create'])->name('create');
        Route::get('/{patient}', [PatientController::class, 'show'])->name('show');
        Route::get('/{patient}/edit', [PatientController::class, 'edit'])->name('edit');
        
        // Páginas de recursos relacionados
        Route::get('/{patient}/consultations', function ($patientId) {
            return Inertia::render('Consultations/Index', [
                'patient_filter' => $patientId
            ]);
        })->name('consultations');
        
        Route::get('/{patient}/medical-history', function ($patientId) {
            return Inertia::render('Patients/MedicalHistory', [
                'patient_id' => $patientId
            ]);
        })->name('medical-history');
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Consultas - Interface Web
    |--------------------------------------------------------------------------
    | Páginas para agendamento e gestão de consultas
    */
    Route::prefix('consultations')->name('consultations.')->group(function () {
        // Páginas principais
        Route::get('/', [ConsultationController::class, 'index'])->name('index');
        Route::get('/create', [ConsultationController::class, 'create'])->name('create');
        Route::get('/{consultation}', [ConsultationController::class, 'show'])->name('show');
        Route::get('/{consultation}/edit', [ConsultationController::class, 'edit'])->name('edit');
        
        // Páginas especiais
        Route::get('/calendar/view', function () {
            return Inertia::render('Consultations/Calendar');
        })->name('calendar');
        
        Route::get('/today/list', function () {
            return Inertia::render('Consultations/Today');
        })->name('today');
        
        Route::get('/reports/statistics', function () {
            return Inertia::render('Consultations/Reports');
        })->name('reports');
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Anamneses - Interface Web
    |--------------------------------------------------------------------------
    | Páginas para criação e gestão de anamneses
    */
    Route::prefix('anamneses')->name('anamneses.')->group(function () {
        // Páginas principais
        Route::get('/', [AnamnesisController::class, 'index'])->name('index');
        Route::get('/create', [AnamnesisController::class, 'create'])->name('create');
        Route::get('/{anamnesis}', [AnamnesisController::class, 'show'])->name('show');
        Route::get('/{anamnesis}/edit', [AnamnesisController::class, 'edit'])->name('edit');
        
        // Páginas especiais
        Route::get('/templates/list', function () {
            return Inertia::render('Anamnesis/Templates');
        })->name('templates');
        
        Route::get('/reports/analysis', function () {
            return Inertia::render('Anamnesis/Reports');
        })->name('reports');
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Exames - Interface Web
    |--------------------------------------------------------------------------
    | Páginas para solicitação e acompanhamento de exames
    */
    Route::prefix('exams')->name('exams.')->group(function () {
        // Páginas principais
        Route::get('/', [ExamController::class, 'index'])->name('index');
        Route::get('/create', [ExamController::class, 'create'])->name('create');
        Route::get('/{exam}', [ExamController::class, 'show'])->name('show');
        Route::get('/{exam}/edit', [ExamController::class, 'edit'])->name('edit');
        
        // Páginas especiais
        Route::get('/pending/list', function () {
            return Inertia::render('Exams/Pending');
        })->name('pending');
        
        Route::get('/results/management', function () {
            return Inertia::render('Exams/Results');
        })->name('results');
        
        Route::get('/reports/statistics', function () {
            return Inertia::render('Exams/Reports');
        })->name('reports');
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Prescrições - Interface Web
    |--------------------------------------------------------------------------
    | Páginas para criação e gestão de prescrições médicas
    */
    Route::prefix('prescriptions')->name('prescriptions.')->group(function () {
        // Páginas principais
        Route::get('/', [PrescriptionController::class, 'index'])->name('index');
        Route::get('/create', [PrescriptionController::class, 'create'])->name('create');
        Route::get('/{prescription}', [PrescriptionController::class, 'show'])->name('show');
        Route::get('/{prescription}/edit', [PrescriptionController::class, 'edit'])->name('edit');
        
        // Páginas especiais
        Route::get('/templates/library', function () {
            return Inertia::render('Prescriptions/Templates');
        })->name('templates');
        
        Route::get('/expired/management', function () {
            return Inertia::render('Prescriptions/Expired');
        })->name('expired');
        
        Route::get('/print/{prescription}', function ($prescriptionId) {
            return Inertia::render('Prescriptions/Print', [
                'prescription_id' => $prescriptionId
            ]);
        })->name('print');
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Anotações - Interface Web
    |--------------------------------------------------------------------------
    | Páginas para sistema de anotações médicas
    */
    Route::prefix('notes')->name('notes.')->group(function () {
        // Páginas principais
        Route::get('/', [NoteController::class, 'index'])->name('index');
        Route::get('/create', [NoteController::class, 'create'])->name('create');
        Route::get('/{note}', [NoteController::class, 'show'])->name('show');
        Route::get('/{note}/edit', [NoteController::class, 'edit'])->name('edit');
        
        // Páginas especiais
        Route::get('/important/list', function () {
            return Inertia::render('Notes/Important');
        })->name('important');
        
        Route::get('/search/advanced', function () {
            return Inertia::render('Notes/Search');
        })->name('search');
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Relatórios e Analytics
    |--------------------------------------------------------------------------
    | Páginas para relatórios e análises estatísticas
    */
    Route::prefix('reports')->name('reports.')->group(function () {
        // Dashboard de relatórios
        Route::get('/', function () {
            return Inertia::render('Reports/Dashboard');
        })->name('dashboard');
        
        // Relatórios específicos
        Route::get('/patients/statistics', function () {
            return Inertia::render('Reports/Patients');
        })->name('patients');
        
        Route::get('/consultations/analytics', function () {
            return Inertia::render('Reports/Consultations');
        })->name('consultations');
        
        Route::get('/financial/overview', function () {
            return Inertia::render('Reports/Financial');
        })->name('financial');
        
        Route::get('/medical/insights', function () {
            return Inertia::render('Reports/Medical');
        })->name('medical');
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Configurações
    |--------------------------------------------------------------------------
    | Páginas para configurações do sistema e perfil médico
    */
    Route::prefix('settings')->name('settings.')->group(function () {
        // Configurações gerais
        Route::get('/', function () {
            return Inertia::render('Settings/General');
        })->name('general');
        
        // Perfil médico
        Route::get('/profile', function () {
            return Inertia::render('Settings/Profile');
        })->name('profile');
        
        // Configurações de consulta
        Route::get('/consultations', function () {
            return Inertia::render('Settings/Consultations');
        })->name('consultations');
        
        // Preferências do sistema
        Route::get('/preferences', function () {
            return Inertia::render('Settings/Preferences');
        })->name('preferences');
        
        // Backup e segurança
        Route::get('/security', function () {
            return Inertia::render('Settings/Security');
        })->name('security');
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Agenda e Agendamento
    |--------------------------------------------------------------------------
    | Páginas para gestão de agenda médica
    */
    Route::prefix('schedule')->name('schedule.')->group(function () {
        // Visualização da agenda
        Route::get('/', function () {
            return Inertia::render('Schedule/Calendar');
        })->name('calendar');
        
        // Configuração de horários
        Route::get('/slots', function () {
            return Inertia::render('Schedule/Slots');
        })->name('slots');
        
        // Bloqueios e feriados
        Route::get('/blocks', function () {
            return Inertia::render('Schedule/Blocks');
        })->name('blocks');
        
        // Configurações de agenda
        Route::get('/settings', function () {
            return Inertia::render('Schedule/Settings');
        })->name('settings');
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Busca Avançada
    |--------------------------------------------------------------------------
    | Páginas para busca unificada no sistema
    */
    Route::prefix('search')->name('search.')->group(function () {
        // Busca global
        Route::get('/', function () {
            return Inertia::render('Search/Global');
        })->name('global');
        
        // Busca avançada
        Route::get('/advanced', function () {
            return Inertia::render('Search/Advanced');
        })->name('advanced');
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Ajuda e Suporte
    |--------------------------------------------------------------------------
    | Páginas de documentação e suporte
    */
    Route::prefix('help')->name('help.')->group(function () {
        // Central de ajuda
        Route::get('/', function () {
            return Inertia::render('Help/Center');
        })->name('center');
        
        // Documentação
        Route::get('/docs', function () {
            return Inertia::render('Help/Documentation');
        })->name('docs');
        
        // FAQ
        Route::get('/faq', function () {
            return Inertia::render('Help/FAQ');
        })->name('faq');
        
        // Contato/Suporte
        Route::get('/support', function () {
            return Inertia::render('Help/Support');
        })->name('support');
    });

    /*
    |--------------------------------------------------------------------------
    | Rotas de Importação/Exportação
    |--------------------------------------------------------------------------
    | Páginas para gestão de dados
    */
    Route::prefix('data')->name('data.')->group(function () {
        // Importação de dados
        Route::get('/import', function () {
            return Inertia::render('Data/Import');
        })->name('import');
        
        // Exportação de dados
        Route::get('/export', function () {
            return Inertia::render('Data/Export');
        })->name('export');
        
        // Backup
        Route::get('/backup', function () {
            return Inertia::render('Data/Backup');
        })->name('backup');
    });
});
