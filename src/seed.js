// ─────────────────────────────────────────────
// SHARED SEED STATE — frontend-only simulation
// All data lives in localStorage under key 'cc26_app'
// ─────────────────────────────────────────────
import { MENTEES, MENTORS, MY_MENTEE_INDEX, MY_MENTOR_INDEX } from './data';

const STORAGE_KEY = 'cc26_app';

const EVENT = {
  name: 'Career Connect',
  date: '4 de Dezembro de 2026',
  time: '14H00',
  venue: 'Hotel Cardoso, Maputo',
  capacity: 120,
  roundsPerBreak: 4,
  roundMinutes: 5,
};

const AREAS = [
  'Tecnologia e TI',
  'Finanças e Banca',
  'Engenharia',
  'Saúde',
  'Direito',
  'Marketing e Comunicação',
  'Gestão e Empreendedorismo',
  'Recursos Humanos',
  'Energia e Recursos Naturais',
  'Educação',
  'Agricultura',
  'Logística',
];

const GOALS = [
  'Escolher a minha área',
  'Preparar o primeiro estágio',
  'Construir a minha marca pessoal',
  'Desenvolver competências',
  'Mudar de percurso',
  'Criar o meu negócio',
];

const emptyState = () => ({
  event: EVENT,
  users: {},
  sessions: {},
  registrations: {},
  menteeProfiles: {},
  mentorProfiles: {},
  wishes: {},
  connections: {},
  mentorshipRequests: {},
  messages: {},
  feedback: {},
  survey: {},
  nextSteps: {},
  badges: {},
  announcements: [],
  questions: [],
  pollVotes: [4, 9, 3, 2],
  checkins: {},
  currentRound: 0,
  isPaused: false,
  isRehearsal: false,
});

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
};

const save = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors in simulation
  }
};

const generateTicketCode = () => 'CC-' + Math.random().toString(36).slice(2, 7).toUpperCase();

export { STORAGE_KEY, emptyState, load, save, generateTicketCode, AREAS, GOALS, EVENT, MENTEES, MENTORS, MY_MENTEE_INDEX, MY_MENTOR_INDEX };
