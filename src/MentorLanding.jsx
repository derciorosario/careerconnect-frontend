import React from 'react';
import { Link } from 'react-router-dom';
import logo from './assets/logo.png';

const BTN_BASE   = 'inline-block rounded-full bg-primary-500 text-white font-semibold text-base px-7 py-3.5 cursor-pointer no-underline hover:brightness-110 transition';
const BTN_GHOST  = 'bg-transparent text-ink shadow-[inset_0_0_0_2px_var(--color-line)]';
const BTN_SM     = 'px-[18px] py-[9px] text-sm';

export default function MentorLanding() {
  return (
    <div className="min-h-screen bg-surface text-ink font-sans bg-navy-950">
      <div className="max-w-[1080px] mx-auto px-[22px]">

        <header className="flex justify-between items-center py-5">
          <img src={logo} alt="Career Connect" className="h-10 md:h-12 w-auto" />
          <Link to="/" className={`${BTN_BASE} ${BTN_GHOST} ${BTN_SM}`}>Voltar à landing do mentorado</Link>
        </header>

        <section className="pt-16 md:py-24 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-primary-500 font-bold text-sm uppercase tracking-wider">Torna-te mentor</span>
              <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold tracking-tight mt-3 leading-[1.15]">
                Torna-te mentor.<br />
                <span className="text-primary-500">Influencia a carreira de alguém.</span>
              </h1>
              <p className="max-w-[52ch] mt-6 text-ink-muted text-lg">
                Dois intervalos de 20 minutos, 4 rondas de 5 minutos. Quarenta minutos do teu dia podem mudar o percurso de um estudante ou recém-graduado.
              </p>
              <Link to="/registo/mentor" className={BTN_BASE} style={{ marginTop: 10 }}>Registar como mentor</Link>
            </div>

            <div className="relative w-full max-w-[420px] aspect-[1/1.08] mx-auto" aria-hidden="true">
              <img className="absolute w-[60%] left-0 top-0 rounded-full object-cover bg-surface-soft shadow-[0_0_0_5px_var(--color-surface),0_0_0_8px_var(--color-primary-500)]" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrYw6bc7fuDJ-FAgnkm-RS0ETK-NMqkYbKm_V2QG_nyw&s=10" alt="" />
              <img className="absolute w-[48%] right-0 top-[30%] rounded-full object-cover bg-surface-soft shadow-[0_0_0_5px_var(--color-surface),0_0_0_8px_var(--color-navy-800)]" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPvYbVOh_TvSjwqlEopCLHMMobZVVhnhhUyyGx_rnpiQ&s=10" alt="" />
              <img className="absolute w-[52%] left-[16%] bottom-0 rounded-full object-cover bg-surface-soft shadow-[0_0_0_5px_var(--color-surface),0_0_0_8px_var(--color-primary-500)]" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsSb8b0IwOdRxcEHc3sY-kSquLS3hfBY3dllYwuIXCtuKq8nBCCQh27D87&s=10" alt="" />
            </div>
          </div>
        </section>

        {/* 4 razões */}
        <section className="py-16 md:py-20 bg-navy-800 text-white">
          <div className="max-w-[1080px] mx-auto px-[22px]">
            <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] mb-10">4 razões para ser mentor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5.5">
              {[
                { title: 'Descubra talento', text: 'Conheça estudantes e recém-graduados com potencial antes que o mercado os descubra.' },
                { title: 'Influencie carreiras', text: 'Partilhe a sua experiência e ajude alguém a dar o próximo passo na sua jornada profissional.' },
                { title: 'Expanda a sua rede', text: 'Ligue-se a outros mentores profissionais e oradores do evento.' },
                { title: 'Devolva à comunidade', text: 'Contribua para a próxima geração de profissionais em Moçambique.' },
              ].map((item, i) => (
                <div key={i} className="bg-surface-soft text-ink rounded-inner p-6">
                  <div className="w-10 h-10 rounded-full bg-primary-500 text-white grid place-items-center font-extrabold mb-4">{i + 1}</div>
                  <h3 className="text-[1.1rem] font-extrabold mb-2">{item.title}</h3>
                  <p className="text-navy-100 text-[.88rem]">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* O que se espera */}
        <section className="py-16 md:py-20">
          <div className="max-w-[1080px] mx-auto px-[22px]">
            <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] mb-10">O que se espera de si</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
              <div className="bg-surface-soft rounded-inner p-6 border border-line">
                <h3 className="text-[1.1rem] font-extrabold mb-2">40 min no dia</h3>
                <p className="text-ink-muted text-[.88rem]">Dois intervalos de 20 minutos com 4 rondas de 5 minutos cada. Só durante o evento.</p>
              </div>
              <div className="bg-surface-soft rounded-inner p-6 border border-line">
                <h3 className="text-[1.1rem] font-extrabold mb-2">1 a 3 mentorados</h3>
                <p className="text-ink-muted text-[.88rem]">Pode acompanhar até 3 mentorados depois do evento, respeitando o seu limite.</p>
              </div>
              <div className="bg-surface-soft rounded-inner p-6 border border-line">
                <h3 className="text-[1.1rem] font-extrabold mb-2">Aprovação do organizador</h3>
                <p className="text-ink-muted text-[.88rem]">O seu perfil fica pendente até a equipa organizadora aprovar a participação.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3 passos */}
        <section className="py-16 md:py-20 bg-navy-800 text-white">
          <div className="max-w-[1080px] mx-auto px-[22px]">
            <h2 className="text-[clamp(1.8rem,4.5vw,2.8rem)] font-extrabold tracking-tight max-w-[20ch] mb-10">3 passos para ser mentor</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '1', title: 'Registe-se', text: 'Preencha o formulário em /mentor com cargo, empresa, setor e áreas em que pode ajudar.' },
                { step: '2', title: 'Aguardo aprovação', text: 'O organizador revisa o seu perfil e aprova a participação antes do evento.' },
                { step: '3', title: 'Participe', text: 'Faça check-in no dia do evento e conduza as rondas na sua mesa.' },
              ].map((step, i) => (
                <div key={i} className="relative pt-[52px]">
                  <div className="absolute top-0 left-0 w-10 h-10 rounded-full bg-primary-500 text-white grid place-items-center font-extrabold">{step.step}</div>
                  <h3 className="text-[1.15rem] font-extrabold mb-2">{step.title}</h3>
                  <p className="text-navy-100 text-[.9rem]">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-5 pb-16 md:pb-20">
          <div className="max-w-[1080px] mx-auto px-[22px] text-center">
            <p className="text-ink-muted text-sm mb-6">4 de Dezembro de 2026 · 14H00 · Hotel Cardoso, Maputo</p>
            <Link to="/registo/mentor" className={BTN_BASE}>Registar como mentor</Link>
          </div>
        </section>

        <footer className="pt-8 pb-12 text-ink-muted text-sm">
          <div className="max-w-[1080px] mx-auto px-[22px]">Career Connect® · 4 de Dezembro de 2026 · 14H00 · Hotel Cardoso, Maputo</div>
        </footer>

      </div>
    </div>
  );
}
