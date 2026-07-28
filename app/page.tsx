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

const whatsappUrl =
  "https://wa.me/5521971194446?text=Oi%2C%20vim%20pelo%20site%20do%20CT%20Vai%20na%20Fita%20e%20quero%20saber%20mais%20sobre%20a%20aula%20experimental.";

const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Mirante+de+Icara%C3%AD%2C+Estrada+Leopoldo+Fr%C3%B3es%2C+Niter%C3%B3i";

export default function Home() {
  const today = useMemo(() => new Date(), []);
  const minDate = useMemo(() => toInputDate(today), [today]);
  const maxDate = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() + 90);
    return toInputDate(date);
  }, [today]);
  const [selectedDate, setSelectedDate] = useState(minDate);
  const [selectedTime, setSelectedTime] = useState("18:00");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [practiced, setPracticed] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

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

      setSubmitMessage("Aula agendada! Seus dados foram enviados para o CT.");
      setName("");
      setPhone("");
      setAge("");
      setPracticed("");
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
            <span className="brand-ball">VF</span>
            <span>
              <strong>CT VAI NA FITA</strong>
              <small>FUTEVÔLEI • ICARAÍ</small>
            </span>
          </a>
          <a className="nav-link" href="#localizacao">Onde estamos</a>
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

          <div className="hero-visual" aria-label="Quadra de futevôlei do CT Vai na Fita">
            <div className="sun" />
            <div className="net">
              {Array.from({ length: 9 }).map((_, index) => (
                <i key={index} />
              ))}
            </div>
            <div className="floating-card">
              <span className="pulse" />
              <p>Próxima turma</p>
              <strong>Hoje, 18h</strong>
              <small>Praia de Icaraí</small>
            </div>
            <div className="ball-mark">VF</div>
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
              <label className="calendar-field">
                <span>Escolha a data</span>
                <input
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  required
                />
                <small>{formatDate(selectedDate)} • até 4 vagas por horário</small>
              </label>

              <p className="time-label">Horários disponíveis</p>
              <div className="time-grid">
                {times.map((time) => (
                  <button
                    className={selectedTime === time ? "time active" : "time"}
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    type="button"
                  >
                    {time}
                  </button>
                ))}
              </div>

              <div className="student-fields">
                <label>
                  <span>Nome</span>
                  <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome completo" required />
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
                {submitting ? "Salvando..." : "Agendar aula"}
                <span aria-hidden="true">→</span>
              </button>
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
