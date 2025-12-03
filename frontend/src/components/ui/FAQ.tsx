import React, { useState } from "react";

type Faq = {
  question: string;
  answer: string;
};

const FAQS: Faq[] = [
  {
    question: "What kind of events can I host?",
    answer:
      "Peers can support a wide range of competitive or collaborative events, such as hackathons, pitch competitions, talent shows, case competitions and more. For now, to get started, click “Get started” in the hero section to create an event.",
  },
  {
    question: "How does judge vs audience scoring work?",
    answer:
      "Events can be set up so that judges, the audience, or a combination of both contribute to the final score. Weighting decides how much each group counts in the final result. In this prototype, scoring is not fully configurable yet. To try the flow, click “Get started” in the hero section and create an event.",
  },
  {
    question: "What is a ranking template?",
    answer:
      "A ranking template is a predefined structure for how participants are evaluated, for example by criteria such as originality, impact and presentation. Templates make it easier to keep scoring consistent across events. For now, click “Get started” in the hero section to create an event and explore the basic setup.",
  },
];

export default function LandingFaqBot() {
  const [selectedFaq, setSelectedFaq] = useState<Faq | null>(null);

  return (
    <section
      aria-labelledby="faq-bot-title"
      className="faq-bot"
    >
      <div className="faq-bot__card">
        <header className="faq-bot__header">
          <h2 id="faq-bot-title" className="faq-bot__title">
            Need help getting started?
          </h2>
          <p className="faq-bot__subtitle">
            Ask a quick question or use the “Get started” button in the hero section to create your event.
          </p>
        </header>

        <div className="faq-bot__content">
          <div className="faq-bot__questions" aria-label="Common questions">
            {FAQS.map((faq) => (
              <button
                key={faq.question}
                type="button"
                className="faq-bot__question-btn"
                onClick={() => setSelectedFaq(faq)}
              >
                {faq.question}
              </button>
            ))}
          </div>

          <div className="faq-bot__chat-window" aria-live="polite">
            {!selectedFaq && (
              <div className="faq-bot__message faq-bot__message--system">
                <p>
                  Hi, I am the Peers FAQ helper. Pick one of the questions to see a quick explanation.
                  For now, to create an event, use the <strong>Get started</strong> button in the hero section.
                </p>
              </div>
            )}

            {selectedFaq && (
              <>
                <div className="faq-bot__message faq-bot__message--user">
                  <p>{selectedFaq.question}</p>
                </div>
                <div className="faq-bot__message faq-bot__message--bot">
                  <p>{selectedFaq.answer}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <footer className="faq-bot__footer">
          <span className="faq-bot__hint">
            Want to try the full flow? Click <strong>Get started</strong> in the hero section.
          </span>
        </footer>
      </div>
    </section>
  );
}


