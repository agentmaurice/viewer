export interface ChecklistItem {
  domaine: string
  item: string
  criticite: string
  commentaire: string
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  { domaine: "Contractuel & Financier", item: "Offre valable 1 mois mentionn\u00e9e", criticite: "Bloquant", commentaire: "" },
  { domaine: "Contractuel & Financier", item: "Disclaimer confidentialit\u00e9 pr\u00e9sent", criticite: "Bloquant", commentaire: "" },
  { domaine: "Contractuel & Financier", item: "6 slides de Conditions G\u00e9n\u00e9rales de Services int\u00e9gr\u00e9es", criticite: "Bloquant", commentaire: "" },
  { domaine: "Contractuel & Financier", item: "NDA sign\u00e9 ou r\u00e9f\u00e9renc\u00e9 dans la propale", criticite: "Bloquant", commentaire: "" },
  { domaine: "Contractuel & Financier", item: "\u00c9ch\u00e9ancier de paiement pr\u00e9sent et adapt\u00e9", criticite: "Bloquant", commentaire: "Projet < 50k\u20ac: 100% \u00e0 la commande. Forfaitaire: 30/30/30/10%" },
  { domaine: "Contractuel & Financier", item: "Budget total coh\u00e9rent avec P&L", criticite: "Bloquant", commentaire: "" },
  { domaine: "Contractuel & Financier", item: "Dur\u00e9e de garantie pr\u00e9cis\u00e9e", criticite: "Bloquant", commentaire: "1 mois par d\u00e9faut" },
  { domaine: "Contractuel & Financier", item: "Frais annexes identifi\u00e9s et chiffr\u00e9s", criticite: "Majeur", commentaire: "" },
  { domaine: "Contractuel & Financier", item: "Co\u00fbts de licences tierces r\u00e9percut\u00e9s ou inclus", criticite: "Bloquant", commentaire: "" },
  { domaine: "Contractuel & Financier", item: "TVA et conditions de paiement", criticite: "Majeur", commentaire: "" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "Backlog de r\u00e9f\u00e9rence identifi\u00e9 et nomm\u00e9", criticite: "Bloquant", commentaire: "" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "Liste des EPIC/Features align\u00e9e avec le chiffrage AVV", criticite: "Bloquant", commentaire: "" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "Liste des livrables documentaires d\u00e9finie", criticite: "Bloquant", commentaire: "" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "Nombre d'\u00e9crans et leur complexit\u00e9 list\u00e9s", criticite: "Majeur", commentaire: "" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "\u00c9limination de toute formulation floue ou ambigu\u00eb", criticite: "Bloquant", commentaire: "" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "Section \"Hors p\u00e9rim\u00e8tre\" pr\u00e9sente et d\u00e9taill\u00e9e", criticite: "Bloquant", commentaire: "" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "Reprise de contenus/migration de donn\u00e9es", criticite: "Majeur", commentaire: "" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "Compatibilit\u00e9 RGAA : niveau pr\u00e9cis\u00e9", criticite: "Majeur", commentaire: "" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "Navigateurs Web support\u00e9s document\u00e9s", criticite: "Bloquant", commentaire: "" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "OS mobiles support\u00e9s document\u00e9s", criticite: "Bloquant", commentaire: "" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "Responsable des sc\u00e9narios et donn\u00e9es de tests d\u00e9fini", criticite: "Bloquant", commentaire: "" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "Clause API pr\u00e9sente (si utilisation API client)", criticite: "Majeur", commentaire: "API recett\u00e9es, op\u00e9rationnelles, stables, versionn\u00e9es" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "Toutes hypoth\u00e8ses du chiffrage dans la propale client", criticite: "Bloquant", commentaire: "" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "Pr\u00e9-requis client d\u00e9taill\u00e9s", criticite: "Bloquant", commentaire: "" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "D\u00e9pendances externes identifi\u00e9es", criticite: "Majeur", commentaire: "" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "P\u00e9rim\u00e8tre V1/MVP clairement d\u00e9fini", criticite: "Bloquant", commentaire: "What's in / What's out pour le MVP" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "Strat\u00e9gie de contenu d\u00e9finie (si CMS)", criticite: "Majeur", commentaire: "Qui cr\u00e9e ? Qui valide ?" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "Volum\u00e9trie de donn\u00e9es estim\u00e9e si pertinent", criticite: "Majeur", commentaire: "Nombre users, transactions, data storage" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "P\u00e9rim\u00e8tre d'internationalisation pr\u00e9cis\u00e9", criticite: "Majeur", commentaire: "Langues, devises, fuseaux horaires, formats" },
  { domaine: "P\u00e9rim\u00e8tre et Hypoth\u00e8ses", item: "Strat\u00e9gie SEO/SEA incluse ou exclue", criticite: "Majeur", commentaire: "Si e-commerce : critique pour le business" },
  { domaine: "Architecture technique", item: "Technologies choisies ma\u00eetris\u00e9es par Niji", criticite: "Bloquant", commentaire: "" },
  { domaine: "Architecture technique", item: "Architecture document\u00e9e et valid\u00e9e", criticite: "Bloquant", commentaire: "" },
  { domaine: "Architecture technique", item: "Fonction pr\u00e9cise de chaque brique technique", criticite: "Majeur", commentaire: "" },
  { domaine: "Architecture technique", item: "Choix technologiques justifi\u00e9s vs alternatives", criticite: "Majeur", commentaire: "" },
  { domaine: "Architecture technique", item: "Environnements d\u00e9finis (dev, recette, prod)", criticite: "Mineur", commentaire: "" },
  { domaine: "Planning & Ressources", item: "Charge Chef de Projet conforme", criticite: "Bloquant", commentaire: "" },
  { domaine: "Planning & Ressources", item: "Charge BA conforme", criticite: "Bloquant", commentaire: "Si projet m\u00e9tier: temps plein d\u00e8s S0. Sinon: mi-temps minimum" },
  { domaine: "Planning & Ressources", item: "Disponibilit\u00e9 des ressources confirm\u00e9e", criticite: "Bloquant", commentaire: "" },
  { domaine: "Planning & Ressources", item: "Profils seniors vs juniors coh\u00e9rents avec TJM", criticite: "Majeur", commentaire: "" },
  { domaine: "Planning & Ressources", item: "Planning d\u00e9taill\u00e9 par sprint/phase", criticite: "Majeur", commentaire: "" },
  { domaine: "Planning & Ressources", item: "Dur\u00e9e des sprints d\u00e9finie", criticite: "Majeur", commentaire: "" },
  { domaine: "Planning & Ressources", item: "P\u00e9riodes de cong\u00e9s/jours f\u00e9ri\u00e9s int\u00e9gr\u00e9es", criticite: "Majeur", commentaire: "" },
  { domaine: "Planning & Ressources", item: "Plan de mont\u00e9e en comp\u00e9tence (si nouvelles technos)", criticite: "Majeur", commentaire: "" },
  { domaine: "Planning & Ressources", item: "Chemin critique du projet identifi\u00e9", criticite: "Majeur", commentaire: "D\u00e9pendances bloquantes, jalons critiques" },
  { domaine: "Qualit\u00e9 & Tests", item: "Strat\u00e9gie de tests document\u00e9e", criticite: "Majeur", commentaire: "Charge de r\u00e9daction chiffr\u00e9e" },
  { domaine: "Qualit\u00e9 & Tests", item: "Charge tests ajust\u00e9e selon complexit\u00e9", criticite: "Majeur", commentaire: "E-commerce/m\u00e9tier complexe: 1 \u00e0 1,5 ETP full time" },
  { domaine: "Qualit\u00e9 & Tests", item: "Tests de performance : p\u00e9rim\u00e8tre et budget", criticite: "Majeur", commentaire: "Charge, volum\u00e9trie, temps de r\u00e9ponse" },
  { domaine: "Qualit\u00e9 & Tests", item: "Tests d'endurance/robustesse : p\u00e9rim\u00e8tre et budget", criticite: "Majeur", commentaire: "" },
  { domaine: "Qualit\u00e9 & Tests", item: "Tests de s\u00e9curit\u00e9 : p\u00e9rim\u00e8tre et budget", criticite: "Majeur", commentaire: "Pentest, OWASP, audit" },
  { domaine: "Qualit\u00e9 & Tests", item: "Accessibilit\u00e9 : niveau RGAA/WCAG pr\u00e9cis\u00e9", criticite: "Majeur", commentaire: "Si > basique: ratio sur PRGTU" },
  { domaine: "Qualit\u00e9 & Tests", item: "Accessibilit\u00e9 : audit inclus ou non", criticite: "Majeur", commentaire: "Si inclus: chiffr\u00e9 avec corrections anomalies" },
  { domaine: "Risques", item: "Matrice des risques projet identifi\u00e9e", criticite: "Majeur", commentaire: "Top 5-10 des risques" },
  { domaine: "Risques", item: "Plan de mitigation pour chaque risque majeur", criticite: "Majeur", commentaire: "Actions correctives / pr\u00e9ventives" },
  { domaine: "Risques", item: "Risques li\u00e9s aux d\u00e9pendances externes", criticite: "Majeur", commentaire: "APIs tierces, autres projets" },
  { domaine: "Risques", item: "Risques technologiques \u00e9valu\u00e9s", criticite: "Majeur", commentaire: "Obsolescence, compatibilit\u00e9" },
]

export function formatChecklistForSubmission(items: ChecklistItem[]): string {
  return items
    .map((it) => {
      let line = `[${it.criticite}] ${it.domaine} > ${it.item}`
      if (it.commentaire) line += ` | Note: ${it.commentaire}`
      return line
    })
    .join('\n')
}

export function getDomaineStats(items: ChecklistItem[]) {
  const domains = new Map<string, { total: number; bloquant: number; majeur: number; mineur: number }>()
  for (const it of items) {
    const entry = domains.get(it.domaine) ?? { total: 0, bloquant: 0, majeur: 0, mineur: 0 }
    entry.total++
    if (it.criticite === 'Bloquant') entry.bloquant++
    else if (it.criticite === 'Majeur') entry.majeur++
    else entry.mineur++
    domains.set(it.domaine, entry)
  }
  return domains
}
