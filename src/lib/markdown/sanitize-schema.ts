import { defaultSchema } from "rehype-sanitize";

function withClass(...tags: string[]) {
  return Object.fromEntries(
    tags.map((tag) => [
      tag,
      [...(defaultSchema.attributes?.[tag] ?? []), "class"],
    ]),
  );
}

/** Schéma HTML autorisé dans les articles (alignement, images inline). */
export const articleSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    ...withClass("p", "div", "h1", "h2", "h3", "h4", "blockquote", "img", "span"),
    img: [...(defaultSchema.attributes?.img ?? []), "class", "loading", "decoding"],
    a: [...(defaultSchema.attributes?.a ?? []), "class"],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "img",
  ],
  clobber: defaultSchema.clobber,
  clobberPrefix: defaultSchema.clobberPrefix,
  ancestors: defaultSchema.ancestors,
  protocols: defaultSchema.protocols,
  strip: defaultSchema.strip,
};
