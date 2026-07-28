"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

const schedule = [
  { day: "Hoje", date: "28 JUL", times: ["17:00", "18:00", "19:00", "20:00"] },
  { day: "Quarta", date: "29 JUL", times: ["06:00", "07:00", "08:00", "17:00", "18:00", "19:00", "20:00"] },
  { day: "Quinta", date: "30 JUL", times: ["06:00", "07:00", "08:00", "17:00", "18:00", "19:00", "20:00"] },
];

const whatsappUrl =
  "https://wa.me/5521971194446?text=Oi%2C%20vim%20pelo%20site%20do%20CT%20Vai%20na%20Fita%20e%20quero%20saber%20mais%20sobre%20a%20aula%20experimental.";

const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Mirante+de+Icara%C3%AD%2C+Estrada+Leopoldo+Fr%C3%B3es%2C+Niter%C3%B3i";

export default function Home() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState("18:00");

  const selected = useMemo(
    () => schedule[selectedDay],
    [selectedDay],
  );

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

            <div className="date-tabs" role="tablist" aria-label="Escolha uma data">
              {schedule.map((item, index) => (
                <button
                  className={selectedDay === index ? "date-tab active" : "date-tab"}
                  key={item.date}
                  onClick={() => {
                    setSelectedDay(index);
                    setSelectedTime(item.times[0]);
                  }}
                  role="tab"
                  aria-selected={selectedDay === index}
                >
                  <span>{item.day}</span>
                  <strong>{item.date}</strong>
                </button>
              ))}
            </div>

            <p className="time-label">Horários disponíveis</p>
            <div className="time-grid">
              {selected.times.map((time) => (
                <button
                  className={selectedTime === time ? "time active" : "time"}
                  key={time}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>

            <button className="button button-confirm" type="button">
              Continuar com {selected.day.toLowerCase()}, {selectedTime}
              <span aria-hidden="true">→</span>
            </button>
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
