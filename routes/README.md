# Documentação das Rotas - Médico no Bolso v2

Este documento descreve todas as rotas do sistema, organizadas por funcionalidade e tipo.

## Estrutura de Arquivos

- `web.php` - Rotas web que renderizam páginas via Inertia.js
- `api.php` - Rotas da API REST para operações CRUD e dados JSON
- `console.php` - Comandos Artisan personalizados

## Middleware Aplicado

Todas as rotas autenticadas usam o middleware:
- `auth:sanctum` - Autenticação via Sanctum
- `config('jetstream.auth_session')` - Sessão do Jetstream
- `verified` - Email verificado

## Rotas da API (/api)

### 🏥 Pacientes
**Prefixo:** `/api/patients`

| Método | Endpoint | Controller | Descrição |
|--------|----------|------------|-----------|
| GET | `/` | PatientController@index | Lista pacientes com filtros |
| POST | `/` | PatientController@store | Cria novo paciente |
| GET | `/{patient}` | PatientController@show | Exibe detalhes do paciente |
| PUT | `/{patient}` | PatientController@update | Atualiza paciente completo |
| PATCH | `/{patient}` | PatientController@update | Atualiza paciente parcial |
| DELETE | `/{patient}` | PatientController@destroy | Remove paciente (soft delete) |
| PATCH | `/{patient}/favorite` | PatientController@toggleFavorite | Alterna favorito |
| GET | `/search/quick` | PatientController@search | Busca rápida |

**Recursos Aninhados por Paciente:**
- GET `/{patient}/consultations` - Consultas do paciente
- GET `/{patient}/anamneses` - Anamneses do paciente
- GET `/{patient}/exams` - Exames do paciente
- GET `/{patient}/prescriptions` - Prescrições do paciente
- GET `/{patient}/notes` - Anotações do paciente

### 📅 Consultas
**Prefixo:** `/api/consultations`

| Método | Endpoint | Controller | Descrição |
|--------|----------|------------|-----------|
| GET | `/` | ConsultationController@index | Lista consultas com filtros |
| POST | `/` | ConsultationController@store | Agenda nova consulta |
| GET | `/{consultation}` | ConsultationController@show | Detalhes da consulta |
| PUT/PATCH | `/{consultation}` | ConsultationController@update | Atualiza consulta |
| DELETE | `/{consultation}` | ConsultationController@destroy | Remove consulta |
| PATCH | `/{consultation}/status` | ConsultationController@updateStatus | Atualiza status |
| GET | `/filter/today` | ConsultationController@today | Consultas de hoje |
| GET | `/filter/upcoming` | ConsultationController@upcoming | Próximas consultas |
| GET | `/reports/stats` | ConsultationController@stats | Estatísticas |

### 📋 Anamneses
**Prefixo:** `/api/anamneses`

| Método | Endpoint | Controller | Descrição |
|--------|----------|------------|-----------|
| GET | `/` | AnamnesisController@index | Lista anamneses |
| POST | `/` | AnamnesisController@store | Cria anamnese |
| GET | `/{anamnesis}` | AnamnesisController@show | Detalhes da anamnese |
| PUT/PATCH | `/{anamnesis}` | AnamnesisController@update | Atualiza anamnese |
| DELETE | `/{anamnesis}` | AnamnesisController@destroy | Remove anamnese |
| GET | `/template/{patient}` | AnamnesisController@template | Template baseado na última |
| GET | `/reports/period` | AnamnesisController@report | Relatório por período |

### 🧪 Exames
**Prefixo:** `/api/exams`

| Método | Endpoint | Controller | Descrição |
|--------|----------|------------|-----------|
| GET | `/` | ExamController@index | Lista exames |
| POST | `/` | ExamController@store | Solicita exame |
| GET | `/{exam}` | ExamController@show | Detalhes do exame |
| PUT/PATCH | `/{exam}` | ExamController@update | Atualiza exame |
| DELETE | `/{exam}` | ExamController@destroy | Remove exame |
| PATCH | `/{exam}/status` | ExamController@updateStatus | Atualiza status |
| GET | `/filter/pending` | ExamController@pending | Exames pendentes |
| GET | `/reports/period` | ExamController@report | Relatório por período |

### 💊 Prescrições
**Prefixo:** `/api/prescriptions`

| Método | Endpoint | Controller | Descrição |
|--------|----------|------------|-----------|
| GET | `/` | PrescriptionController@index | Lista prescrições |
| POST | `/` | PrescriptionController@store | Cria prescrição |
| GET | `/{prescription}` | PrescriptionController@show | Detalhes da prescrição |
| PUT/PATCH | `/{prescription}` | PrescriptionController@update | Atualiza prescrição |
| DELETE | `/{prescription}` | PrescriptionController@destroy | Remove prescrição |
| GET | `/filter/active` | PrescriptionController@active | Prescrições ativas |
| GET | `/filter/expired` | PrescriptionController@expired | Prescrições expiradas |
| POST | `/{prescription}/pdf` | PrescriptionController@generatePdf | Gera PDF |

### 📝 Anotações
**Prefixo:** `/api/notes`

| Método | Endpoint | Controller | Descrição |
|--------|----------|------------|-----------|
| GET | `/` | NoteController@index | Lista anotações |
| POST | `/` | NoteController@store | Cria anotação |
| GET | `/{note}` | NoteController@show | Detalhes da anotação |
| PUT/PATCH | `/{note}` | NoteController@update | Atualiza anotação |
| DELETE | `/{note}` | NoteController@destroy | Remove anotação |
| PATCH | `/{note}/important` | NoteController@toggleImportant | Alterna importância |
| GET | `/filter/important` | NoteController@important | Anotações importantes |
| GET | `/search/quick` | NoteController@search | Busca rápida |

### 📊 Dashboard e Estatísticas
**Prefixo:** `/api/dashboard`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/stats` | Estatísticas gerais do dashboard |
| GET | `/recent-activity` | Atividades recentes do médico |

### 🔍 Busca Global
**Prefixo:** `/api/search`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/global` | Busca unificada em todos os recursos |

## Rotas Web (Interface)

### Páginas Principais

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Welcome | Página inicial pública |
| `/dashboard` | Dashboard | Dashboard principal |

### 🏥 Pacientes - Interface
**Prefixo:** `/patients`

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Patients/Index | Lista de pacientes |
| `/create` | Patients/Create | Formulário de criação |
| `/{patient}` | Patients/Show | Detalhes do paciente |
| `/{patient}/edit` | Patients/Edit | Formulário de edição |
| `/{patient}/consultations` | Consultations/Index | Consultas do paciente |
| `/{patient}/medical-history` | Patients/MedicalHistory | Histórico médico |

### 📅 Consultas - Interface
**Prefixo:** `/consultations`

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Consultations/Index | Lista de consultas |
| `/create` | Consultations/Create | Agendar consulta |
| `/{consultation}` | Consultations/Show | Detalhes da consulta |
| `/{consultation}/edit` | Consultations/Edit | Editar consulta |
| `/calendar/view` | Consultations/Calendar | Visualização em calendário |
| `/today/list` | Consultations/Today | Consultas de hoje |
| `/reports/statistics` | Consultations/Reports | Relatórios |

### 📋 Anamneses - Interface
**Prefixo:** `/anamneses`

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Anamnesis/Index | Lista de anamneses |
| `/create` | Anamnesis/Create | Criar anamnese |
| `/{anamnesis}` | Anamnesis/Show | Detalhes da anamnese |
| `/{anamnesis}/edit` | Anamnesis/Edit | Editar anamnese |
| `/templates/list` | Anamnesis/Templates | Templates disponíveis |
| `/reports/analysis` | Anamnesis/Reports | Análises e relatórios |

### 🧪 Exames - Interface
**Prefixo:** `/exams`

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Exams/Index | Lista de exames |
| `/create` | Exams/Create | Solicitar exame |
| `/{exam}` | Exams/Show | Detalhes do exame |
| `/{exam}/edit` | Exams/Edit | Editar exame |
| `/pending/list` | Exams/Pending | Exames pendentes |
| `/results/management` | Exams/Results | Gestão de resultados |
| `/reports/statistics` | Exams/Reports | Relatórios estatísticos |

### 💊 Prescrições - Interface
**Prefixo:** `/prescriptions`

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Prescriptions/Index | Lista de prescrições |
| `/create` | Prescriptions/Create | Criar prescrição |
| `/{prescription}` | Prescriptions/Show | Detalhes da prescrição |
| `/{prescription}/edit` | Prescriptions/Edit | Editar prescrição |
| `/templates/library` | Prescriptions/Templates | Biblioteca de templates |
| `/expired/management` | Prescriptions/Expired | Gestão de expiradas |
| `/print/{prescription}` | Prescriptions/Print | Impressão da prescrição |

### 📝 Anotações - Interface
**Prefixo:** `/notes`

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Notes/Index | Lista de anotações |
| `/create` | Notes/Create | Criar anotação |
| `/{note}` | Notes/Show | Detalhes da anotação |
| `/{note}/edit` | Notes/Edit | Editar anotação |
| `/important/list` | Notes/Important | Anotações importantes |
| `/search/advanced` | Notes/Search | Busca avançada |

### 📊 Relatórios
**Prefixo:** `/reports`

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Reports/Dashboard | Dashboard de relatórios |
| `/patients/statistics` | Reports/Patients | Estatísticas de pacientes |
| `/consultations/analytics` | Reports/Consultations | Análises de consultas |
| `/financial/overview` | Reports/Financial | Visão financeira |
| `/medical/insights` | Reports/Medical | Insights médicos |

### ⚙️ Configurações
**Prefixo:** `/settings`

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Settings/General | Configurações gerais |
| `/profile` | Settings/Profile | Perfil médico |
| `/consultations` | Settings/Consultations | Config. de consultas |
| `/preferences` | Settings/Preferences | Preferências |
| `/security` | Settings/Security | Segurança e backup |

### 📅 Agenda
**Prefixo:** `/schedule`

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Schedule/Calendar | Calendário da agenda |
| `/slots` | Schedule/Slots | Configuração de horários |
| `/blocks` | Schedule/Blocks | Bloqueios e feriados |
| `/settings` | Schedule/Settings | Configurações da agenda |

### 🔍 Busca
**Prefixo:** `/search`

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Search/Global | Busca global |
| `/advanced` | Search/Advanced | Busca avançada |

### 🆘 Ajuda
**Prefixo:** `/help`

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/` | Help/Center | Central de ajuda |
| `/docs` | Help/Documentation | Documentação |
| `/faq` | Help/FAQ | Perguntas frequentes |
| `/support` | Help/Support | Suporte técnico |

### 💾 Gestão de Dados
**Prefixo:** `/data`

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/import` | Data/Import | Importação de dados |
| `/export` | Data/Export | Exportação de dados |
| `/backup` | Data/Backup | Backup do sistema |

## Padrões e Convenções

### Nomenclatura
- **Rotas API:** Seguem padrão RESTful
- **Rotas Web:** Usam nomes descritivos em português
- **Prefixos:** Organizados por recurso principal

### Segurança
- Todas as rotas autenticadas verificam `doctor_id`
- Middleware de autenticação em todas as rotas protegidas
- Validação de entrada em todos os controllers

### Performance
- Paginação padrão em listagens (15 itens)
- Eager loading otimizado nos relacionamentos
- Cache implementado onde apropriado

### Estrutura de Resposta API
```json
{
  "success": true|false,
  "message": "Mensagem em português",
  "data": {},
  "errors": {} // apenas em caso de erro
}
```

### Códigos HTTP Utilizados
- `200` - Sucesso
- `201` - Criado com sucesso
- `422` - Erro de validação
- `404` - Não encontrado
- `500` - Erro interno do servidor

## Manutenção

Para adicionar novas rotas:
1. Definir no arquivo apropriado (`web.php` ou `api.php`)
2. Criar o controller se necessário
3. Atualizar esta documentação
4. Testar todas as funcionalidades
5. Verificar middleware de segurança