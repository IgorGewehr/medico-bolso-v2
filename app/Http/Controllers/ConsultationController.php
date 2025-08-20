<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use App\Models\Consultation;
use App\Models\Patient;
use App\Models\Prescription;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ConsultationController extends Controller
{
    /**
     * Lista todas as consultas do médico logado
     */
    public function index(Request $request): Response
    {
        try {
            $query = Consultation::where('doctor_id', auth()->id())
                ->with([
                    'patient:id,patient_name,nome,patient_phone,patient_email',
                    'prescription:id,consultation_id,medications'
                ]);

            // Filtros
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            if ($request->has('consultation_type') && $request->consultation_type) {
                $query->where('consultation_type', $request->consultation_type);
            }

            if ($request->has('patient_id') && $request->patient_id) {
                $query->where('patient_id', $request->patient_id);
            }

            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('consultation_date', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('consultation_date', '<=', $request->date_to);
            }

            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->whereHas('patient', function ($q) use ($search) {
                    $q->where('patient_name', 'like', "%{$search}%")
                      ->orWhere('nome', 'like', "%{$search}%");
                })->orWhere('reason_for_visit', 'like', "%{$search}%")
                  ->orWhere('diagnosis', 'like', "%{$search}%");
            }

            // Ordenação
            $sortBy = $request->get('sort_by', 'consultation_date');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortBy, $sortDirection);

            $consultations = $query->paginate($request->get('per_page', 15));

            // Estatísticas
            $doctorId = auth()->id();
            $stats = [
                'total' => Consultation::where('doctor_id', $doctorId)->count(),
                'today' => Consultation::where('doctor_id', $doctorId)->today()->count(),
                'upcoming' => Consultation::where('doctor_id', $doctorId)->upcoming()->count(),
                'completed' => Consultation::where('doctor_id', $doctorId)->byStatus('completed')->count(),
                'scheduled' => Consultation::where('doctor_id', $doctorId)->byStatus('scheduled')->count(),
                'cancelled' => Consultation::where('doctor_id', $doctorId)->byStatus('cancelled')->count(),
                'avg_duration' => Consultation::where('doctor_id', $doctorId)
                    ->whereNotNull('consultation_duration')
                    ->avg('consultation_duration')
            ];

            return Inertia::render('Consultations/Index', [
                'consultations' => $consultations,
                'stats' => $stats,
                'filters' => $request->only(['status', 'consultation_type', 'patient_id', 'date_from', 'date_to', 'search', 'sort_by', 'sort_direction'])
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao listar consultas: ' . $e->getMessage());
            
            return Inertia::render('Consultations/Index', [
                'consultations' => collect([]),
                'stats' => ['total' => 0, 'today' => 0, 'upcoming' => 0, 'completed' => 0, 'scheduled' => 0, 'cancelled' => 0, 'avg_duration' => 0],
                'error' => 'Erro ao carregar consultas. Tente novamente.'
            ]);
        }
    }

    /**
     * Exibe formulário de criação de consulta
     */
    public function create(Request $request): Response
    {
        $patients = Patient::where('doctor_id', auth()->id())
            ->select(['id', 'patient_name', 'nome', 'patient_phone'])
            ->orderBy('patient_name')
            ->get();

        return Inertia::render('Consultations/Create', [
            'patients' => $patients,
            'preselected_patient' => $request->get('patient_id')
        ]);
    }

    /**
     * Armazena nova consulta
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'patient_id' => 'required|exists:patients,id',
                'consultation_date' => 'required|date|after_or_equal:today',
                'consultation_time' => 'required|date_format:H:i',
                'consultation_duration' => 'nullable|integer|min:15|max:480',
                'consultation_type' => 'required|in:presencial,online,domicilio,emergencia',
                'room_link' => 'nullable|url|required_if:consultation_type,online',
                'status' => 'nullable|in:scheduled,in_progress,completed,cancelled,no_show',
                'reason_for_visit' => 'required|string|max:500',
                'clinical_notes' => 'nullable|string|max:2000',
                'diagnosis' => 'nullable|string|max:1000',
                'procedures_performed' => 'nullable|array',
                'referrals' => 'nullable|array',
                'exams_requested' => 'nullable|array',
                'follow_up' => 'nullable|array',
                'additional_notes' => 'nullable|string|max:1000'
            ]);

            // Verificar se o paciente pertence ao médico
            $patient = Patient::where('doctor_id', auth()->id())
                ->where('id', $validated['patient_id'])
                ->firstOrFail();

            DB::beginTransaction();

            $validated['doctor_id'] = auth()->id();
            $validated['status'] = $validated['status'] ?? 'scheduled';

            // Combinar data e hora
            $consultationDateTime = Carbon::parse($validated['consultation_date'] . ' ' . $validated['consultation_time']);
            $validated['consultation_date'] = $consultationDateTime;

            $consultation = Consultation::create($validated);

            // Atualizar última consulta do paciente
            $patient->update(['last_consultation_date' => $consultation->consultation_date]);

            DB::commit();

            Log::info("Consulta criada: {$consultation->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Consulta agendada com sucesso!',
                'consultation' => $consultation->load(['patient', 'prescription'])
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao criar consulta: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Exibe detalhes da consulta
     */
    public function show(string $id): Response
    {
        try {
            $consultation = Consultation::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->with([
                    'patient',
                    'prescription.medications',
                    'exams' => fn($q) => $q->orderBy('exam_date', 'desc')
                ])
                ->firstOrFail();

            return Inertia::render('Consultations/Show', [
                'consultation' => $consultation
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao exibir consulta {$id}: " . $e->getMessage());
            abort(404, 'Consulta não encontrada');
        }
    }

    /**
     * Exibe formulário de edição
     */
    public function edit(string $id): Response
    {
        try {
            $consultation = Consultation::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->with('patient')
                ->firstOrFail();

            $patients = Patient::where('doctor_id', auth()->id())
                ->select(['id', 'patient_name', 'nome', 'patient_phone'])
                ->orderBy('patient_name')
                ->get();

            return Inertia::render('Consultations/Edit', [
                'consultation' => $consultation,
                'patients' => $patients
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao editar consulta {$id}: " . $e->getMessage());
            abort(404, 'Consulta não encontrada');
        }
    }

    /**
     * Atualiza consulta
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $consultation = Consultation::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            $validated = $request->validate([
                'patient_id' => 'sometimes|required|exists:patients,id',
                'consultation_date' => 'sometimes|required|date',
                'consultation_time' => 'sometimes|required|date_format:H:i',
                'consultation_duration' => 'nullable|integer|min:15|max:480',
                'consultation_type' => 'sometimes|required|in:presencial,online,domicilio,emergencia',
                'room_link' => 'nullable|url|required_if:consultation_type,online',
                'status' => 'sometimes|required|in:scheduled,in_progress,completed,cancelled,no_show',
                'reason_for_visit' => 'sometimes|required|string|max:500',
                'clinical_notes' => 'nullable|string|max:2000',
                'diagnosis' => 'nullable|string|max:1000',
                'procedures_performed' => 'nullable|array',
                'referrals' => 'nullable|array',
                'exams_requested' => 'nullable|array',
                'follow_up' => 'nullable|array',
                'additional_notes' => 'nullable|string|max:1000'
            ]);

            // Verificar se o paciente pertence ao médico (se foi alterado)
            if (isset($validated['patient_id'])) {
                Patient::where('doctor_id', auth()->id())
                    ->where('id', $validated['patient_id'])
                    ->firstOrFail();
            }

            DB::beginTransaction();

            // Combinar data e hora se ambos foram fornecidos
            if (isset($validated['consultation_date']) && isset($validated['consultation_time'])) {
                $consultationDateTime = Carbon::parse($validated['consultation_date'] . ' ' . $validated['consultation_time']);
                $validated['consultation_date'] = $consultationDateTime;
                unset($validated['consultation_time']);
            }

            $consultation->update($validated);

            DB::commit();

            Log::info("Consulta atualizada: {$consultation->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Consulta atualizada com sucesso!',
                'consultation' => $consultation->fresh()->load(['patient', 'prescription'])
            ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erro ao atualizar consulta {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Remove consulta (soft delete)
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $consultation = Consultation::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            DB::beginTransaction();

            $consultation->delete();

            DB::commit();

            Log::info("Consulta removida: {$consultation->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Consulta removida com sucesso!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erro ao remover consulta {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao remover consulta. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Atualiza status da consulta
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        try {
            $consultation = Consultation::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            $validated = $request->validate([
                'status' => 'required|in:scheduled,in_progress,completed,cancelled,no_show',
                'reason' => 'nullable|string|max:500'
            ]);

            DB::beginTransaction();

            $consultation->update([
                'status' => $validated['status'],
                'additional_notes' => $validated['reason'] ?? $consultation->additional_notes
            ]);

            DB::commit();

            Log::info("Status da consulta {$consultation->id} alterado para {$validated['status']} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Status da consulta atualizado com sucesso!',
                'consultation' => $consultation->fresh()
            ]);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erro ao atualizar status da consulta {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar status. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Lista consultas de hoje
     */
    public function today(): JsonResponse
    {
        try {
            $consultations = Consultation::where('doctor_id', auth()->id())
                ->today()
                ->with('patient:id,patient_name,nome,patient_phone')
                ->orderBy('consultation_time')
                ->get();

            return response()->json([
                'success' => true,
                'consultations' => $consultations
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao carregar consultas de hoje: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar consultas. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Lista próximas consultas
     */
    public function upcoming(Request $request): JsonResponse
    {
        try {
            $limit = $request->get('limit', 10);
            
            $consultations = Consultation::where('doctor_id', auth()->id())
                ->upcoming()
                ->with('patient:id,patient_name,nome,patient_phone')
                ->orderBy('consultation_date')
                ->orderBy('consultation_time')
                ->limit($limit)
                ->get();

            return response()->json([
                'success' => true,
                'consultations' => $consultations
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao carregar próximas consultas: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar consultas. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Estatísticas de consultas
     */
    public function stats(Request $request): JsonResponse
    {
        try {
            $period = $request->get('period', '30'); // dias
            $startDate = now()->subDays($period);
            $doctorId = auth()->id();

            $stats = [
                'period_stats' => [
                    'total' => Consultation::where('doctor_id', $doctorId)
                        ->where('consultation_date', '>=', $startDate)
                        ->count(),
                    'completed' => Consultation::where('doctor_id', $doctorId)
                        ->where('consultation_date', '>=', $startDate)
                        ->byStatus('completed')
                        ->count(),
                    'cancelled' => Consultation::where('doctor_id', $doctorId)
                        ->where('consultation_date', '>=', $startDate)
                        ->byStatus('cancelled')
                        ->count(),
                    'no_show' => Consultation::where('doctor_id', $doctorId)
                        ->where('consultation_date', '>=', $startDate)
                        ->byStatus('no_show')
                        ->count()
                ],
                'by_type' => Consultation::where('doctor_id', $doctorId)
                    ->where('consultation_date', '>=', $startDate)
                    ->selectRaw('consultation_type, COUNT(*) as count')
                    ->groupBy('consultation_type')
                    ->pluck('count', 'consultation_type')
                    ->toArray(),
                'by_day' => Consultation::where('doctor_id', $doctorId)
                    ->where('consultation_date', '>=', $startDate)
                    ->selectRaw('DATE(consultation_date) as date, COUNT(*) as count')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get()
                    ->toArray()
            ];

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao carregar estatísticas de consultas: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar estatísticas. Tente novamente.'
            ], 500);
        }
    }
}