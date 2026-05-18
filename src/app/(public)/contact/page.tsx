import Link from "next/link";

import { LegalPage } from "@/components/legal/legal-page";
import { LegalSection } from "@/components/legal/legal-section";
import { getLegalSiteInfo } from "@/lib/legal/site-info";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata = buildPublicMetadata({
  title: "Contact",
  description:
    "Contactez l'équipe Stockino pour toute question sur l'application de gestion de stock ou le hub matériel.",
  path: "/contact",
  keywords: ["contact Stockino", "support", "gestion de stock"],
});

export default function ContactPage() {
  const info = getLegalSiteInfo();

  return (
    <LegalPage
      title="Contact"
      path="/contact"
      description="Une question sur Stockino, le hub matériel ou votre compte ? Écrivez-nous."
    >
      <LegalSection title="À propos de Stockino">
        <p>
          <strong>{info.siteName}</strong> est une application de gestion de stock pour
          professionnels (PME, commerce, logistique légère), complétée par un{" "}
          <Link href="/hardware">hub matériel</Link> et des{" "}
          <Link href="/blog">guides</Link> pour choisir scanners et équipements compatibles.
        </p>
        <p>
          Nous servons principalement la francophonie (France, Maroc, Belgique, Suisse, etc.) avec
          des contenus et recommandations adaptés au marché local.
        </p>
      </LegalSection>

      <LegalSection title="Nous écrire">
        <p>
          Pour toute demande (support application, partenariat, correction d&apos;un article,
          exercice de vos droits sur vos données) :
        </p>
        <p>
          <a
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground no-underline hover:opacity-90"
            href={`mailto:${info.contactEmail}?subject=Contact%20Stockino`}
          >
            {info.contactEmail}
          </a>
        </p>
        <p className="text-sm">
          Nous répondons en général sous <strong>2 à 5 jours ouvrés</strong>.
        </p>
      </LegalSection>

      <LegalSection title="Compte application">
        <p>
          Les utilisateurs connectés peuvent aussi contacter l&apos;administrateur de leur
          organisation depuis les{" "}
          <Link href="/settings">paramètres</Link> de l&apos;application, selon les droits
          configurés.
        </p>
      </LegalSection>

      <LegalSection title="Informations légales">
        <ul>
          <li>
            <Link href="/mentions-legales">Mentions légales</Link>
          </li>
          <li>
            <Link href="/confidentialite">Politique de confidentialité</Link>
          </li>
        </ul>
      </LegalSection>
    </LegalPage>
  );
}
