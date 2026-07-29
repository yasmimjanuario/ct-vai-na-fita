"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";

const times = ["06:00", "07:00", "08:00", "17:00", "18:00", "19:00", "20:00"];

function toInputDate(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function dateParts(date: Date) {
  return {
    value: toInputDate(date),
    weekday: new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
      .format(date)
      .replace(".", ""),
    day: new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("pt-BR", { month: "short" })
      .format(date)
      .replace(".", ""),
  };
}

const whatsappUrl =
  "https://wa.me/5521971194446?text=Oi%2C%20vim%20pelo%20site%20do%20CT%20Vai%20na%20Fita%20e%20quero%20saber%20mais%20sobre%20a%20aula%20experimental.";

const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Mirante+de+Icara%C3%AD%2C+Estrada+Leopoldo+Fr%C3%B3es%2C+Niter%C3%B3i";

export default function Home() {
  const today = useMemo(() => new Date(), []);
  const minDate = useMemo(() => toInputDate(today), [today]);
  const [selectedDate, setSelectedDate] = useState(minDate);
  const [selectedTime, setSelectedTime] = useState("18:00");
  const [weekOffset, setWeekOffset] = useState(0);
  const [showStudentFields, setShowStudentFields] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [practiced, setPracticed] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const agendaDates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        dateParts(addDays(today, weekOffset + index)),
      ),
    [today, weekOffset],
  );

  function openStudentForm() {
    setSubmitMessage("");
    setShowStudentFields(true);
  }

  async function saveBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitMessage("");
    const params = new URLSearchParams(window.location.search);
    const partner =
      params.get("partner") || params.get("utm_source") || "acesso direto";

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          age: Number(age),
          practiced,
          date: selectedDate,
          time: selectedTime,
          partner,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Não foi possível concluir o agendamento.");
      }

      setSubmitMessage(
        "Aula agendada! Seus dados foram enviados para o CT. Te esperamos na areia — venha viver essa experiência com a gente! 💚",
      );
      setName("");
      setPhone("");
      setAge("");
      setPracticed("");
      setShowStudentFields(false);
    } catch (error) {
      setSubmitMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir o agendamento.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <nav className="nav shell" aria-label="Navegação principal">
          <a className="brand" href="#inicio" aria-label="CT Vai na Fita">
            <Image
              className="brand-logo"
              src="/brand/logo-horizontal-branca.png"
              alt="CT Vai na Fita Futevôlei"
              width={641}
              height={236}
              priority
            />
          </a>
          <div className="nav-links">
            <a className="nav-link" href="#nossa-areia">Nossa areia</a>
            <a className="nav-link" href="#fundadores">Quem faz</a>
            <a className="nav-link" href="#localizacao">Onde estamos</a>
          </div>
        </nav>

        <div className="hero-content shell" id="inicio">
          <div className="hero-copy">
            <span className="eyebrow">Sua primeira aula é por nossa conta</span>
            <h1>
              Vem descobrir o
              <span>futevôlei.</span>
            </h1>
            <p>
              Escolha o melhor horário e venha viver a energia do CT Vai na
              Fita, na Praia de Icaraí.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#agendar">
                Agendar aula grátis <span aria-hidden="true">→</span>
              </a>
              <a className="text-link" href={whatsappUrl} target="_blank" rel="noreferrer">
                Falar no WhatsApp
              </a>
            </div>
            <div className="trust-row" aria-label="Informações importantes">
              <span>✓ Sem compromisso</span>
              <span>✓ Resposta rápida</span>
              <span>✓ Turmas para iniciantes</span>
            </div>
          </div>

          <div className="hero-visual">
            <Image
              className="hero-photo"
              src="/photos/turma-torneio.webp"
              alt="Turma do CT Vai na Fita reunida na areia em Icaraí"
              fill
              sizes="(max-width: 850px) 100vw, 45vw"
              priority
            />
            <span className="hero-photo-label">Icaraí • Niterói</span>
            <div className="floating-card">
              <span className="pulse" />
              <p>Mais que uma aula</p>
              <strong>Esporte, praia e comunidade</strong>
              <small>Para quem está começando também</small>
            </div>
          </div>
        </div>
        <div className="wave" />
      </section>

      <section className="booking-section shell" id="agendar">
        <div className="section-heading">
          <span className="step">01</span>
          <div>
            <p className="kicker">Aula experimental</p>
            <h2>Escolha quando você quer jogar</h2>
          </div>
        </div>

        <div className="booking-layout">
          <div className="booking-card">
            <div className="booking-top">
              <div>
                <span>Modalidade</span>
                <strong>Futevôlei</strong>
              </div>
              <span className="free-tag">GRÁTIS</span>
            </div>

            <form onSubmit={saveBooking}>
              <div className="agenda-heading">
                <div>
                  <span>Escolha a data</span>
                  <strong>{formatDate(selectedDate)}</strong>
                </div>
                <span className="capacity-note">4 vagas por horário</span>
              </div>

              <div className="agenda-calendar" aria-label="Agenda de datas disponíveis">
                <button
                  className="agenda-arrow"
                  type="button"
                  aria-label="Ver semana anterior"
                  disabled={weekOffset === 0}
                  onClick={() => setWeekOffset(Math.max(0, weekOffset - 7))}
                >
                  ‹
                </button>
                <div className="agenda-days">
                  {agendaDates.map((date, index) => (
                    <button
                      className={selectedDate === date.value ? "agenda-day active" : "agenda-day"}
                      key={date.value}
                      type="button"
                      onClick={() => {
                        setSelectedDate(date.value);
                        setShowStudentFields(false);
                        setSubmitMessage("");
                      }}
                    >
                      <span>{index === 0 && weekOffset === 0 ? "Hoje" : date.weekday}</span>
                      <strong>{date.day}</strong>
                      <small>{date.month}</small>
                    </button>
                  ))}
                </div>
                <button
                  className="agenda-arrow"
                  type="button"
                  aria-label="Ver próxima semana"
                  disabled={weekOffset >= 84}
                  onClick={() => setWeekOffset(Math.min(84, weekOffset + 7))}
                >
                  ›
                </button>
              </div>

              <p className="time-label">Horários disponíveis</p>
              <div className="time-grid">
                {times.map((time) => (
                  <button
                    className={selectedTime === time ? "time active" : "time"}
                    key={time}
                    onClick={() => {
                      setSelectedTime(time);
                      setShowStudentFields(false);
                      setSubmitMessage("");
                    }}
                    type="button"
                  >
                    {time}
                  </button>
                ))}
              </div>

              {!showStudentFields ? (
                <button className="button button-confirm" type="button" onClick={openStudentForm}>
                  Agendar aula
                  <span aria-hidden="true">→</span>
                </button>
              ) : (
                <div className="student-form">
                  <div className="selection-summary">
                    <span>Sua aula</span>
                    <strong>{formatDate(selectedDate)} às {selectedTime}</strong>
                  </div>
                  <div className="student-fields">
                    <label>
                      <span>Nome</span>
                      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome completo" required autoFocus />
                    </label>
                    <label>
                      <span>Telefone</span>
                      <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(21) 99999-9999" inputMode="tel" required />
                    </label>
                    <label>
                      <span>Idade</span>
                      <input value={age} onChange={(event) => setAge(event.target.value)} placeholder="Ex.: 28" inputMode="numeric" min="5" max="100" type="number" required />
                    </label>
                    <label>
                      <span>Já praticou futevôlei?</span>
                      <select value={practiced} onChange={(event) => setPracticed(event.target.value)} required>
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                      </select>
                    </label>
                  </div>
                  <button className="button button-confirm" type="submit" disabled={submitting}>
                    {submitting ? "Salvando..." : "Confirmar agendamento"}
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              )}
              {submitMessage && (
                <p className="booking-feedback" role="status">{submitMessage}</p>
              )}
            </form>
          </div>

          <aside className="info-card">
            <span className="info-icon" aria-hidden="true">⌖</span>
            <p>Você vai jogar aqui</p>
            <h3>Praia de Icaraí</h3>
            <address>
              No Mirante de Icaraí, ao lado da Estrada Leopoldo Fróes
            </address>
            <a href="#localizacao">Ver localização completa</a>
          </aside>
        </div>
      </section>

      <section className="experience-section" id="nossa-areia">
        <div className="shell">
          <div className="experience-heading">
            <div>
              <p className="kicker">A energia do Vai na Fita</p>
              <h2>É na areia que<br />a gente se encontra.</h2>
            </div>
            <p>
              Aulas, torneios e uma comunidade que recebe quem nunca jogou e
              desafia quem quer evoluir.
            </p>
          </div>
          <div className="photo-grid">
            <figure className="photo-card photo-card-tall">
              <Image src="/photos/jogo-na-areia.webp" alt="Atletas jogando futevôlei na Praia de Icaraí" fill sizes="(max-width: 700px) 100vw, 38vw" />
              <figcaption>Jogo de verdade, no seu ritmo.</figcaption>
            </figure>
            <figure className="photo-card">
              <Image src="/photos/campeoes.webp" alt="Campeões no torneio do CT Vai na Fita" fill sizes="(max-width: 700px) 100vw, 30vw" />
              <figcaption>Torneios que viram memória.</figcaption>
            </figure>
            <figure className="photo-card photo-card-students">
              <Image src="/photos/turma-torneio.webp" alt="Turma de alunos do CT Vai na Fita reunida na areia" fill sizes="(max-width: 700px) 100vw, 30vw" />
              <figcaption>Uma comunidade dentro e fora da quadra.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="founders-section" id="fundadores">
        <div className="shell founders-layout">
          <div className="founders-photo">
            <Image
              src="/photos/fundadores.webp"
              alt="Daniel Tinoco e José Ricardo, Zé, fundadores do CT Vai na Fita"
              fill
              sizes="(max-width: 800px) 100vw, 44vw"
            />
            <span>Na areia com você</span>
          </div>
          <div className="founders-copy">
            <p className="kicker">Quem faz o CT acontecer</p>
            <h2>Daniel Tinoco<br />e José Ricardo (Zé)</h2>
            <p>
              À frente do Vai na Fita, Daniel e Zé transformaram a paixão pelo
              futevôlei em um espaço para aprender, evoluir e criar amizades.
              Aqui, cada aluno é recebido de perto — da primeira aula ao
              próximo desafio.
            </p>
            <a className="button button-dark" href="#agendar">
              Vem conhecer o CT <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="location-section" id="localizacao">
        <div className="shell location-layout">
          <div>
            <p className="kicker light">Localização oficial</p>
            <h2>De frente para o mar.<br />Perto de você.</h2>
            <p>
              No Mirante de Icaraí, próximo à Estrada Leopoldo Fróes, à Igreja
              São Judas Tadeu e ao CT Futevôlei Monique Gois.
            </p>
            <a className="button button-outline" href={mapsUrl} target="_blank" rel="noreferrer">
              Abrir rota no Google Maps
            </a>
          </div>
          <a
            className="map-link"
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Abrir a localização do CT Vai na Fita no Google Maps"
          >
            <Image
              src="/ct-assets/mapa-ct-vai-na-fita.png"
              alt="Mapa do CT Vai na Fita no Mirante de Icaraí, próximo à Estrada Leopoldo Fróes"
              width={767}
              height={642}
            />
            <span>Toque no mapa para abrir a rota ↗</span>
          </a>
        </div>
      </section>

      <a className="whatsapp-float" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Falar com o CT Vai na Fita no WhatsApp">
        <span>WhatsApp</span>
        <b>↗</b>
      </a>
    </main>
  );
}
