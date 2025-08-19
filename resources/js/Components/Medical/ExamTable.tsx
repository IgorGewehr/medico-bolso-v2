import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  LinearProgress,
  InputAdornment,
  Tooltip,
  Badge,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ContentCopyOutlined as ContentCopyOutlinedIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  AutoAwesome as AutoAwesomeIcon,
  FileDownloadDone as FileDownloadDoneIcon,
} from '@mui/icons-material';

// Tipos
interface ExamCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  exams: string[];
}

interface ExamResults {
  [categoryId: string]: {
    [examName: string]: string;
  };
}

interface ExamTableProps {
  results?: ExamResults;
  onUpdateResults?: (results: ExamResults) => void;
  readOnly?: boolean;
  isAiProcessed?: boolean;
  categories?: ExamCategory[];
}

// Categorias padrão de exames
const DEFAULT_EXAM_CATEGORIES: ExamCategory[] = [
  {
    id: 'LabGerais',
    title: 'Exames Laboratoriais Gerais',
    icon: '🩸',
    color: '#EF4444',
    exams: ['Hemograma completo', 'Plaquetas', 'Glicose', 'Ureia', 'Creatinina', 'Ácido Úrico', 'Urina tipo 1 (EAS)', 'Fezes']
  },
  {
    id: 'PerfilLipidico',
    title: 'Perfil Lipídico',
    icon: '⭕️',
    color: '#F97316',
    exams: ['Colesterol Total', 'HDL', 'LDL', 'Triglicerídeos']
  },
  {
    id: 'Hepaticos',
    title: 'Exames Hepáticos e Pancreáticos',
    icon: '🫁',
    color: '#EC4899',
    exams: ['TGO (AST)', 'TGP (ALT)', 'Gama GT', 'Bilirrubinas', 'Amilase', 'Lipase', 'Albumina', 'Proteínas totais e frações']
  },
  {
    id: 'Inflamatorios',
    title: 'Inflamatórios e Imunológicos',
    icon: '🔬',
    color: '#EAB308',
    exams: ['PCR', 'VHS', 'Fator Reumatoide', 'FAN', 'Anti-DNA', 'Anti-CCP', 'ANCA', 'D-Dímero', 'Coagulograma']
  },
  {
    id: 'Hormonais',
    title: 'Hormonais',
    icon: '⚗️',
    color: '#8B5CF6',
    exams: ['TSH', 'T3', 'T4', 'Prolactina', 'LH', 'FSH', 'Testosterona', 'Estradiol', 'Progesterona', 'DHEA', 'Cortisol', 'Insulina', 'Hemoglobina glicada']
  },
  {
    id: 'Vitaminas',
    title: 'Vitaminas e Minerais',
    icon: '💊',
    color: '#F59E0B',
    exams: ['Vitamina D', 'Vitamina B12', 'Cálcio', 'Fósforo', 'Magnésio', 'Sódio (Na)', 'Potássio (K)']
  },
  {
    id: 'Infecciosos',
    title: 'Infecciosos / Sorologias',
    icon: '🦠',
    color: '#06B6D4',
    exams: ['Hepatite A', 'Hepatite B', 'Hepatite C', 'HIV', 'Sífilis (VDRL)', 'Dengue', 'Zika', 'Chikungunya']
  },
  {
    id: 'Tumorais',
    title: 'Marcadores Tumorais',
    icon: '🔍',
    color: '#F43F5E',
    exams: ['PSA', 'CA 125', 'CA 15-3', 'CA 19-9', 'CEA', 'AFP', 'Beta-HCG']
  },
  {
    id: 'Cardiacos',
    title: 'Cardíacos e Musculares',
    icon: '❤️',
    color: '#10B981',
    exams: ['CK', 'CK-MB', 'Troponina']
  },
  {
    id: 'Imagem',
    title: 'Imagem e Diagnóstico',
    icon: '📷',
    color: '#6366F1',
    exams: ['Raio-X', 'Ultrassonografia', 'Tomografia Computadorizada', 'Ressonância Magnética', 'Densitometria Óssea']
  }
];

const ExamTable: React.FC<ExamTableProps> = ({
  results = {},
  onUpdateResults,
  readOnly = false,
  isAiProcessed = false,
  categories = DEFAULT_EXAM_CATEGORIES
}) => {
  const theme = useTheme();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCategory, setCopiedCategory] = useState<string | null>(null);

  // Atualizar resultado de exame
  const handleUpdateExamResult = (categoryId: string, examName: string, value: string) => {
    if (readOnly || !onUpdateResults) return;

    const updatedResults = {
      ...results,
      [categoryId]: {
        ...(results[categoryId] || {}),
        [examName]: value
      }
    };

    onUpdateResults(updatedResults);
  };

  // Expandir/contrair categoria
  const handleCategoryExpand = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  // Copiar resultados da categoria
  const handleCopyCategory = (categoryId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    let copyText = `${category.title}:\n\n`;
    category.exams.forEach(examName => {
      const value = results[categoryId]?.[examName] || '';
      copyText += `${examName}: ${value}\n`;
    });

    navigator.clipboard.writeText(copyText).then(() => {
      setCopiedCategory(categoryId);
      setTimeout(() => setCopiedCategory(null), 2000);
    });
  };

  // Filtrar categorias com base na pesquisa
  const filteredCategories = searchTerm.trim() === ''
    ? categories
    : categories.map(category => ({
        ...category,
        exams: category.exams.filter(exam =>
          exam.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.exams.length > 0);

  // Calcular estatísticas
  const getFilledFieldsInCategory = (categoryId: string): number => {
    if (!results[categoryId]) return 0;
    return Object.values(results[categoryId]).filter(value => value.trim() !== '').length;
  };

  const getCategoryCompletionPercentage = (categoryId: string, categoryExams: string[]): number => {
    if (!results[categoryId] || categoryExams.length === 0) return 0;
    const filledFields = getFilledFieldsInCategory(categoryId);
    return Math.round((filledFields / categoryExams.length) * 100);
  };

  const getTotalStats = () => {
    let filled = 0;
    let total = 0;

    categories.forEach(category => {
      category.exams.forEach(examName => {
        total++;
        if (results[category.id]?.[examName]?.trim()) {
          filled++;
        }
      });
    });

    return { filled, total, percentage: total > 0 ? Math.round((filled / total) * 100) : 0 };
  };

  const totalStats = getTotalStats();

  return (
    <Box sx={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      {/* Cabeçalho */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Box component="span" sx={{ mr: 1 }}>📋</Box>
          Resultados de Exames
          {isAiProcessed && (
            <Tooltip title="Processado com IA">
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  borderRadius: '12px',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                <AutoAwesomeIcon fontSize="small" />
                IA
              </Box>
            </Tooltip>
          )}
        </Typography>
      </Box>

      {/* Barra de Progresso Geral */}
      <Box sx={{
        mb: 3,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F9FAFB',
        p: 2,
        borderRadius: '10px',
        border: '1px solid #EAECEF'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
            Progresso de preenchimento
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {totalStats.filled}/{totalStats.total} campos ({totalStats.percentage}%)
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={totalStats.percentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
            }
          }}
        />
      </Box>

      {/* Campo de Busca */}
      <TextField
        fullWidth
        placeholder="Buscar exame específico..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          mb: 3,
          '& .MuiOutlinedInput-root': {
            borderRadius: '10px',
            backgroundColor: '#F9FAFB',
            '&.Mui-focused': {
              boxShadow: '0 0 0 3px rgba(24, 82, 254, 0.1)'
            }
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchTerm ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => setSearchTerm('')}
                edge="end"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null
        }}
      />

      {/* Categorias de Exames */}
      <Box sx={{ mb: 4 }}>
        {filteredCategories.map((category) => {
          const categoryResults = results[category.id] || {};
          const hasResults = Object.keys(categoryResults).length > 0;
          const completionPercentage = getCategoryCompletionPercentage(category.id, category.exams);
          const filledCount = getFilledFieldsInCategory(category.id);

          return (
            <Accordion
              key={category.id}
              expanded={expandedCategory === category.id}
              onChange={() => handleCategoryExpand(category.id)}
              sx={{
                mb: 2,
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
                borderRadius: '12px !important',
                overflow: 'hidden',
                '&:before': {
                  display: 'none',
                },
                border: hasResults
                  ? `1px solid ${alpha(category.color, 0.5)}`
                  : `1px solid ${alpha(category.color, 0.2)}`
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  backgroundColor: hasResults
                    ? alpha(category.color, 0.15)
                    : alpha(category.color, 0.05),
                  borderLeft: `4px solid ${category.color}`,
                  '&.Mui-expanded': {
                    borderBottom: `1px solid ${alpha(category.color, 0.2)}`
                  },
                  '& .MuiAccordionSummary-content': {
                    width: '100%',
                    margin: '12px 0',
                  }
                }}
              >
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      component="span"
                      sx={{
                        mr: 2,
                        fontSize: '20px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {category.icon}
                    </Box>
                    <Box>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: alpha(category.color, 0.9)
                        }}
                      >
                        {category.title}
                      </Typography>

                      {/* Barra de progresso da categoria */}
                      {hasResults && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Box sx={{
                            width: 120,
                            height: 4,
                            backgroundColor: alpha(category.color, 0.2),
                            borderRadius: 2,
                            mr: 1
                          }}>
                            <Box sx={{
                              height: '100%',
                              width: `${completionPercentage}%`,
                              backgroundColor: category.color,
                              borderRadius: 2
                            }} />
                          </Box>
                          <Typography variant="caption" sx={{ color: alpha(category.color, 0.9) }}>
                            {completionPercentage}% preenchido
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/* Badge de resultados */}
                    {hasResults && (
                      <Tooltip title={`${filledCount} resultados preenchidos`}>
                        <Badge
                          badgeContent={filledCount}
                          color="primary"
                          sx={{ mr: 2 }}
                        >
                          <FileDownloadDoneIcon
                            sx={{ color: category.color, fontSize: 20 }}
                          />
                        </Badge>
                      </Tooltip>
                    )}

                    {/* Botão de copiar */}
                    <Tooltip title={copiedCategory === category.id ? "Copiado!" : "Copiar resultados"}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleCopyCategory(category.id, e)}
                        sx={{
                          color: copiedCategory === category.id 
                            ? theme.palette.success.main 
                            : theme.palette.text.secondary,
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                          }
                        }}
                      >
                        {copiedCategory === category.id
                          ? <CheckCircleOutlineIcon fontSize="small" />
                          : <ContentCopyOutlinedIcon fontSize="small" />
                        }
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 0 }}>
                <Paper elevation={0} sx={{ width: '100%', borderRadius: 0 }}>
                  {category.exams.map((examName, index) => {
                    const value = results[category.id]?.[examName] || '';

                    return (
                      <Box
                        key={examName}
                        sx={{
                          p: 2,
                          display: 'flex',
                          borderBottom: `1px solid ${alpha(category.color, 0.1)}`,
                          '&:hover': {
                            backgroundColor: alpha(category.color, 0.03)
                          },
                          '&:last-child': {
                            borderBottom: 'none'
                          }
                        }}
                      >
                        <Box
                          sx={{
                            flex: 1,
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            pr: 2
                          }}
                        >
                          {examName}
                        </Box>
                        <Box sx={{ width: '40%' }}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Preencher resultado"
                            value={value}
                            onChange={(e) => handleUpdateExamResult(category.id, examName, e.target.value)}
                            disabled={readOnly}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                backgroundColor: value ? alpha('#FFFFFF', 0.9) : 'transparent',
                                '&:hover fieldset': {
                                  borderColor: alpha(category.color, 0.5),
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: category.color,
                                  boxShadow: `0 0 0 3px ${alpha(category.color, 0.2)}`
                                }
                              }
                            }}
                            InputProps={{
                              endAdornment: value ? (
                                <InputAdornment position="end">
                                  <Tooltip title="Limpar">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleUpdateExamResult(category.id, examName, '')}
                                      edge="end"
                                    >
                                      <ClearIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </InputAdornment>
                              ) : null
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Paper>
              </AccordionDetails>
            </Accordion>
          );
        })}

        {/* Mensagem quando não há resultados na busca */}
        {filteredCategories.length === 0 && searchTerm && (
          <Box sx={{
            p: 4,
            textAlign: 'center',
            border: '1px dashed #ccc',
            borderRadius: '12px',
            color: theme.palette.text.secondary
          }}>
            <SearchIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 2 }} />
            <Typography variant="h6">
              Nenhum exame encontrado
            </Typography>
            <Typography>
              Tente outro termo de busca ou limpe o filtro.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ExamTable;