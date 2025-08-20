<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use App\Models\Anamnesis;
use App\Models\Patient;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AnamnesisController extends Controller
{
    /**
     * Lista todas as anamneses do médico logado
     */
    public function index(Request $request): Response
    {
        try {
            $query = Anamnesis::where('doctor_id', auth()->id())
                ->with(['patient:id,patient_name,nome,patient_phone']);

            // Filtros
            if ($request->has('patient_id') && $request->patient_id) {
                $query->where('patient_id', $request->patient_id);
            }

            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('anamnese_date', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('anamnese_date', '<=', $request->date_to);
            }

            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('chief_complaint', 'like', "%{$search}%")
                      ->orWhere('diagnosis', 'like', "%{$search}%")
                      ->orWhere('illness_history', 'like', "%{$search}%")
                      ->orWhereHas('patient', function ($patientQuery) use ($search) {
                          $patientQuery->where('patient_name', 'like', "%{$search}%")
                                      ->orWhere('nome', 'like', "%{$search}%");
                      });
                });
            }

            // Ordenação
            $sortBy = $request->get('sort_by', 'anamnese_date');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortBy, $sortDirection);

            $anamneses = $query->paginate($request->get('per_page', 15));

            // Estatísticas
            $doctorId = auth()->id();
            $stats = [
                'total' => Anamnesis::where('doctor_id', $doctorId)->count(),
                'this_month' => Anamnesis::where('doctor_id', $doctorId)
                    ->whereMonth('anamnese_date', now()->month)
                    ->whereYear('anamnese_date', now()->year)
                    ->count(),
                'this_week' => Anamnesis::where('doctor_id', $doctorId)
                    ->whereBetween('anamnese_date', [now()->startOfWeek(), now()->endOfWeek()])
                    ->count(),
                'with_allergies' => Anamnesis::where('doctor_id', $doctorId)
                    ->whereNotNull('allergies')
                    ->whereJsonLength('allergies', '>', 0)
                    ->count()
            ];

            return Inertia::render('Anamnesis/Index', [
                'anamneses' => $anamneses,
                'stats' => $stats,
                'filters' => $request->only(['patient_id', 'date_from', 'date_to', 'search', 'sort_by', 'sort_direction'])
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao listar anamneses: ' . $e->getMessage());
            
            return Inertia::render('Anamnesis/Index', [
                'anamneses' => collect([]),
                'stats' => ['total' => 0, 'this_month' => 0, 'this_week' => 0, 'with_allergies' => 0],
                'error' => 'Erro ao carregar anamneses. Tente novamente.'
            ]);
        }
    }

    /**
     * Exibe formulário de criação de anamnese
     */
    public function create(Request $request): Response
    {
        $patients = Patient::where('doctor_id', auth()->id())
            ->select(['id', 'patient_name', 'nome', 'patient_phone'])
            ->orderBy('patient_name')
            ->get();

        return Inertia::render('Anamnesis/Create', [
            'patients' => $patients,
            'preselected_patient' => $request->get('patient_id')
        ]);
    }

    /**
     * Armazena nova anamnese
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'patient_id' => 'required|exists:patients,id',
                'anamnese_date' => 'required|date|before_or_equal:today',
                'chief_complaint' => 'required|string|max:1000',
                'illness_history' => 'required|string|max:3000',
                'medical_history' => 'nullable|array',
                'surgical_history' => 'nullable|array',
                'family_history' => 'nullable|string|max:2000',
                'social_history' => 'nullable|array',
                'current_medications' => 'nullable|array',
                'allergies' => 'nullable|array',
                'systems_review' => 'nullable|array',
                'physical_exam' => 'nullable|array',
                'diagnosis' => 'nullable|string|max:1000',
                'treatment_plan' => 'nullable|string|max:2000',
                'additional_notes' => 'nullable|string|max:1000'
            ]);

            // Verificar se o paciente pertence ao médico
            $patient = Patient::where('doctor_id', auth()->id())
                ->where('id', $validated['patient_id'])
                ->firstOrFail();

            DB::beginTransaction();

            $validated['doctor_id'] = auth()->id();
            $validated['anamnese_date'] = Carbon::parse($validated['anamnese_date']);

            $anamnesis = Anamnesis::create($validated);

            DB::commit();

            Log::info("Anamnese criada: {$anamnesis->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Anamnese criada com sucesso!',
                'anamnesis' => $anamnesis->load('patient')
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
            Log::error('Erro ao criar anamnese: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Exibe detalhes da anamnese
     */
    public function show(string $id): Response
    {
        try {
            $anamnesis = Anamnesis::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->with('patient')
                ->firstOrFail();

            return Inertia::render('Anamnesis/Show', [
                'anamnesis' => $anamnesis
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao exibir anamnese {$id}: " . $e->getMessage());
            abort(404, 'Anamnese não encontrada');
        }
    }

    /**
     * Exibe formulário de edição
     */
    public function edit(string $id): Response
    {
        try {
            $anamnesis = Anamnesis::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->with('patient')
                ->firstOrFail();

            $patients = Patient::where('doctor_id', auth()->id())
                ->select(['id', 'patient_name', 'nome', 'patient_phone'])
                ->orderBy('patient_name')
                ->get();

            return Inertia::render('Anamnesis/Edit', [
                'anamnesis' => $anamnesis,
                'patients' => $patients
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao editar anamnese {$id}: " . $e->getMessage());
            abort(404, 'Anamnese não encontrada');
        }
    }

    /**
     * Atualiza anamnese
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $anamnesis = Anamnesis::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            $validated = $request->validate([
                'patient_id' => 'sometimes|required|exists:patients,id',
                'anamnese_date' => 'sometimes|required|date|before_or_equal:today',
                'chief_complaint' => 'sometimes|required|string|max:1000',
                'illness_history' => 'sometimes|required|string|max:3000',
                'medical_history' => 'nullable|array',
                'surgical_history' => 'nullable|array',
                'family_history' => 'nullable|string|max:2000',
                'social_history' => 'nullable|array',
                'current_medications' => 'nullable|array',
                'allergies' => 'nullable|array',
                'systems_review' => 'nullable|array',
                'physical_exam' => 'nullable|array',
                'diagnosis' => 'nullable|string|max:1000',
                'treatment_plan' => 'nullable|string|max:2000',
                'additional_notes' => 'nullable|string|max:1000'
            ]);

            // Verificar se o paciente pertence ao médico (se foi alterado)
            if (isset($validated['patient_id'])) {
                Patient::where('doctor_id', auth()->id())
                    ->where('id', $validated['patient_id'])
                    ->firstOrFail();
            }

            DB::beginTransaction();

            if (isset($validated['anamnese_date'])) {
                $validated['anamnese_date'] = Carbon::parse($validated['anamnese_date']);
            }

            $anamnesis->update($validated);

            DB::commit();

            Log::info("Anamnese atualizada: {$anamnesis->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Anamnese atualizada com sucesso!',
                'anamnesis' => $anamnesis->fresh()->load('patient')
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
            Log::error("Erro ao atualizar anamnese {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Remove anamnese (soft delete)
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $anamnesis = Anamnesis::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            DB::beginTransaction();

            $anamnesis->delete();

            DB::commit();

            Log::info("Anamnese removida: {$anamnesis->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Anamnese removida com sucesso!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erro ao remover anamnese {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao remover anamnese. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Lista anamneses por paciente
     */
    public function byPatient(string $patientId): JsonResponse
    {
        try {
            // Verificar se o paciente pertence ao médico
            $patient = Patient::where('doctor_id', auth()->id())
                ->where('id', $patientId)
                ->firstOrFail();

            $anamneses = Anamnesis::where('doctor_id', auth()->id())
                ->where('patient_id', $patientId)
                ->orderBy('anamnese_date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'anamneses' => $anamneses,
                'patient' => $patient
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao carregar anamneses do paciente {$patientId}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar anamneses. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Template para nova anamnese baseada na última
     */
    public function template(string $patientId): JsonResponse
    {
        try {
            // Verificar se o paciente pertence ao médico
            $patient = Patient::where('doctor_id', auth()->id())
                ->where('id', $patientId)
                ->firstOrFail();

            $lastAnamnesis = Anamnesis::where('doctor_id', auth()->id())
                ->where('patient_id', $patientId)
                ->orderBy('anamnese_date', 'desc')
                ->first();

            $template = [
                'patient_id' => $patientId,
                'anamnese_date' => now()->format('Y-m-d'),
                'chief_complaint' => '',
                'illness_history' => '',
                'medical_history' => $lastAnamnesis?->medical_history ?? [],
                'surgical_history' => $lastAnamnesis?->surgical_history ?? [],
                'family_history' => $lastAnamnesis?->family_history ?? '',
                'social_history' => $lastAnamnesis?->social_history ?? [],
                'current_medications' => $lastAnamnesis?->current_medications ?? [],
                'allergies' => $lastAnamnesis?->allergies ?? [],
                'systems_review' => [],
                'physical_exam' => [],
                'diagnosis' => '',
                'treatment_plan' => '',
                'additional_notes' => ''
            ];

            return response()->json([
                'success' => true,
                'template' => $template,
                'patient' => $patient,
                'has_previous' => !is_null($lastAnamnesis)
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao carregar template de anamnese para paciente {$patientId}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar template. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Relatório de anamneses por período
     */
    public function report(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'date_from' => 'required|date',
                'date_to' => 'required|date|after_or_equal:date_from',
                'patient_id' => 'nullable|exists:patients,id'
            ]);

            $query = Anamnesis::where('doctor_id', auth()->id())
                ->whereBetween('anamnese_date', [$validated['date_from'], $validated['date_to']])
                ->with('patient:id,patient_name,nome');

            if (isset($validated['patient_id'])) {
                // Verificar se o paciente pertence ao médico
                Patient::where('doctor_id', auth()->id())
                    ->where('id', $validated['patient_id'])
                    ->firstOrFail();
                
                $query->where('patient_id', $validated['patient_id']);
            }

            $anamneses = $query->orderBy('anamnese_date', 'desc')->get();

            $stats = [
                'total_anamneses' => $anamneses->count(),
                'unique_patients' => $anamneses->pluck('patient_id')->unique()->count(),
                'avg_per_day' => $anamneses->count() / (now()->parse($validated['date_to'])->diffInDays(now()->parse($validated['date_from'])) + 1),
                'most_common_diagnoses' => $anamneses->whereNotNull('diagnosis')
                    ->pluck('diagnosis')
                    ->filter()
                    ->countBy()
                    ->sort()
                    ->reverse()
                    ->take(5)
                    ->toArray()
            ];

            return response()->json([
                'success' => true,
                'anamneses' => $anamneses,
                'stats' => $stats,
                'period' => [
                    'from' => $validated['date_from'],
                    'to' => $validated['date_to']
                ]
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Erro ao gerar relatório de anamneses: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar relatório. Tente novamente.'
            ], 500);
        }
    }
}