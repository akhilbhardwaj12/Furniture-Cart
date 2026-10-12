
import React from "react";
import "./Category.css";

const categoryItems = [
  {
    name: "Chair",
    subtitle: "Comfort meets character",
    image:
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Table",
    subtitle: "Gather beautifully",
    image:
      "https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Bed",
    subtitle: "Your everyday retreat",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Cabinet",
    subtitle: "A place for everything",
    image:
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Lightning",
    subtitle: "Set the right mood",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=85",
  },
];

const Category = ({ category, setCategory }) => {
  return (
    <section className="lux-categories" id="collections">
      <div className="lux-category-heading">
        <div>
          <span className="lux-category-eyebrow">FIND YOUR STYLE</span>
          <h2>Shop by category</h2>
          <p>
            Thoughtful pieces to make every corner feel like home.
          </p>
        </div>

        <button
          className={`lux-all-category ${
            category === "All" ? "selected" : ""
          }`}
          onClick={() => setCategory("All")}
          type="button"
        >
          View all products <span aria-hidden="true">↗</span>
        </button>
      </div>

      <div className="lux-category-grid">
        {categoryItems.map((item, index) => (
          <button
            type="button"
            key={item.name}
            className={`lux-category-card ${
              category === item.name ? "is-selected" : ""
            }`}
            onClick={() => setCategory(item.name)}
            aria-pressed={category === item.name}
          >
            <img
              src={item.image}
              alt={`${item.name} furniture`}
              loading="lazy"
            />

            <span className="lux-category-shade" />

            <span className="lux-category-number">
              0{index + 1}
            </span>

            <span className="lux-category-info">
              <span className="lux-category-name">{item.name}</span>
              <span className="lux-category-subtitle">
                {item.subtitle}
              </span>
            </span>

            <span className="lux-category-arrow" aria-hidden="true">
              ↗
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default Category;
