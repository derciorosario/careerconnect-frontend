import React, { useState, useEffect, useRef } from 'react';
import {
  ccGetMentorDirectory, ccGetMenteeDirectory,
  ccGetMyWishes, ccAddWish, ccRemoveWish,
} from './api/client';
import { PersonRow, PersonDetailsDialog, Card } from './ui';

const SkeletonBar = ({ w = '100%', h = 14, r = 7, className = '' }) => (
  <div className={`animate-pulse bg-surface2 ${className}`} style={{ width: w, height: h, borderRadius: r }} aria-hidden="true" />
);

const SkeletonCard = () => (
  <div className="animate-pulse rounded-[18px] p-4 mb-3.5 space-y-3 bg-surface-soft" aria-hidden="true">
    <div className="flex items-center gap-3">
      <div className="animate-pulse bg-surface2 rounded-full" style={{ width: 44, height: 44 }} />
      <div className="flex-1 space-y-2">
        <SkeletonBar w="55%" h={13} />
        <SkeletonBar w="35%" h={11} />
      </div>
    </div>
  </div>
);

export const Participantes = ({ showToast, setActiveTab, setMessageTarget }) => {
  const role = localStorage.getItem('userRole') || '';
  const isMentee = role === 'mentee';

  const [tab, setTab] = useState('mentee');
  const [search, setSearch] = useState('');
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [wished, setWished] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const showToastRef = useRef(showToast);
  useEffect(() => { showToastRef.current = showToast; });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [mentorResp, menteeResp, wishResp] = await Promise.all([
          ccGetMentorDirectory({}),
          ccGetMenteeDirectory({}),
          isMentee ? ccGetMyWishes() : Promise.resolve({ data: { wishes: [] } }),
        ]);
        if (cancelled) return;
        setMentors(mentorResp.data?.mentors || []);
        setMentees(menteeResp.data?.mentees || []);
        setWished((wishResp.data?.wishes || []).map((w) => w.mentor_id));
      } catch (err) {
        if (!cancelled) console.error('Failed to load participantes:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isMentee]);

  const toggleWish = async (mentor) => {
    const isWished = wished.includes(mentor.id);
    if (isWished) {
      try {
        await ccRemoveWish({ mentor_id: mentor.id });
        setWished((prev) => prev.filter((id) => id !== mentor.id));
        showToastRef.current(`Interesse em ${mentor.name} removido.`);
      } catch (err) {
        showToastRef.current(err.response?.data?.message || 'Erro ao remover.');
      }
      return;
    }
    if (wished.length >= 5) return showToastRef.current('Máximo de 5 mentores.');
    try {
      await ccAddWish({ mentor_id: mentor.id });
      setWished([...wished, mentor.id]);
      showToastRef.current(`Interesse em ${mentor.name} guardado.`);
    } catch (err) {
      showToastRef.current(err.response?.data?.message || 'Erro ao guardar.');
    }
  };

  const term = search.trim().toLowerCase();
  const matches = (u) =>
    !term ||
    (u.name || '').toLowerCase().includes(term) ||
    (u.email || '').toLowerCase().includes(term);

  const list = tab === 'mentor'
    ? mentors.filter(matches)
    : mentees.filter(matches);

  const total = tab === 'mentor' ? mentors.length : mentees.length;

  if (loading) {
    return (
      <div role="status" aria-busy="true" aria-label="A carregar participantes">
        <SkeletonBar w="40%" h={26} className="mb-2" />
        <SkeletonBar w="80%" h={12} className="mb-4" />
        {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[1.45rem] font-extrabold tracking-tight">Participantes</h2>
      <p className="text-ink-muted text-[.85rem] mt-1 mb-4">
        Lista de todos os participantes da plataforma.
      </p>

      {/* Tabs */}
      <div role="tablist" aria-label="Filtrar participantes" className="flex gap-1.5 bg-surface-soft p-1.5 rounded-full mb-3.5">
           <button
          role="tab"
          aria-selected={tab === 'mentee'}
          onClick={() => setTab('mentee')}
          className={`flex-1 rounded-full py-2.5 font-semibold text-sm transition ${tab === 'mentee' ? 'bg-navy-800 text-white' : 'bg-transparent text-ink-muted hover:text-ink'}`}
        >
          Mentorados ({mentees.length})
        </button>
        <button
          role="tab"
          aria-selected={tab === 'mentor'}
          onClick={() => setTab('mentor')}
          className={`flex-1 rounded-full py-2.5 font-semibold text-sm transition ${tab === 'mentor' ? 'bg-navy-800 text-white' : 'bg-transparent text-ink-muted hover:text-ink'}`}
        >
          Mentores ({mentors.length})
        </button>
     
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Pesquisar por nome ou email..."
        className="w-full text-base bg-surface border-2 border-line rounded-[14px] px-3.5 py-2.5 mb-3.5 focus:border-primary-500 focus:outline-none"
      />

      {isMentee && tab === 'mentor' && (
        <p className="text-ink-muted text-[.8rem] mb-3">Marcados: {wished.length}/5</p>
      )}

      {list.length === 0 && (
        <Card>
          <p className="text-ink-muted text-[.85rem]">Nenhum participante encontrado.</p>
        </Card>
      )}

      {list.map((user) => {
        const isMentor = tab === 'mentor';
        const subtitle = isMentor
          ? ([user.mentorProfile?.job_title, user.mentorProfile?.company].filter(Boolean).join(', ') || 'Mentor')
          : ([user.menteeProfile?.course, user.menteeProfile?.institution].filter(Boolean).join(' · ') || 'Mentorado');
        const isWished = wished.includes(user.id);
        // Mentees can only message mentors and mentors only mentees.
        const canMessage = isMentee ? isMentor : !isMentor;
        const openMessage = () => {
          if (!canMessage) return;
          setMessageTarget?.({
            id: user.id,
            name: user.name,
            photo_url: user.photo_url,
            role: isMentor ? 'mentor' : 'mentee',
          });
          setActiveTab?.('msg');
        };
        return (
          <Card key={user.id}>
            <PersonRow
              name={user.name}
              subtitle={subtitle}
              photoUrl={user.photo_url}
              onClick={() => setSelected({ ...user, role: isMentor ? 'mentor' : 'mentee' })}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5">
              <span className={`rounded-full px-2.5 py-[3px] text-[.68rem] font-bold ${isMentor ? 'bg-primary-500 text-white' : 'bg-navy-800 text-white'}`}>
                {isMentor ? 'Mentor' : 'Mentorado'}
              </span>
              {canMessage && (
                <button
                  onClick={openMessage}
                  className="rounded-full font-bold text-[.76rem] h-[34px] px-3.5 bg-primary-500 text-white"
                >
                  Mensagem
                </button>
              )}
              {isMentee && isMentor &&  false && ( //leave like that with :false (it cannot be shown)
                <button
                  onClick={() => toggleWish(user)}
                  className={`rounded-full font-bold text-[.76rem] h-[34px] px-3.5 ${isWished ? 'bg-primary-500 text-white' : 'bg-surface2 text-ink'}`}
                >
                  {isWished ? 'Marcado ✓' : 'Quero'}
                </button>
              )}
            </div>
          </Card>
        );
      })}

      {selected && (
        <PersonDetailsDialog user={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
};