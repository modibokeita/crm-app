import React from "react";
import "./about.css";

function About() {
  return (
    <main className="content-dash about-page">
      {/* Section principale */}
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-eyebrow">À PROPOS DE NOUS</span>

          <h1>
            Bienvenue chez <span>CGTECH</span>
          </h1>

          <p className="about-hero-text">
            La technologie qui rapproche les personnes, simplifie
            les activités et crée des opportunités de croissance.
          </p>

          <p className="about-description">
            CGTECH est une initiative axée sur les technologies,
            qui s'engage à développer des solutions numériques pratiques
            permettant aux entreprises de mieux travailler, de gérer
            leurs activités et de renforcer leurs relations avec leurs clients.
          </p>

          <a href="#our-mission" className="about-hero-button">
            Découvrir notre vision <span>→</span>
          </a>
        </div>

        <div className="about-hero-visual" aria-hidden="true">
          <div className="about-orbit orbit-one"></div>
          <div className="about-orbit orbit-two"></div>

          <div className="about-tech-card">
            <div className="about-tech-logo">CG</div>
            <span className="about-tech-divider"></span>
            <div>
              <strong>CGTECH</strong>
              <p>Innovation · Technologie · Croissance</p>
            </div>
          </div>

          <div className="about-floating-card floating-top">
            <span className="about-floating-icon">✦</span>
            <div>
              <strong>Innovation</strong>
              <small>Des idées aux solutions</small>
            </div>
          </div>

          <div className="about-floating-card floating-bottom">
            <span className="about-floating-icon">↗</span>
            <div>
              <strong>Croissance</strong>
              <small>Construire pour progresser</small>
            </div>
          </div>
        </div>
      </section>

      {/* Présentation */}
      <section className="about-intro">
        <div className="about-section-heading">
          <span className="about-eyebrow">QUI SOMMES-NOUS ?</span>
          <h2>La technologie au service d'un objectif.</h2>
        </div>

        <p>
          Nous pensons que la technologie doit aller au-delà de
          l'automatisation des tâches. Elle doit aider les personnes
          à résoudre de véritables problèmes, à gagner du temps,
          à améliorer leurs décisions et à découvrir de meilleures
          façons de travailler. Grâce au développement de logiciels
          réfléchis et à l'apprentissage continu, CGTECH souhaite
          transformer les difficultés quotidiennes des entreprises
          en opportunités d'amélioration.
        </p>
      </section>

      {/* Mission, vision et valeurs */}
      <section className="about-values" id="our-mission">
        <article className="about-value-card">
          <div className="about-value-icon mission-icon">◎</div>
          <span className="about-card-label">NOTRE MISSION</span>
          <h3>Résoudre de vrais problèmes</h3>
          <p>
            Concevoir des solutions numériques utiles, accessibles
            et fiables pour aider les entreprises à organiser leur travail,
            à mieux servir leurs clients et à fonctionner plus efficacement.
          </p>
        </article>

        <article className="about-value-card">
          <div className="about-value-icon vision-icon">◈</div>
          <span className="about-card-label">NOTRE VISION</span>
          <h3>Construire un avenir plus intelligent</h3>
          <p>
            Contribuer à un avenir où les entreprises utilisent la
            technologie pour innover, se développer durablement et
            rester compétitives dans un monde de plus en plus numérique.
          </p>
        </article>

        <article className="about-value-card">
          <div className="about-value-icon values-icon">✳</div>
          <span className="about-card-label">NOS VALEURS</span>
          <h3>Progresser continuellement</h3>
          <p>
            Nous valorisons la créativité, l'intégrité, l'apprentissage
            continu, la qualité et la volonté de créer des solutions
            qui apportent une réelle valeur ajoutée.
          </p>
        </article>
      </section>

      {/* Notre solution CRM */}
      <section className="about-product">
        <div className="about-product-content">
          <span className="about-eyebrow">NOTRE SOLUTION</span>
          <h2>Une meilleure façon de gérer la relation client.</h2>

          <p>
            Notre application CRM est conçue pour aider les entreprises
            à centraliser les informations de leurs clients, à organiser
            les rendez-vous, à coordonner les activités commerciales et
            à gérer leurs relations clients depuis un espace de travail
            unique et pratique.
          </p>

          <ul className="about-feature-list">
            <li>
              <span>✓</span> Gestion centralisée des clients
            </li>
            <li>
              <span>✓</span> Planification et suivi des rendez-vous
            </li>
            <li>
              <span>✓</span> Organisation des ventes et des services
            </li>
            <li>
              <span>✓</span> Un espace de travail adapté aux équipes
            </li>
          </ul>
        </div>

        <div className="about-product-visual">
          <div className="about-product-window">
            <div className="about-window-header">
              <div className="about-window-dots">
                <i></i><i></i><i></i>
              </div>
              <span>CGTECH CRM</span>
            </div>

            <div className="about-window-body">
              <div className="about-window-sidebar">
                <div className="about-window-logo">CG</div>
                <span className="active"></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="about-window-main">
                <small>VUE D'ENSEMBLE</small>
                <h4>Votre entreprise, bien organisée.</h4>

                <div className="about-window-stats">
                  <div>
                    <span>Clients</span>
                    <strong>Gestion</strong>
                  </div>
                  <div>
                    <span>Rendez-vous</span>
                    <strong>Planification</strong>
                  </div>
                </div>

                <div className="about-window-chart">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>

          <p className="about-visual-caption">
            Un seul espace. Une meilleure organisation. Des relations renforcées.
          </p>
        </div>
      </section>

      {/* Le fondateur */}
      <section className="about-founder">
        <div className="about-founder-avatar">CG</div>

        <div className="about-founder-content">
          <span className="about-eyebrow">À L'ORIGINE DU PROJET</span>
          <h2>Animé par la curiosité. Guidé par la recherche de solutions.</h2>

          <p>
            Je suis passionné par les technologies et le développement
            de logiciels, avec un intérêt particulier pour la création
            de produits numériques qui facilitent le travail au quotidien.
            À travers CGTECH, je souhaite associer créativité,
            compétences techniques et esprit de résolution de problèmes
            afin de développer des solutions pratiques pour les entreprises
            et leurs clients.
          </p>

          <p>
            Mon approche est simple : apprendre continuellement,
            créer avec un objectif précis, écouter les utilisateurs
            et améliorer chaque jour les solutions proposées.
          </p>
        </div>
      </section>

      {/* Conclusion */}
      <section className="about-cta">
        <span className="about-eyebrow">L'AVENTURE CONTINUE</span>
        <h2>Construisons ensemble quelque chose d'utile.</h2>

        <p>
          Chaque grande solution commence par une idée et par la volonté
          de la rendre toujours meilleure.
        </p>

        <span className="about-cta-brand">
          CGTECH · Innover pour grandir
        </span>
      </section>

      <footer className="about-footer">
        <span>© {new Date().getFullYear()} CGTECH</span>
        <span>Conçu avec un objectif. Développé pour progresser.</span>
      </footer>
    </main>
  );
}

export default About;