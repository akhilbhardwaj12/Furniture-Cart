import { useEffect, useState } from "react";
import "./Hero.css";

import heroFurniture from "../../assets/hero-furniture.jpg";
import homeImage from "../../assets/home_img.jpg";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2200&q=85",
    eyebrow: "TIMELESS DESIGN · THOUGHTFUL LIVING",
    title: <>Make room<br />for <em>beautiful</em><br />living.</>,
    description:
      "Discover furniture that brings warmth, character, and quiet luxury into every corner of your home.",
    note: "Designed for the way you live.",
    footer: "CRAFTED WITH CARE",
  },
  {
    image: heroFurniture,
    eyebrow: "SLOW DOWN · SETTLE IN",
    title: <>A softer place<br />to <em>land.</em></>,
    description:
      "Sink into considered comfort with statement seating made for your favourite everyday moments.",
    note: "Comfort, with character.",
    footer: "MADE FOR YOUR MOMENTS",
  },
  {
    image: homeImage,
    eyebrow: "A HOME THAT FEELS LIKE YOU",
    title: <>Find your<br /><em>kind</em> of calm.</>,
    description:
      "Bring natural textures and thoughtful silhouettes together to make a space truly your own.",
    note: "Thoughtfully chosen for home.",
    footer: "LIVE BEAUTIFULLY",
  },
];

const Hero = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return undefined;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [isPaused, prefersReducedMotion]);

  const showSlide = (index) => {
    setActiveSlide((index + slides.length) % slides.length);
  };

  const slide = slides[activeSlide];

  return (
    <section
      className="lux-hero"
      aria-label="Featured furniture"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      <div
        className="lux-hero-image"
        key={slide.image}
        style={{ backgroundImage: `url("${slide.image}")` }}
        role="img"
        aria-label={slide.eyebrow}
      />

      <div className="lux-hero-overlay" />

      <div className="lux-hero-content" key={`content-${activeSlide}`}>
        <span className="lux-hero-eyebrow">{slide.eyebrow}</span>

        <h1>{slide.title}</h1>

        <p>{slide.description}</p>

        <div className="lux-hero-actions">
          <a
            href="#collections"
            className="lux-hero-button"
            onClick={(event) => {
              event.preventDefault();
              if (window.location.hash !== "#collections") {
                window.history.pushState(null, "", "#collections");
              }
              document
                .getElementById("collections")
                .scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore Collection
            <span aria-hidden="true">↗</span>
          </a>

          <span className="lux-hero-note">{slide.note}</span>
        </div>
      </div>

      <div className="lux-hero-bottom">
        <span>{slide.footer}</span>
        <span className="lux-hero-bottom-line" />
        <span>MADE FOR EVERYDAY LIVING</span>
      </div>

      <div className="lux-hero-controls" aria-label="Slide controls">
        <button
          type="button"
          className="lux-hero-arrow"
          onClick={() => showSlide(activeSlide - 1)}
          aria-label="Previous slide"
        >
          <span aria-hidden="true">←</span>
        </button>

        <div className="lux-hero-dots" role="group" aria-label="Choose a slide">
          {slides.map((item, index) => (
            <button
              type="button"
              key={item.eyebrow}
              className={`lux-hero-dot ${index === activeSlide ? "is-active" : ""}`}
              onClick={() => showSlide(index)}
              aria-label={`Show slide ${index + 1}: ${item.eyebrow}`}
              aria-current={index === activeSlide ? "true" : undefined}
            />
          ))}
        </div>

        <span className="lux-hero-index" aria-live="polite" aria-atomic="true">
          <span>{String(activeSlide + 1).padStart(2, "0")}</span>
          <span className="lux-hero-index-divider">/</span>
          <span>{String(slides.length).padStart(2, "0")}</span>
        </span>

        <button
          type="button"
          className="lux-hero-arrow"
          onClick={() => showSlide(activeSlide + 1)}
          aria-label="Next slide"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
};

export default Hero;
