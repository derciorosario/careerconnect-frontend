// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
import {
  Home, Play, User, Users, Link, Mail, CheckCircle, UserCircle,
  Calendar, Table, Inbox,
} from 'lucide-react';

const ICONS = {
  home: Home,
  live: Play,
  mentors: User,
  met: Users,
  conn: Link,
  msg: Mail,
  fecho: CheckCircle,
  profile: UserCircle,
  hoje: Calendar,
  mesa: Table,
  req: Inbox,
  mentees: Users,
};

export const EVENT_DATE = new Date('2026-12-04T14:00:00+02:00');

export const MENTEES = [
  { name: 'Ana Mondlane',     course: 'Gestão · UEM',                    goal: 'Escolher a minha área',          pitch: 'Quero descobrir que área seguir depois do curso.' },
  { name: 'Bruno Chissano',   course: 'Engenharia Informática · ISCTEM', goal: 'Preparar o primeiro estágio',    pitch: 'Procuro orientação para o meu primeiro estágio.' },
  { name: 'Cláudia Nhantumbo',course: 'Direito · UEM',                   goal: 'Construir a minha marca pessoal', pitch: 'Quero comunicar melhor o que sei fazer.' },
  { name: 'Dino Matola',      course: 'Economia · ISUTC',                goal: 'Desenvolver competências',       pitch: 'Quero reforçar a análise de dados.' },
  { name: 'Elsa Macie',       course: 'Agronomia · UEM',                 goal: 'Criar o meu negócio',            pitch: 'Tenho uma ideia de negócio agrícola.' },
  { name: 'Fátima Sitoe',     course: 'Marketing · ISCIM',               goal: 'Mudar de percurso',              pitch: 'Quero passar de vendas para marketing.' },
];

export const MENTORS = [
  { name: 'Sara Cumbe',   role: 'Directora de Finanças',  company: 'Standard Bank',      area: 'Finanças e Banca' },
  { name: 'Nuno Bila',    role: 'Engenheiro de Software', company: 'Vodacom',            area: 'Tecnologia e TI' },
  { name: 'Carlos Tembe', role: 'Gestor de Marketing',    company: 'Grupo Madal',        area: 'Marketing e Comunicação' },
  { name: 'Ilda Mussa',   role: 'Advogada',               company: 'Mussa & Associados', area: 'Direito' },
  { name: 'Rui Machava',  role: 'Director de RH',         company: 'Vale Moçambique',    area: 'Recursos Humanos' },
  { name: 'Lídia Zimba',  role: 'Fundadora',              company: 'Zimba Agro',         area: 'Agricultura' },
];

export const MASTERCLASSES = [
  'Estratégias para encontrar o primeiro passo',
  'A arte de criar redes de contactos',
  'Fui contratado. E agora?',
];

export const POLL_OPTIONS = ['Falta de experiência', 'Contactos', 'Competências', 'Orientação'];

export const MUTUAL_MATCHES = [1, 2, 4];
export const MY_MENTEE_INDEX = 0;
export const MY_MENTOR_INDEX = 2;

export const INITIAL_QUESTIONS = [
  { text: 'Como se preparam as entrevistas sem experiência?', votes: 12, mine: false },
  { text: 'Vale a pena o LinkedIn para quem está a começar?', votes: 7,  mine: false },
];

export const ROUNDS = [
  { fromMentee: 0, toMentor: 2 },
  { fromMentee: 1, toMentor: 0 },
  { fromMentee: 2, toMentor: 5 },
  { fromMentee: 3, toMentor: 3 },
];

export const NAV_MENTEE = [
  { key: 'home',    label: 'Passaporte', icon: ICONS.home },
  { key: 'live',    label: 'Ao vivo',    icon: ICONS.live },
  { key: 'participantes', label: 'Participantes', icon: ICONS.mentees },
  { key: 'met',     label: 'Conheci',    icon: ICONS.met },
  { key: 'conn',    label: 'Conexões',   icon: ICONS.conn },
  { key: 'msg',     label: 'Mensagens',  icon: ICONS.msg },
  { key: 'fecho',   label: 'Fecho',      icon: ICONS.fecho },
  { key: 'profile', label: 'Perfil',     icon: ICONS.profile },
];

export const NAV_MENTOR = [
  { key: 'home',    label: 'Hoje',      icon: ICONS.hoje },
  { key: 'live',    label: 'Mesa',      icon: ICONS.mesa },
  { key: 'req',     label: 'Pedidos',   icon: ICONS.req },
  { key: 'participantes', label: 'Participantes', icon: ICONS.mentees },
  { key: 'conn',    label: 'Conexões',  icon: ICONS.conn },
  { key: 'msg',     label: 'Mensagens',  icon: ICONS.msg },
  { key: 'fecho',   label: 'Avaliação',  icon: ICONS.fecho },
  { key: 'profile', label: 'Perfil',    icon: ICONS.profile },
];

export const ORGANIZER_TABS = [
  { key: 'live', label: 'Ao vivo' },
  { key: 'reg',  label: 'Inscritos' },
  { key: 'pools', label: 'Pools' },
  { key: 'sessions', label: 'Sessões' },
  { key: 'questions', label: 'Perguntas' },
  { key: 'questionnaire', label: 'Questionário' },
  { key: 'responses', label: 'Respostas' },
  { key: 'int',  label: 'Interação' },
  { key: 'rep',  label: 'Relatórios' },
  { key: 'whatsapp', label: 'WhatsApp' },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
export const getInitials = (name) =>
  name.split(' ').map((word) => word[0]).slice(0, 2).join('');

export const getFirstName = (name) => name.split(' ')[0];

export const compatibilityScore = (menteeIndex, mentorIndex) =>
  55 + ((menteeIndex * 7 + mentorIndex * 13) % 41);

export const hashString = (inputString) => {
  let hashValue = 2166136261;
  for (const character of inputString) {
    hashValue ^= character.charCodeAt(0);
    hashValue = Math.imul(hashValue, 16777619);
  }
  return hashValue >>> 0;
};

export const formatTime = (totalSeconds) =>
  `${String(Math.floor(totalSeconds / 60)).padStart(1, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;

export const generateQrSvg = (seed) => {
  let hashValue = hashString(seed);
  let cells = '';
  for (let y = 0; y < 11; y++) {
    for (let x = 0; x < 11; x++) {
      const isFinderPattern = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
      hashValue = Math.imul(hashValue ^ (hashValue >>> 13), 1274126177) >>> 0;
      if (isFinderPattern || hashValue % 2) {
        cells += `<rect x="${x * 10}" y="${y * 10}" width="10" height="10"/>`;
      }
    }
  }
  return `<svg viewBox="0 0 110 110" fill="#1b2a57" class="w-[120px] h-[120px] bg-white rounded-[14px] p-1.5 shrink-0">${cells}</svg>`;
};