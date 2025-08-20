<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use App\Models\Note;
use App\Models\Patient;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class NoteController extends Controller
{
    /**
     * Lista todas as anotações do médico logado
     */
    public function index(Request $request): Response
    {
        try {
            $query = Note::where('doctor_id', auth()->id())
                ->with('patient:id,patient_name,nome,patient_phone');

            // Filtros
            if ($request->has('note_type') && $request->note_type) {
                $query->where('note_type', $request->note_type);
            }

            if ($request->has('is_important') && $request->is_important === 'true') {
                $query->where('is_important', true);
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
                $query->where(function ($q) use ($search) {
                    $q->where('note_title', 'like', "%{$search}%")
                      ->orWhere('note_text', 'like', "%{$search}%")
                      ->orWhereHas('patient', function ($patientQuery) use ($search) {
                          $patientQuery->where('patient_name', 'like', "%{$search}%")
                                      ->orWhere('nome', 'like', "%{$search}%");
                      });
                });
            }

            // Ordenação
            $sortBy = $request->get('sort_by', 'last_modified');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortBy, $sortDirection);

            $notes = $query->paginate($request->get('per_page', 15));

            // Estatísticas
            $doctorId = auth()->id();
            $stats = [
                'total' => Note::where('doctor_id', $doctorId)->count(),
                'important' => Note::where('doctor_id', $doctorId)->important()->count(),
                'this_month' => Note::where('doctor_id', $doctorId)
                    ->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
                'by_type' => Note::where('doctor_id', $doctorId)
                    ->selectRaw('note_type, COUNT(*) as count')
                    ->whereNotNull('note_type')
                    ->groupBy('note_type')
                    ->pluck('count', 'note_type')
                    ->toArray(),
                'total_views' => Note::where('doctor_id', $doctorId)->sum('view_count')
            ];

            return Inertia::render('Notes/Index', [
                'notes' => $notes,
                'stats' => $stats,
                'filters' => $request->only(['note_type', 'is_important', 'patient_id', 'date_from', 'date_to', 'search', 'sort_by', 'sort_direction'])
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao listar anotações: ' . $e->getMessage());
            
            return Inertia::render('Notes/Index', [
                'notes' => collect([]),
                'stats' => ['total' => 0, 'important' => 0, 'this_month' => 0, 'by_type' => [], 'total_views' => 0],
                'error' => 'Erro ao carregar anotações. Tente novamente.'
            ]);
        }
    }

    /**
     * Exibe formulário de criação de anotação
     */
    public function create(Request $request): Response
    {
        $patients = Patient::where('doctor_id', auth()->id())
            ->select(['id', 'patient_name', 'nome', 'patient_phone'])
            ->orderBy('patient_name')
            ->get();

        return Inertia::render('Notes/Create', [
            'patients' => $patients,
            'preselected_patient' => $request->get('patient_id')
        ]);
    }

    /**
     * Armazena nova anotação
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'patient_id' => 'required|exists:patients,id',
                'note_title' => 'required|string|max:255',
                'note_text' => 'required|string|max:5000',
                'consultation_date' => 'nullable|date',
                'note_type' => 'required|in:consultation,observation,reminder,treatment,follow_up,general',
                'is_important' => 'nullable|boolean',
                'attachments' => 'nullable|array'
            ]);

            // Verificar se o paciente pertence ao médico
            $patient = Patient::where('doctor_id', auth()->id())
                ->where('id', $validated['patient_id'])
                ->firstOrFail();

            DB::beginTransaction();

            $validated['doctor_id'] = auth()->id();
            $validated['modified_by'] = auth()->id();
            $validated['last_modified'] = now();
            $validated['view_count'] = 0;
            $validated['is_important'] = $validated['is_important'] ?? false;
            
            if ($validated['consultation_date']) {
                $validated['consultation_date'] = Carbon::parse($validated['consultation_date']);
            }

            $note = Note::create($validated);

            DB::commit();

            Log::info("Anotação criada: {$note->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Anotação criada com sucesso!',
                'note' => $note->load('patient')
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
            Log::error('Erro ao criar anotação: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Exibe detalhes da anotação
     */
    public function show(string $id): Response
    {
        try {
            $note = Note::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->with('patient')
                ->firstOrFail();

            // Incrementar contador de visualizações
            $note->incrementViewCount();

            return Inertia::render('Notes/Show', [
                'note' => $note
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao exibir anotação {$id}: " . $e->getMessage());
            abort(404, 'Anotação não encontrada');
        }
    }

    /**
     * Exibe formulário de edição
     */
    public function edit(string $id): Response
    {
        try {
            $note = Note::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->with('patient')
                ->firstOrFail();

            $patients = Patient::where('doctor_id', auth()->id())
                ->select(['id', 'patient_name', 'nome', 'patient_phone'])
                ->orderBy('patient_name')
                ->get();

            return Inertia::render('Notes/Edit', [
                'note' => $note,
                'patients' => $patients
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao editar anotação {$id}: " . $e->getMessage());
            abort(404, 'Anotação não encontrada');
        }
    }

    /**
     * Atualiza anotação
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $note = Note::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            $validated = $request->validate([
                'patient_id' => 'sometimes|required|exists:patients,id',
                'note_title' => 'sometimes|required|string|max:255',
                'note_text' => 'sometimes|required|string|max:5000',
                'consultation_date' => 'nullable|date',
                'note_type' => 'sometimes|required|in:consultation,observation,reminder,treatment,follow_up,general',
                'is_important' => 'nullable|boolean',
                'attachments' => 'nullable|array'
            ]);

            // Verificar se o paciente pertence ao médico (se foi alterado)
            if (isset($validated['patient_id'])) {
                Patient::where('doctor_id', auth()->id())
                    ->where('id', $validated['patient_id'])
                    ->firstOrFail();
            }

            DB::beginTransaction();

            $validated['modified_by'] = auth()->id();
            
            if (isset($validated['consultation_date']) && $validated['consultation_date']) {
                $validated['consultation_date'] = Carbon::parse($validated['consultation_date']);
            }

            $note->update($validated);

            DB::commit();

            Log::info("Anotação atualizada: {$note->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Anotação atualizada com sucesso!',
                'note' => $note->fresh()->load('patient')
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
            Log::error("Erro ao atualizar anotação {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro interno do servidor. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Remove anotação (soft delete)
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $note = Note::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            DB::beginTransaction();

            $note->delete();

            DB::commit();

            Log::info("Anotação removida: {$note->id} pelo médico: " . auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Anotação removida com sucesso!'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erro ao remover anotação {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao remover anotação. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Alterna importância da anotação
     */
    public function toggleImportant(string $id): JsonResponse
    {
        try {
            $note = Note::where('doctor_id', auth()->id())
                ->where('id', $id)
                ->firstOrFail();

            $note->update([
                'is_important' => !$note->is_important,
                'modified_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => $note->is_important ? 'Marcada como importante!' : 'Desmarcada como importante!',
                'is_important' => $note->is_important
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao alternar importância da anotação {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao alterar importância. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Lista anotações por paciente
     */
    public function byPatient(string $patientId): JsonResponse
    {
        try {
            // Verificar se o paciente pertence ao médico
            $patient = Patient::where('doctor_id', auth()->id())
                ->where('id', $patientId)
                ->firstOrFail();

            $notes = Note::where('doctor_id', auth()->id())
                ->where('patient_id', $patientId)
                ->orderBy('last_modified', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'notes' => $notes,
                'patient' => $patient
            ]);

        } catch (\Exception $e) {
            Log::error("Erro ao carregar anotações do paciente {$patientId}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar anotações. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Lista anotações importantes
     */
    public function important(): JsonResponse
    {
        try {
            $notes = Note::where('doctor_id', auth()->id())
                ->important()
                ->with('patient:id,patient_name,nome,patient_phone')
                ->orderBy('last_modified', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'notes' => $notes
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao carregar anotações importantes: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar anotações. Tente novamente.'
            ], 500);
        }
    }

    /**
     * Busca rápida de anotações
     */
    public function search(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');
            
            if (strlen($query) < 2) {
                return response()->json([]);
            }

            $notes = Note::where('doctor_id', auth()->id())
                ->where(function ($q) use ($query) {
                    $q->where('note_title', 'like', "%{$query}%")
                      ->orWhere('note_text', 'like', "%{$query}%");
                })
                ->with('patient:id,patient_name,nome')
                ->orderBy('last_modified', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($note) {
                    return [
                        'id' => $note->id,
                        'title' => $note->note_title,
                        'excerpt' => substr($note->note_text, 0, 100) . '...',
                        'patient' => $note->patient?->patient_name ?? $note->patient?->nome,
                        'is_important' => $note->is_important,
                        'last_modified' => $note->last_modified
                    ];
                });

            return response()->json($notes);

        } catch (\Exception $e) {
            Log::error('Erro na busca de anotações: ' . $e->getMessage());
            return response()->json([]);
        }
    }
}