import { LegalPage } from "@/components/legal/legal-page";
import { LegalSection } from "@/components/legal/legal-section";
import { getLegalSiteInfo } from "@/lib/legal/site-info";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata = buildPublicMetadata({
  title: "Politique de confidentialité",
  description:
    "Comment Stockino collecte, utilise et protège vos données personnelles (application, hub, analytics et liens affiliés).",
  path: "/confidentialite",
  keywords: ["confidentialité", "RGPD", "données personnelles", "Stockino"],
});

export default function ConfidentialitePage() {
  const info = getLegalSiteInfo();

  return (
    <LegalPage
      title="Politique de confidentialité"
      path="/confidentialite"
      description="Transparence sur les données que nous traitons et vos droits."
    >
      <LegalSection title="Responsable du traitement">
        <p>
          <strong>{info.publisherName}</strong> — site {info.siteUrl}. Pour toute question :{" "}
          <a href={`mailto:${info.contactEmail}`}>{info.contactEmail}</a>.
        </p>
      </LegalSection>

      <LegalSection title="Données que nous collectons">
        <ul>
          <li>
            <strong>Compte application Stockino</strong> : identité, e-mail, organisation, données
            de stock (produits, mouvements, ventes) nécessaires au service.
          </li>
          <li>
            <strong>Hub public</strong> : pas de compte requis pour consulter les guides ; le studio
            éditorial est protégé par mot de passe (accès interne).
          </li>
          <li>
            <strong>Mesure d&apos;audience</strong> : via Google Analytics 4 (pages vues, appareil,
            provenance approximative), si vous acceptez les cookies ou selon la configuration de
            votre navigateur.
          </li>
          <li>
            <strong>Liens Amazon</strong> : en cliquant vers Amazon.fr, vous quittez notre site ;
            Amazon traite ses propres données selon sa politique.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Finalités et bases légales">
        <ul>
          <li>Exécution du contrat / fourniture du service de gestion de stock (compte app).</li>
          <li>Intérêt légitime : sécurité, amélioration du site, statistiques agrégées (GA4).</li>
          <li>Consentement : cookies non essentiels lorsque requis par la réglementation.</li>
          <li>Obligations légales : conservation de certaines traces si la loi l&apos;impose.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Durée de conservation">
        <p>
          Les données de compte sont conservées tant que votre compte est actif, puis supprimées ou
          anonymisées dans un délai raisonnable après clôture, sauf obligation légale contraire. Les
          logs techniques et statistiques GA4 suivent les durées définies par Google (configurable
          dans votre compte Analytics).
        </p>
      </LegalSection>

      <LegalSection title="Sous-traitants">
        <ul>
          <li>
            <a href="https://supabase.com" rel="noopener noreferrer" target="_blank">
              Supabase
            </a>{" "}
            — base de données et authentification
          </li>
          <li>
            <a href="https://www.netlify.com" rel="noopener noreferrer" target="_blank">
              Netlify
            </a>{" "}
            — hébergement du site
          </li>
          <li>
            <a href="https://analytics.google.com" rel="noopener noreferrer" target="_blank">
              Google Analytics
            </a>{" "}
            — mesure d&apos;audience
          </li>
          <li>
            <a href="https://www.google.com/adsense/" rel="noopener noreferrer" target="_blank">
              Google AdSense
            </a>{" "}
            — affichage de publicités sur le hub public (le cas échéant)
          </li>
        </ul>
        <p>
          Ces prestataires peuvent traiter des données hors Union européenne ; ils s&apos;engagent
          via leurs conditions (clauses contractuelles types, etc.) lorsque applicable.
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          Nous utilisons des cookies strictement nécessaires au fonctionnement (session
          application, studio). Google Analytics et Google AdSense peuvent déposer des cookies de
          mesure ou de publicité. Vous pouvez les refuser ou les supprimer via les paramètres de
          votre navigateur ; certaines fonctionnalités d&apos;analyse ou d&apos;affichage ne seront
          alors plus disponibles.
        </p>
      </LegalSection>

      <LegalSection title="Vos droits (RGPD)">
        <p>
          Vous disposez des droits d&apos;accès, de rectification, d&apos;effacement, de limitation,
          d&apos;opposition et de portabilité lorsque applicable. Pour les exercer :{" "}
          <a href={`mailto:${info.contactEmail}`}>{info.contactEmail}</a>. Vous pouvez introduire
          une réclamation auprès de la CNIL (
          <a href="https://www.cnil.fr" rel="noopener noreferrer" target="_blank">
            www.cnil.fr
          </a>
          ) ou de l&apos;autorité de votre pays.
        </p>
      </LegalSection>

      <LegalSection title="Sécurité">
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles adaptées (HTTPS,
          authentification, accès restreints). Aucun système n&apos;est toutefois exempt de risque.
        </p>
        <p className="text-xs">
          Dernière mise à jour : mai 2026. Voir aussi les{" "}
          <a href="/mentions-legales">mentions légales</a> et la page{" "}
          <a href="/contact">contact</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
