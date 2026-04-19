import fs from "node:fs";

const p = new URL("../web/css/style.css", import.meta.url);
let c = fs.readFileSync(p, "utf8");
const cut = c.indexOf(".team-grid");
const keep = c.slice(0, cut);
const restStart = c.indexOf(".social");
const rest = c.slice(restStart);

const add = `
.nav__burger {
  display: none;
  width: 44px;
  height: 44px;
  margin-left: auto;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}
.nav__burger-line {
  display: block;
  width: 18px;
  height: 2px;
  border-radius: 2px;
  background: rgba(244, 241, 234, 0.9);
  transition: transform 0.3s var(--ease), opacity 0.3s var(--ease);
}
.nav--open .nav__burger-line:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.nav--open .nav__burger-line:nth-child(2) {
  opacity: 0;
}
.nav--open .nav__burger-line:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}
.nav__drawer {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 18px;
  flex: 1;
  justify-content: flex-end;
}
.nav__links {
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  align-items: center;
}
.team-carousel {
  max-width: var(--max);
  margin: 0 auto;
  padding: 0 4px;
}
.team-carousel__stage {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
}
.team-carousel__arrow {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.2s, border-color 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.team-carousel__arrow:hover {
  background: rgba(232, 184, 74, 0.12);
  border-color: rgba(232, 184, 74, 0.35);
}
.team-carousel__card {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 18px;
  align-items: start;
  padding: 18px 16px;
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 17, 23, 0.65);
  box-shadow: var(--shadow);
  min-height: 140px;
  touch-action: pan-y;
}
.team-carousel__headWrap {
  width: 120px;
  height: 120px;
  border-radius: 14px;
  overflow: hidden;
  border: 2px solid rgba(232, 184, 74, 0.35);
  background: #1a1d26;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}
.team-carousel__head {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
}
.team-carousel__name {
  margin: 0 0 6px;
  font-size: 22px;
  color: var(--text);
  font-family: Outfit, sans-serif;
}
.team-carousel__role {
  margin: 0 0 10px;
  color: rgba(232, 184, 74, 0.95);
  font-weight: 800;
  font-size: 13px;
}
.team-carousel__bio {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--muted);
}
.team-carousel__thumbs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 16px;
  padding: 4px 0;
}
.team-carousel__thumb {
  width: 52px;
  height: 52px;
  padding: 0;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.25);
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s, transform 0.2s;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}
.team-carousel__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
  display: block;
}
.team-carousel__thumb.is-active {
  border-color: rgba(232, 184, 74, 0.85);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(232, 184, 74, 0.2);
}
.team-carousel__dots {
  display: none;
  gap: 8px;
  justify-content: center;
  margin-top: 12px;
}
.team-carousel__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 0;
  padding: 0;
  background: rgba(255, 255, 255, 0.25);
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
}
.team-carousel__dot.is-active {
  background: var(--gold);
  transform: scale(1.15);
}
@media (max-width: 560px) {
  .team-carousel__stage {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .team-carousel__arrow {
    display: none;
  }
  .team-carousel__card {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }
  .team-carousel__headWrap {
    width: 100px;
    height: 100px;
  }
  .team-carousel__thumbs {
    flex-wrap: nowrap;
    overflow-x: auto;
    justify-content: flex-start;
    padding-bottom: 6px;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
  }
  .team-carousel__thumb {
    scroll-snap-align: center;
  }
  .team-carousel__dots {
    display: flex;
  }
}
`;

fs.writeFileSync(p, keep + add + rest);
console.log("patched", p.pathname);

