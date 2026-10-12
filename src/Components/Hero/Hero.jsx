
import React from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

const Hero = () => {
  return (
    <section className="lux-hero">
      <div className="lux-hero-image" />

      <div className="lux-hero-overlay" />

      <div className="lux-hero-content">
        <span className="lux-hero-eyebrow">
          TIMELESS DESIGN · THOUGHTFUL LIVING
        </span>

        <h1>
          Make room
          <br />
          for <em>beautiful</em>
          <br />
          living.
        </h1>

        <p>
          Discover furniture that brings warmth, character,
          and quiet luxury into every corner of your home.
        </p>

        <div className="lux-hero-actions">
          <Link to="/#collections" className="lux-hero-button">
            Explore Collection
            <span aria-hidden="true">↗</span>
          </Link>

          <span className="lux-hero-note">
            Designed for the way you live.
          </span>
        </div>
      </div>

      <div className="lux-hero-bottom">
        <span>CRAFTED WITH CARE</span>
        <span className="lux-hero-bottom-line" />
        <span>MADE FOR EVERYDAY LIVING</span>
      </div>

      <div className="lux-hero-index">
        <span>01</span>
        <span className="lux-hero-index-divider">/</span>
        <span>01</span>
      </div>
    </section>
  );
};

export default Hero;
