<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use App\Models\Exam;
use App\Models\Patient;
use App\Models\Consultation;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ExamController extends Controller
{
    /**
     * Lista todos os exames do médico logado
     */
    public function index(Request $request): Response
    {
        try {
            $query = Exam::where('doctor_id', auth()->id())
                ->with([
                    'patient:id,patient_name,nome,patient_phone',
                    'consultation:id,consultation_date,reason_for_visit'
                ]);

            // Filtros
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            if ($request->has('exam_type') && $request->exam_type) {
                $query->where('exam_type', $request->exam_type);
            }

            if ($request->has('exam_category') && $request->exam_category) {
                $query->where('exam_category', $request->exam_category);
            }

            if ($request->has('patient_id') && $request->patient_id) {
                $query->where('patient_id', $request->patient_id);
            }

            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('exam_date', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('exam_date', '<=', $request->date_to);
            }

            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('exam_name', 'like', "%{$search}%")
                      ->orWhere('exam_type', 'like', "%{$search}%")
                      ->orWhereHas('patient', function ($patientQuery) use ($search) {
                          $patientQuery->where('patient_name', 'like', "%{$search}%")
                                      ->orWhere('nome', 'like', "%{$search}%");
                      });
                });
            }

            // Ordenação
            $sortBy = $request->get('sort_by', 'exam_date');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortBy, $sortDirection);

            $exams = $query->paginate($request->get('per_page', 15));

            // Estatísticas
            $doctorId = auth()->id();
            $stats = [
                'total' => Exam::where('doctor_id', $doctorId)->count(),
                'pending' => Exam::where('doctor_id', $doctorId)->byStatus('pending')->count(),
                'completed' => Exam::where('doctor_id', $doctorId)->byStatus('completed')->count(),
                'in_progress' => Exam::where('doctor_id', $doctorId)->byStatus('in_progress')->count(),
                'this_month' => Exam::where('doctor_id', $doctorId)
                    ->whereMonth('exam_date', now()->month)
                    ->whereYear('exam_date', now()->year)
                    ->count(),
                'by_category' => Exam::where('doctor_id', $doctorId)
                    ->selectRaw('exam_category, COUNT(*) as count')
                    ->whereNotNull('exam_category')
                    ->groupBy('exam_category')
                    ->pluck('count', 'exam_category')
                    ->toArray()
            ];

            return Inertia::render('Exams/Index', [
                'exams' => $exams,
                'stats' => $stats,
                'filters' => $request->only(['status', 'exam_type', 'exam_category', 'patient_id', 'date_from', 'date_to', 'search', 'sort_by', 'sort_direction'])
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao listar exames: ' . $e->getMessage());
            
            return Inertia::render('Exams/Index', [
                'exams' => collect([]),
                'stats' => ['total' => 0, 'pending' => 0, 'completed' => 0, 'in_progress' => 0, 'this_month' => 0, 'by_category' => []],
                'error' => 'Erro ao carregar exames. Tente novamente.'
            ]);
        }
    }

    /**
     * Exibe formulário de criação de exame
     */
    public function create(Request $request): Response
    {
        $patients = Patient::where('doctor_id', auth()->id())
            ->select(['id', 'patient_name', 'nome', 'patient_phone'])
            ->orderBy('patient_name')
            ->get();

        $consultations = Consultation::where('doctor_id', auth()->id())
            ->with('patient:id,patient_name,nome')
            ->orderBy('consultation_date', 'desc')
            ->limit(50)
            ->get();

        return Inertia::render('Exams/Create', [
            'patients' => $patients,
            'consultations' => $consultations,
            'preselected_patient' => $request->get('patient_id'),
            'preselected_consultation' => $request->get('consultation_id')
        ]);
    }

    /**
     * Armazena novo exame
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'patient_id' => 'required|exists:patients,id',
                'consultation_id' => 'nullable|exists:consultations,id',
                'exam_name' => 'required|string|max:255',
                'exam_type' => 'required|in:laboratorial,imagem,funcional,endoscopico,biopsia,outros',
                'exam_category' => 'nullable|string|max:100',
                'exam_date' => 'required|date|after_or_equal:today',
                'status' => 'nullable|in:pending,scheduled,in_progress,completed,cancelled',
                'request_details' => 'nullable|array',
                'results' => 'nullable|array',
                'additional_notes' => 'nullable|string|max:1000'
            ]);

            // Verificar se o paciente pertence ao médico
            $patient = Patient::where('doctor_id', auth()->id())
                ->where('id', $validated['patient_id'])
                ->firstOrFail();

            // Verificar se a consulta pertence ao médico (se fornecida)
            if ($validated['consultation_id']) {
                Consultation::where('doctor_id', auth()->id())
                    ->where('id', $validated['consultation_id'])
                    ->firstOrFail();
            }

            DB::beginTransaction();

            $validated['doctor_id'] = auth()->id();
            $validated['status'] = $validated['status'] ?? 'pending';
            $validated['exam_date'] = Carbon::parse($validated['exam_date']);

            $exam = Exam::create($validated);

            DB::commit();

            Log::info("Exame criado: {$exam->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Exame criado com sucesso!',
                'exam' => $exam->load(['patient', 'consultation'])
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
            Log::error('Erro ao criar exame: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Exibe detalhes do exame
     */
    public function show(string $id): Response
    {
        try {
            $exam = Exam::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->with(['patient', 'consultation'])
                ->firstOrFail();

            return Inertia::render('Exams/Show', [
                'exam' => $exam
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao exibir exame {$id}: " . $e->getMessage());
            abort(404, 'Exame não encontrado');
        }
    }

    /**
     * Exibe formulário de edição
     */
    public function edit(string $id): Response
    {
        try {
            $exam = Exam::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->with(['patient', 'consultation'])
                ->firstOrFail();

            $patients = Patient::where('doctor_id', auth()->id())
                ->select(['id', 'patient_name', 'nome', 'patient_phone'])
                ->orderBy('patient_name')
                ->get();

            $consultations = Consultation::where('doctor_id', auth()->id())
                ->with('patient:id,patient_name,nome')
                ->orderBy('consultation_date', 'desc')
                ->limit(50)
                ->get();

            return Inertia::render('Exams/Edit', [
                'exam' => $exam,
                'patients' => $patients,
                'consultations' => $consultations
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao editar exame {$id}: " . $e->getMessage());
            abort(404, 'Exame não encontrado');
        }
    }

    /**
     * Atualiza exame
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $exam = Exam::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            $validated = $request->validate([
                'patient_id' => 'sometimes|required|exists:patients,id',
                'consultation_id' => 'nullable|exists:consultations,id',
                'exam_name' => 'sometimes|required|string|max:255',
                'exam_type' => 'sometimes|required|in:laboratorial,imagem,funcional,endoscopico,biopsia,outros',
                'exam_category' => 'nullable|string|max:100',
                'exam_date' => 'sometimes|required|date',
                'status' => 'sometimes|required|in:pending,scheduled,in_progress,completed,cancelled',
                'request_details' => 'nullable|array',
                'results' => 'nullable|array',
                'additional_notes' => 'nullable|string|max:1000'
            ]);

            // Verificar se o paciente pertence ao médico (se foi alterado)
            if (isset($validated['patient_id'])) {
                Patient::where('doctor_id', auth()->id())
                    ->where('id', $validated['patient_id'])
                    ->firstOrFail();
            }

            // Verificar se a consulta pertence ao médico (se foi alterada)
            if (isset($validated['consultation_id']) && $validated['consultation_id']) {
                Consultation::where('doctor_id', auth()->id())
                    ->where('id', $validated['consultation_id'])
                    ->firstOrFail();
            }

            DB::beginTransaction();

            if (isset($validated['exam_date'])) {
                $validated['exam_date'] = Carbon::parse($validated['exam_date']);
            }

            $exam->update($validated);

            DB::commit();

            Log::info("Exame atualizado: {$exam->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Exame atualizado com sucesso!',
                'exam' => $exam->fresh()->load(['patient', 'consultation'])
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
            Log::error("Erro ao atualizar exame {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Remove exame (soft delete)
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $exam = Exam::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            DB::beginTransaction();

            $exam->delete();

            DB::commit();

            Log::info("Exame removido: {$exam->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Exame removido com sucesso!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erro ao remover exame {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao remover exame. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Atualiza status do exame
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        try {
            $exam = Exam::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            $validated = $request->validate([
                'status' => 'required|in:pending,scheduled,in_progress,completed,cancelled',
                'results' => 'nullable|array',
                'additional_notes' => 'nullable|string|max:1000'
            ]);

            DB::beginTransaction();

            $exam->update($validated);

            DB::commit();

            Log::info("Status do exame {$exam->id} alterado para {$validated['status']} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Status do exame atualizado com sucesso!',
                'exam' => $exam->fresh()
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
            Log::error("Erro ao atualizar status do exame {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar status. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Lista exames por paciente
     */
    public function byPatient(string $patientId): JsonResponse
    {
        try {
            // Verificar se o paciente pertence ao médico
            $patient = Patient::where('doctor_id', auth()->id())
                ->where('id', $patientId)
                ->firstOrFail();

            $exams = Exam::where('doctor_id', auth()->id())
                ->where('patient_id', $patientId)
                ->with('consultation:id,consultation_date,reason_for_visit')
                ->orderBy('exam_date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'exams' => $exams,
                'patient' => $patient
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao carregar exames do paciente {$patientId}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar exames. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Lista exames pendentes
     */
    public function pending(): JsonResponse
    {
        try {
            $exams = Exam::where('doctor_id', auth()->id())
                ->byStatus('pending')
                ->with('patient:id,patient_name,nome,patient_phone')
                ->orderBy('exam_date')
                ->get();

            return response()->json([
                'success' => true,
                'exams' => $exams
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao carregar exames pendentes: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar exames. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Relatório de exames por período
     */
    public function report(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'date_from' => 'required|date',
                'date_to' => 'required|date|after_or_equal:date_from',
                'exam_type' => 'nullable|in:laboratorial,imagem,funcional,endoscopico,biopsia,outros',
                'status' => 'nullable|in:pending,scheduled,in_progress,completed,cancelled',
                'patient_id' => 'nullable|exists:patients,id'
            ]);

            $query = Exam::where('doctor_id', auth()->id())
                ->whereBetween('exam_date', [$validated['date_from'], $validated['date_to']])
                ->with('patient:id,patient_name,nome');

            if (isset($validated['exam_type'])) {
                $query->where('exam_type', $validated['exam_type']);
            }

            if (isset($validated['status'])) {
                $query->where('status', $validated['status']);
            }

            if (isset($validated['patient_id'])) {
                // Verificar se o paciente pertence ao médico
                Patient::where('doctor_id', auth()->id())
                    ->where('id', $validated['patient_id'])
                    ->firstOrFail();
                
                $query->where('patient_id', $validated['patient_id']);
            }

            $exams = $query->orderBy('exam_date', 'desc')->get();

            $stats = [
                'total_exams' => $exams->count(),
                'unique_patients' => $exams->pluck('patient_id')->unique()->count(),
                'by_status' => $exams->groupBy('status')->map->count()->toArray(),
                'by_type' => $exams->groupBy('exam_type')->map->count()->toArray(),
                'by_category' => $exams->whereNotNull('exam_category')
                    ->groupBy('exam_category')
                    ->map->count()
                    ->toArray(),
                'completion_rate' => $exams->count() > 0 
                    ? round(($exams->where('status', 'completed')->count() / $exams->count()) * 100, 2)
                    : 0
            ];

            return response()->json([
                'success' => true,
                'exams' => $exams,
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
            Log::error('Erro ao gerar relatório de exames: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar relatório. Tente novamente.'
            ], 500);
        }
    }
}