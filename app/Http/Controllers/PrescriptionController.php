<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use App\Models\Prescription;
use App\Models\Patient;
use App\Models\Consultation;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PrescriptionController extends Controller
{
    /**
     * Lista todas as prescrições do médico logado
     */
    public function index(Request $request): Response
    {
        try {
            $query = Prescription::where('doctor_id', auth()->id())
                ->with([
                    'patient:id,patient_name,nome,patient_phone',
                    'consultation:id,consultation_date,reason_for_visit'
                ]);

            // Filtros
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            if ($request->has('tipo') && $request->tipo) {
                $query->where('tipo', $request->tipo);
            }

            if ($request->has('patient_id') && $request->patient_id) {
                $query->where('patient_id', $request->patient_id);
            }

            if ($request->has('date_from') && $request->date_from) {
                $query->whereDate('data_emissao', '>=', $request->date_from);
            }

            if ($request->has('date_to') && $request->date_to) {
                $query->whereDate('data_emissao', '<=', $request->date_to);
            }

            if ($request->has('expired') && $request->expired === 'true') {
                $query->expired();
            }

            if ($request->has('active') && $request->active === 'true') {
                $query->active();
            }

            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('titulo', 'like', "%{$search}%")
                      ->orWhere('general_instructions', 'like', "%{$search}%")
                      ->orWhereHas('patient', function ($patientQuery) use ($search) {
                          $patientQuery->where('patient_name', 'like', "%{$search}%")
                                      ->orWhere('nome', 'like', "%{$search}%");
                      });
                });
            }

            // Ordenação
            $sortBy = $request->get('sort_by', 'data_emissao');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortBy, $sortDirection);

            $prescriptions = $query->paginate($request->get('per_page', 15));

            // Estatísticas
            $doctorId = auth()->id();
            $stats = [
                'total' => Prescription::where('doctor_id', $doctorId)->count(),
                'active' => Prescription::where('doctor_id', $doctorId)->active()->count(),
                'expired' => Prescription::where('doctor_id', $doctorId)->expired()->count(),
                'this_month' => Prescription::where('doctor_id', $doctorId)
                    ->whereMonth('data_emissao', now()->month)
                    ->whereYear('data_emissao', now()->year)
                    ->count(),
                'by_type' => Prescription::where('doctor_id', $doctorId)
                    ->selectRaw('tipo, COUNT(*) as count')
                    ->whereNotNull('tipo')
                    ->groupBy('tipo')
                    ->pluck('count', 'tipo')
                    ->toArray()
            ];

            return Inertia::render('Prescriptions/Index', [
                'prescriptions' => $prescriptions,
                'stats' => $stats,
                'filters' => $request->only(['status', 'tipo', 'patient_id', 'date_from', 'date_to', 'expired', 'active', 'search', 'sort_by', 'sort_direction'])
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao listar prescrições: ' . $e->getMessage());
            
            return Inertia::render('Prescriptions/Index', [
                'prescriptions' => collect([]),
                'stats' => ['total' => 0, 'active' => 0, 'expired' => 0, 'this_month' => 0, 'by_type' => []],
                'error' => 'Erro ao carregar prescrições. Tente novamente.'
            ]);
        }
    }

    /**
     * Exibe formulário de criação de prescrição
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

        return Inertia::render('Prescriptions/Create', [
            'patients' => $patients,
            'consultations' => $consultations,
            'preselected_patient' => $request->get('patient_id'),
            'preselected_consultation' => $request->get('consultation_id')
        ]);
    }

    /**
     * Armazena nova prescrição
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'patient_id' => 'required|exists:patients,id',
                'consultation_id' => 'nullable|exists:consultations,id',
                'titulo' => 'required|string|max:255',
                'tipo' => 'required|in:medicamento,exame,procedimento,repouso,dieta,outros',
                'data_emissao' => 'required|date|before_or_equal:today',
                'expiration_date' => 'nullable|date|after:data_emissao',
                'medicamentos' => 'nullable|array',
                'medications' => 'nullable|array',
                'general_instructions' => 'nullable|string|max:2000',
                'status' => 'nullable|in:active,Ativa,expired,cancelled,completed',
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
            $validated['status'] = $validated['status'] ?? 'active';
            $validated['data_emissao'] = Carbon::parse($validated['data_emissao']);
            
            if ($validated['expiration_date']) {
                $validated['expiration_date'] = Carbon::parse($validated['expiration_date']);
            }

            // Padronizar medicamentos
            if (!$validated['medications'] && $validated['medicamentos']) {
                $validated['medications'] = $validated['medicamentos'];
            }

            $prescription = Prescription::create($validated);

            DB::commit();

            Log::info("Prescrição criada: {$prescription->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Prescrição criada com sucesso!',
                'prescription' => $prescription->load(['patient', 'consultation'])
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
            Log::error('Erro ao criar prescrição: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Exibe detalhes da prescrição
     */
    public function show(string $id): Response
    {
        try {
            $prescription = Prescription::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->with(['patient', 'consultation'])
                ->firstOrFail();

            return Inertia::render('Prescriptions/Show', [
                'prescription' => $prescription
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao exibir prescrição {$id}: " . $e->getMessage());
            abort(404, 'Prescrição não encontrada');
        }
    }

    /**
     * Exibe formulário de edição
     */
    public function edit(string $id): Response
    {
        try {
            $prescription = Prescription::where('doctor_id', auth()->id())
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

            return Inertia::render('Prescriptions/Edit', [
                'prescription' => $prescription,
                'patients' => $patients,
                'consultations' => $consultations
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao editar prescrição {$id}: " . $e->getMessage());
            abort(404, 'Prescrição não encontrada');
        }
    }

    /**
     * Atualiza prescrição
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $prescription = Prescription::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            $validated = $request->validate([
                'patient_id' => 'sometimes|required|exists:patients,id',
                'consultation_id' => 'nullable|exists:consultations,id',
                'titulo' => 'sometimes|required|string|max:255',
                'tipo' => 'sometimes|required|in:medicamento,exame,procedimento,repouso,dieta,outros',
                'data_emissao' => 'sometimes|required|date|before_or_equal:today',
                'expiration_date' => 'nullable|date|after:data_emissao',
                'medicamentos' => 'nullable|array',
                'medications' => 'nullable|array',
                'general_instructions' => 'nullable|string|max:2000',
                'status' => 'sometimes|required|in:active,Ativa,expired,cancelled,completed',
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

            if (isset($validated['data_emissao'])) {
                $validated['data_emissao'] = Carbon::parse($validated['data_emissao']);
            }
            
            if (isset($validated['expiration_date']) && $validated['expiration_date']) {
                $validated['expiration_date'] = Carbon::parse($validated['expiration_date']);
            }

            $prescription->update($validated);

            DB::commit();

            Log::info("Prescrição atualizada: {$prescription->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Prescrição atualizada com sucesso!',
                'prescription' => $prescription->fresh()->load(['patient', 'consultation'])
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
            Log::error("Erro ao atualizar prescrição {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Remove prescrição (soft delete)
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $prescription = Prescription::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            DB::beginTransaction();

            $prescription->delete();

            DB::commit();

            Log::info("Prescrição removida: {$prescription->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Prescrição removida com sucesso!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erro ao remover prescrição {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao remover prescrição. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Lista prescrições por paciente
     */
    public function byPatient(string $patientId): JsonResponse
    {
        try {
            // Verificar se o paciente pertence ao médico
            $patient = Patient::where('doctor_id', auth()->id())
                ->where('id', $patientId)
                ->firstOrFail();

            $prescriptions = Prescription::where('doctor_id', auth()->id())
                ->where('patient_id', $patientId)
                ->with('consultation:id,consultation_date,reason_for_visit')
                ->orderBy('data_emissao', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'prescriptions' => $prescriptions,
                'patient' => $patient
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao carregar prescrições do paciente {$patientId}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar prescrições. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Lista prescrições ativas
     */
    public function active(): JsonResponse
    {
        try {
            $prescriptions = Prescription::where('doctor_id', auth()->id())
                ->active()
                ->with('patient:id,patient_name,nome,patient_phone')
                ->orderBy('data_emissao', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'prescriptions' => $prescriptions
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao carregar prescrições ativas: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar prescrições. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Lista prescrições expiradas
     */
    public function expired(): JsonResponse
    {
        try {
            $prescriptions = Prescription::where('doctor_id', auth()->id())
                ->expired()
                ->with('patient:id,patient_name,nome,patient_phone')
                ->orderBy('expiration_date', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'prescriptions' => $prescriptions
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao carregar prescrições expiradas: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar prescrições. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Gera PDF da prescrição
     */
    public function generatePdf(string $id): JsonResponse
    {
        try {
            $prescription = Prescription::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->with(['patient', 'doctor'])
                ->firstOrFail();

            // Aqui você implementaria a geração do PDF
            // Por exemplo, usando DomPDF, TCPDF ou similar
            
            // Mock implementation
            $pdfUrl = url("/storage/prescriptions/{$prescription->id}.pdf");
            
            $prescription->update(['pdf_url' => $pdfUrl]);

            Log::info("PDF da prescrição gerado: {$prescription->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'PDF gerado com sucesso!',
                'pdf_url' => $pdfUrl
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao gerar PDF da prescrição {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao gerar PDF. Tente novamente.'
            ], 500);
        }
    }
}