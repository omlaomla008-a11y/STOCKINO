import { LegalPage } from "@/components/legal/legal-page";
import { LegalSection } from "@/components/legal/legal-section";
import { getLegalSiteInfo } from "@/lib/legal/site-info";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata = buildPublicMetadata({
  title: "Mentions légales",
  description:
    "Informations légales sur l'éditeur du site Stockino.space, l'hébergement et les conditions d'utilisation du hub et de l'application.",
  path: "/mentions-legales",
  keywords: ["mentions légales", "Stockino", "éditeur du site"],
});

export default function MentionsLegalesPage() {
  const info = getLegalSiteInfo();

  return (
    <LegalPage
      title="Mentions légales"
      path="/mentions-legales"
      description="Informations relatives à l'éditeur du site et aux conditions d'utilisation."
    >
      <LegalSection title="Éditeur du site">
        <p>
          Le site <strong>{info.siteUrl}</strong> est édité par{" "}
          <strong>{info.publisherName}</strong>
          {info.legalForm ? ` (${info.legalForm})` : ""}.
        </p>
        {info.address ? <p>Adresse : {info.address}</p> : null}
        {info.siret ? <p>SIRET : {info.siret}</p> : null}
        <p>
          Contact :{" "}
          <a href={`mailto:${info.contactEmail}`}>{info.contactEmail}</a>
        </p>
      </LegalSection>

      <LegalSection title="Directeur de la publication">
        <p>{info.publisherName}</p>
      </LegalSection>

      <LegalSection title="Hébergement">
        <p>
          Le site est hébergé par {info.hostingProvider}. Site de l&apos;hébergeur :{" "}
          <a href={info.hostingSite} rel="noopener noreferrer" target="_blank">
            {info.hostingSite}
          </a>
          .
        </p>
        <p>
          Les données de l&apos;application (comptes, stocks) sont hébergées via{" "}
          <a href="https://supabase.com" rel="noopener noreferrer" target="_blank">
            Supabase
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Propriété intellectuelle">
        <p>
          L&apos;ensemble des éléments du site (textes, visuels, logo, structure) est protégé par le
          droit de la propriété intellectuelle. Toute reproduction non autorisée est interdite.
        </p>
        <p>
          Les marques citées sur le hub matériel (ex. Zebra) appartiennent à leurs propriétaires
          respectifs. Stockino n&apos;est pas affilié à ces marques, sauf mention contraire.
        </p>
      </LegalSection>

      <LegalSection title="Programme Partenaires Amazon">
        <p>
          {info.siteName} participe au programme Partenaires Amazon EU. Certains liens vers{" "}
          <a href="https://www.amazon.fr" rel="noopener noreferrer sponsored" target="_blank">
            Amazon.fr
          </a>{" "}
          sont des liens affiliés : nous pouvons percevoir une commission sur les achats
          éligibles, sans surcoût pour vous. Les prix et disponibilités sont ceux d&apos;Amazon au
          moment de la consultation.
        </p>
      </LegalSection>

      <LegalSection title="Limitation de responsabilité">
        <p>
          Les guides et recommandations matériel publiés sur le hub sont fournis à titre
          informatif. {info.siteName} s&apos;efforce d&apos;assurer l&apos;exactitude des
          informations mais ne garantit pas l&apos;absence d&apos;erreurs. L&apos;utilisation de
          l&apos;application de gestion de stock et des conseils du site relève de votre
          responsabilité professionnelle.
        </p>
      </LegalSection>

      <LegalSection title="Droit applicable">
        <p>
          Les présentes mentions sont régies par le droit français. En cas de litige, et à défaut
          d&apos;accord amiable, les tribunaux compétents seront ceux du ressort du siège de
          l&apos;éditeur, sous réserve des dispositions impératives applicables aux consommateurs
          dans leur pays de résidence.
        </p>
        <p className="text-xs">
          Dernière mise à jour : mai 2026. Consultez aussi notre{" "}
          <a href="/confidentialite">politique de confidentialité</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
