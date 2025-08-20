import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Paper,
  IconButton,
  CircularProgress,
  Typography,
  Fade,
  Box,
  Tooltip,
  Grow,
  LinearProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Mic,
  Stop,
  Close,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';

interface FloatingVoiceRecorderProps {
  onTranscription?: (transcription: string) => void;
  onClose: () => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  context?: string;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'success' | 'error';
type Position = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

const FloatingVoiceRecorder: React.FC<FloatingVoiceRecorderProps> = ({ 
  onTranscription, 
  onClose, 
  position = 'top-right',
  context = 'chat' 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [state, setState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const getPositionStyles = (): Record<Position, React.CSSProperties> => {
    const spacing = isMobile ? 10 : 20;
    return {
      'top-right': { top: spacing, right: spacing },
      'top-left': { top: spacing, left: spacing },
      'bottom-right': { bottom: spacing, right: spacing },
      'bottom-left': { bottom: spacing, left: spacing }
    };
  };

  const updateAudioLevel = useCallback((): void => {
    if (analyserRef.current && state === 'recording') {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255);
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    }
  }, [state]);

  const startRecording = async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setState('recording');
      setError('');
      
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      updateAudioLevel();
    } catch (err) {
      setError('Erro ao acessar o microfone');
      setState('error');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setState('processing');
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setRecordingTime(0);
    setAudioLevel(0);
  };

  const processAudio = async (audioBlob: Blob): Promise<void> => {
    setState('processing');
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('context', context);

      const response = await fetch('/api/audio-processing', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao processar áudio');
      }

      const data = await response.json();
      
      if (data.transcription) {
        setState('success');
        onTranscription?.(data.transcription);
        
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (err) {
      setError('Erro ao processar áudio');
      setState('error');
      console.error('Error processing audio:', err);
    }
  };

  const handleClose = (): void => {
    stopRecording();
    onClose();
  };

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWidth = (): number => {
    if (isMobile) {
      return state === 'recording' || state === 'processing' ? 250 : 180;
    } else if (isTablet) {
      return state === 'recording' || state === 'processing' ? 260 : 190;
    } else {
      return state === 'recording' || state === 'processing' ? 280 : 200;
    }
  };

  return (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        ...getPositionStyles()[position],
        zIndex: 1300,
        p: isMobile ? 1.5 : 2,
        borderRadius: isMobile ? 2 : 3,
        minWidth: getWidth(),
        maxWidth: isMobile ? 'calc(100vw - 20px)' : 'none',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography 
          variant={isMobile ? "caption" : "subtitle2"} 
          color="textSecondary"
          sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
        >
          Gravação de Voz
        </Typography>
        <IconButton 
          size={isMobile ? "small" : "medium"} 
          onClick={handleClose} 
          sx={{ ml: 1 }}
        >
          <Close fontSize={isMobile ? "small" : "medium"} />
        </IconButton>
      </Box>

      <Box display="flex" alignItems="center" gap={isMobile ? 1 : 2}>
        {state === 'idle' && (
          <Tooltip title="Iniciar gravação">
            <IconButton
              onClick={startRecording}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
                width: isMobile ? 48 : isTablet ? 52 : 56,
                height: isMobile ? 48 : isTablet ? 52 : 56,
              }}
            >
              <Mic sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }} />
            </IconButton>
          </Tooltip>
        )}

        {state === 'recording' && (
          <>
            <Box position="relative" display="inline-flex">
              <IconButton
                onClick={stopRecording}
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'error.dark' },
                  width: isMobile ? 48 : isTablet ? 52 : 56,
                  height: isMobile ? 48 : isTablet ? 52 : 56,
                }}
              >
                <Stop sx={{ fontSize: isMobile ? '1.2rem' : '1.5rem' }} />
              </IconButton>
              <Box
                sx={{
                  position: 'absolute',
                  inset: isMobile ? -3 : -4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={audioLevel * 100}
                  size={isMobile ? 58 : isTablet ? 64 : 68}
                  thickness={2}
                  sx={{
                    color: 'primary.main',
                    opacity: 0.3,
                  }}
                />
              </Box>
            </Box>
            <Box flex={1}>
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                color="error" 
                gutterBottom
                sx={{ fontSize: isMobile ? '1rem' : undefined }}
              >
                {formatTime(recordingTime)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={audioLevel * 100}
                sx={{
                  height: isMobile ? 3 : 4,
                  borderRadius: 2,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'error.main',
                  },
                }}
              />
            </Box>
          </>
        )}

        {state === 'processing' && (
          <>
            <CircularProgress size={isMobile ? 32 : 40} />
            <Typography 
              variant={isMobile ? "caption" : "body2"} 
              color="textSecondary"
              sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
            >
              Processando...
            </Typography>
          </>
        )}

        {state === 'success' && (
          <Grow in={state === 'success'}>
            <Box display="flex" alignItems="center" gap={1}>
              <CheckCircle 
                color="success" 
                sx={{ fontSize: isMobile ? 32 : 40 }} 
              />
              <Typography 
                variant={isMobile ? "caption" : "body2"} 
                color="success.main"
                sx={{ fontSize: isMobile ? '0.75rem' : undefined }}
              >
                Transcrito com sucesso!
              </Typography>
            </Box>
          </Grow>
        )}
      </Box>

      {error && (
        <Fade in={!!error}>
          <Box display="flex" alignItems="center" gap={1} mt={isMobile ? 1 : 2}>
            <ErrorIcon 
              color="error" 
              fontSize={isMobile ? "small" : "medium"} 
            />
            <Typography 
              variant="caption" 
              color="error"
              sx={{ fontSize: isMobile ? '0.7rem' : undefined }}
            >
              {error}
            </Typography>
          </Box>
        </Fade>
      )}
    </Paper>
  );
};

export default FloatingVoiceRecorder;