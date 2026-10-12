
import React, { useState } from "react";
import "./FloatingContact.css";

const BUSINESS_WHATSAPP = "YOUR_WHATSAPP_NUMBER";
const BUSINESS_EMAIL = "YOUR_BUSINESS_EMAIL";

export default function FloatingContact() {
  const [chatOpen, setChatOpen] = useState(false);
  const [estimateOpen, setEstimateOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [estimate, setEstimate] = useState({
    name: "",
    phone: "",
    furniture: "",
    budget: "",
    details: "",
  });

  const whatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Hello ARVÉ Furniture, I would like to enquire about your furniture."
  )}`;

  const updateEstimate = (event) => {
    setEstimate({
      ...estimate,
      [event.target.name]: event.target.value,
    });
  };

  const sendChatMessage = () => {
    const message = chatMessage.trim();
    if (!message) return;

    window.open(
      `https://wa.me/${BUSINESS_WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const submitEstimate = (event) => {
    event.preventDefault();

    const subject = encodeURIComponent("Free Furniture Estimate Request");
    const body = encodeURIComponent(
      `Name: ${estimate.name}\nPhone: ${estimate.phone}\nFurniture: ${estimate.furniture}\nBudget: ${estimate.budget}\nDetails: ${estimate.details}`
    );

    window.location.href =
      `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="floating-contact">
      <div className="fc-contact-panel">
        <a
          className="fc-contact-item"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
        >
          <span className="fc-whatsapp-icon">☎</span>
          <span>Whatsapp</span>
        </a>

        <a
          className="fc-contact-item"
          href={`mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent("Furniture enquiry")}`}
        >
          <span className="fc-mail-icon">✉</span>
          <span>Send Mail</span>
        </a>
      </div>

      <button
        className="fc-estimate-button"
        onClick={() => setEstimateOpen(true)}
      >
        Free Estimate
      </button>

      <button
        className="fc-chat-launcher"
        onClick={() => setChatOpen(!chatOpen)}
        aria-label={chatOpen ? "Close chat" : "Open chat"}
      >
        {chatOpen ? "×" : "▣"}
      </button>

      {chatOpen && (
        <section className="fc-chat-window">
          <div className="fc-chat-header">
            <strong>ARVÉ Support</strong>
            <button onClick={() => setChatOpen(false)}>×</button>
          </div>

          <div className="fc-chat-body">
            <p className="fc-offline">We're offline</p>
            <p>Leave a message and contact us through WhatsApp.</p>
            <textarea
              value={chatMessage}
              onChange={(event) => setChatMessage(event.target.value)}
              placeholder="How can we help you?"
              rows={4}
            />
            <button
              className="fc-primary-button"
              onClick={sendChatMessage}
            >
              Send message
            </button>
          </div>
        </section>
      )}

      {estimateOpen && (
        <div
          className="fc-modal-backdrop"
          onClick={() => setEstimateOpen(false)}
        >
          <section
            className="fc-estimate-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fc-estimate-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="fc-modal-close"
              onClick={() => setEstimateOpen(false)}
              aria-label="Close estimate form"
            >
              ×
            </button>

            <p className="fc-eyebrow">PERSONALISED FOR YOUR HOME</p>
            <h2 id="fc-estimate-title">Get a Free Estimate</h2>
            <p>Tell us what you're looking for.</p>

            <form onSubmit={submitEstimate}>
              <input
                name="name"
                value={estimate.name}
                onChange={updateEstimate}
                placeholder="Full name"
                required
              />

              <input
                name="phone"
                type="tel"
                value={estimate.phone}
                onChange={updateEstimate}
                placeholder="Phone number"
                required
              />

              <select
                name="furniture"
                value={estimate.furniture}
                onChange={updateEstimate}
                required
              >
                <option value="">Choose furniture type</option>
                <option value="Sofa">Sofa</option>
                <option value="Bed">Bed</option>
                <option value="Dining table">Dining table</option>
                <option value="Wardrobe">Wardrobe</option>
                <option value="Complete home">Complete home</option>
                <option value="Other">Other</option>
              </select>

              <select
                name="budget"
                value={estimate.budget}
                onChange={updateEstimate}
                required
              >
                <option value="">Select your budget</option>
                <option value="Under ₹10,000">Under ₹10,000</option>
                <option value="₹10,000–₹30,000">₹10,000–₹30,000</option>
                <option value="₹30,000–₹75,000">₹30,000–₹75,000</option>
                <option value="Above ₹75,000">Above ₹75,000</option>
              </select>

              <textarea
                name="details"
                value={estimate.details}
                onChange={updateEstimate}
                placeholder="Size, style, quantity or other details"
                rows={3}
              />

              <button className="fc-primary-button" type="submit">
                Request Estimate →
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
