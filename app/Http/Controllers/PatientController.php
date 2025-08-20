<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use App\Models\Patient;
use App\Models\Consultation;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PatientController extends Controller
{
    /**
     * Lista todos os pacientes do médico logado
     */
    public function index(Request $request): Response
    {
        try {
            $query = Patient::where('doctor_id', auth()->id())
                ->with([
                    'consultations' => fn($q) => $q->latest()->take(1),
                    'exams' => fn($q) => $q->latest()->take(1),
                    'prescriptions' => fn($q) => $q->latest()->take(1)
                ]);

            // Filtros
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('patient_name', 'like', "%{$search}%")
                      ->orWhere('nome', 'like', "%{$search}%")
                      ->orWhere('patient_email', 'like', "%{$search}%")
                      ->orWhere('patient_phone', 'like', "%{$search}%")
                      ->orWhere('celular', 'like', "%{$search}%");
                });
            }

            if ($request->has('favorites') && $request->favorites) {
                $query->where('favorite', true);
            }

            if ($request->has('blood_type') && $request->blood_type) {
                $query->where('blood_type', $request->blood_type);
            }

            // Ordenação
            $sortBy = $request->get('sort_by', 'created_at');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortBy, $sortDirection);

            $patients = $query->paginate($request->get('per_page', 15));

            // Estatísticas
            $doctorId = auth()->id();
            $stats = [
                'total' => Patient::where('doctor_id', $doctorId)->count(),
                'favorites' => Patient::where('doctor_id', $doctorId)->where('favorite', true)->count(),
                'recent_consultations' => Consultation::where('doctor_id', $doctorId)
                    ->where('consultation_date', '>=', now()->subDays(30))
                    ->count(),
                'blood_types' => Patient::where('doctor_id', $doctorId)
                    ->selectRaw('blood_type, COUNT(*) as count')
                    ->whereNotNull('blood_type')
                    ->groupBy('blood_type')
                    ->pluck('count', 'blood_type')
                    ->toArray()
            ];

            return Inertia::render('Patients/Index', [
                'patients' => $patients,
                'stats' => $stats,
                'filters' => $request->only(['search', 'favorites', 'blood_type', 'sort_by', 'sort_direction'])
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao listar pacientes: ' . $e->getMessage());
            
            return Inertia::render('Patients/Index', [
                'patients' => collect([]),
                'stats' => ['total' => 0, 'favorites' => 0, 'recent_consultations' => 0, 'blood_types' => []],
                'error' => 'Erro ao carregar pacientes. Tente novamente.'
            ]);
        }
    }

    /**
     * Exibe formulário de criação de paciente
     */
    public function create(): Response
    {
        return Inertia::render('Patients/Create');
    }

    /**
     * Armazena novo paciente
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'patient_name' => 'required|string|max:255',
                'data_nascimento' => 'nullable|date|before:today',
                'patient_age' => 'nullable|integer|min:0|max:150',
                'patient_gender' => 'nullable|in:M,F,O',
                'patient_phone' => 'nullable|string|max:20',
                'celular' => 'nullable|string|max:20',
                'fixo' => 'nullable|string|max:20',
                'patient_email' => 'nullable|email|max:255',
                'email' => 'nullable|email|max:255',
                'patient_address' => 'nullable|string|max:500',
                'endereco' => 'nullable|string|max:500',
                'cidade' => 'nullable|string|max:100',
                'estado' => 'nullable|string|max:2',
                'cep' => 'nullable|string|max:10',
                'patient_cpf' => 'nullable|string|max:14|unique:patients,patient_cpf',
                'patient_rg' => 'nullable|string|max:20',
                'blood_type' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
                'tipo_sanguineo' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
                'height_cm' => 'nullable|integer|min:50|max:250',
                'weight_kg' => 'nullable|numeric|min:1|max:500',
                'is_smoker' => 'nullable|boolean',
                'is_alcohol_consumer' => 'nullable|boolean',
                'allergies' => 'nullable|array',
                'congenital_diseases' => 'nullable|array',
                'chronic_diseases' => 'nullable|array',
                'medications' => 'nullable|array',
                'surgical_history' => 'nullable|array',
                'family_history' => 'nullable|array',
                'emergency_contact' => 'nullable|array',
                'health_insurance' => 'nullable|array',
                'notes' => 'nullable|string|max:1000',
                'favorite' => 'nullable|boolean'
            ]);

            DB::beginTransaction();

            $validated['doctor_id'] = auth()->id();
            
            // Padronizar campos de contato
            if (!$validated['patient_phone'] && isset($validated['celular'])) {
                $validated['patient_phone'] = $validated['celular'];
            }
            if (!$validated['patient_email'] && isset($validated['email'])) {
                $validated['patient_email'] = $validated['email'];
            }
            if (!$validated['blood_type'] && isset($validated['tipo_sanguineo'])) {
                $validated['blood_type'] = $validated['tipo_sanguineo'];
            }

            $patient = Patient::create($validated);

            DB::commit();

            Log::info("Paciente criado: {$patient->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Paciente criado com sucesso!',
                'patient' => $patient->load(['consultations', 'exams', 'prescriptions'])
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
            Log::error('Erro ao criar paciente: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Exibe detalhes do paciente
     */
    public function show(string $id): Response
    {
        try {
            $patient = Patient::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->with([
                    'consultations' => fn($q) => $q->orderBy('consultation_date', 'desc'),
                    'anamneses' => fn($q) => $q->latest(),
                    'notes' => fn($q) => $q->latest(),
                    'exams' => fn($q) => $q->orderBy('exam_date', 'desc'),
                    'prescriptions' => fn($q) => $q->latest(),
                    'medicalRecord' => fn($q) => $q->latest()
                ])
                ->firstOrFail();

            // Estatísticas do paciente
            $patientStats = [
                'total_consultations' => $patient->consultations->count(),
                'last_consultation' => $patient->consultations->first()?->consultation_date,
                'total_exams' => $patient->exams->count(),
                'total_prescriptions' => $patient->prescriptions->count(),
                'bmi' => $this->calculateBMI($patient->height_cm, $patient->weight_kg)
            ];

            return Inertia::render('Patients/Show', [
                'patient' => $patient,
                'patientStats' => $patientStats
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao exibir paciente {$id}: " . $e->getMessage());
            abort(404, 'Paciente não encontrado');
        }
    }

    /**
     * Exibe formulário de edição
     */
    public function edit(string $id): Response
    {
        try {
            $patient = Patient::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            return Inertia::render('Patients/Edit', [
                'patient' => $patient
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao editar paciente {$id}: " . $e->getMessage());
            abort(404, 'Paciente não encontrado');
        }
    }

    /**
     * Atualiza paciente
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $patient = Patient::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            $validated = $request->validate([
                'patient_name' => 'sometimes|required|string|max:255',
                'data_nascimento' => 'nullable|date|before:today',
                'patient_age' => 'nullable|integer|min:0|max:150',
                'patient_gender' => 'nullable|in:M,F,O',
                'patient_phone' => 'nullable|string|max:20',
                'celular' => 'nullable|string|max:20',
                'fixo' => 'nullable|string|max:20',
                'patient_email' => 'nullable|email|max:255',
                'email' => 'nullable|email|max:255',
                'patient_address' => 'nullable|string|max:500',
                'endereco' => 'nullable|string|max:500',
                'cidade' => 'nullable|string|max:100',
                'estado' => 'nullable|string|max:2',
                'cep' => 'nullable|string|max:10',
                'patient_cpf' => 'nullable|string|max:14|unique:patients,patient_cpf,' . $id,
                'patient_rg' => 'nullable|string|max:20',
                'blood_type' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
                'tipo_sanguineo' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
                'height_cm' => 'nullable|integer|min:50|max:250',
                'weight_kg' => 'nullable|numeric|min:1|max:500',
                'is_smoker' => 'nullable|boolean',
                'is_alcohol_consumer' => 'nullable|boolean',
                'allergies' => 'nullable|array',
                'congenital_diseases' => 'nullable|array',
                'chronic_diseases' => 'nullable|array',
                'medications' => 'nullable|array',
                'surgical_history' => 'nullable|array',
                'family_history' => 'nullable|array',
                'emergency_contact' => 'nullable|array',
                'health_insurance' => 'nullable|array',
                'notes' => 'nullable|string|max:1000',
                'favorite' => 'nullable|boolean'
            ]);

            DB::beginTransaction();

            $patient->update($validated);

            DB::commit();

            Log::info("Paciente atualizado: {$patient->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Paciente atualizado com sucesso!',
                'patient' => $patient->fresh()->load(['consultations', 'exams', 'prescriptions'])
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
            Log::error("Erro ao atualizar paciente {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Remove paciente (soft delete)
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $patient = Patient::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            DB::beginTransaction();

            $patient->delete();

            DB::commit();

            Log::info("Paciente removido: {$patient->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Paciente removido com sucesso!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erro ao remover paciente {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao remover paciente. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Alterna status de favorito
     */
    public function toggleFavorite(string $id): JsonResponse
    {
        try {
            $patient = Patient::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            $patient->update(['favorite' => !$patient->favorite]);

            return response()->json([
                'success' => true,
                'message' => $patient->favorite ? 'Adicionado aos favoritos!' : 'Removido dos favoritos!',
                'favorite' => $patient->favorite
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao alternar favorito do paciente {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao alterar favorito. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Busca rápida de pacientes
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');
            
            if (strlen($query) < 2) {
                return response()->json([]);
            }

            $patients = Patient::where('doctor_id', auth()->id())
                ->where(function ($q) use ($query) {
                    $q->where('patient_name', 'like', "%{$query}%")
                      ->orWhere('nome', 'like', "%{$query}%")
                      ->orWhere('patient_email', 'like', "%{$query}%")
                      ->orWhere('patient_phone', 'like', "%{$query}%");
                })
                ->select(['id', 'patient_name', 'nome', 'patient_email', 'patient_phone', 'favorite'])
                ->limit(10)
                ->get()
                ->map(function ($patient) {
                    return [
                        'id' => $patient->id,
                        'name' => $patient->full_name,
                        'email' => $patient->patient_email,
                        'phone' => $patient->phone,
                        'favorite' => $patient->favorite
                    ];
                });

            return response()->json($patients);

        } catch (\Exception $e) {
            Log::error('Erro na busca de pacientes: ' . $e->getMessage());
            return response()->json([]);
        }
    }

    /**
     * Calcula IMC
     */
    private function calculateBMI(?int $heightCm, ?float $weightKg): ?float
    {
        if (!$heightCm || !$weightKg) {
            return null;
        }

        $heightM = $heightCm / 100;
        return round($weightKg / ($heightM * $heightM), 2);
    }
}
