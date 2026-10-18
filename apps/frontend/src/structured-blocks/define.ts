export type StructuredBlockAttributeType = "array" | "boolean" | "number" | "object" | "string";

export type StructuredBlockFieldKind =
  | "boolean"
  | "json"
  | "media"
  | "number"
  | "select"
  | "text"
  | "textarea"
  | "url";

export type StructuredBlockAttributeOptions = {
  enum?: readonly string[];
  legacyReads?: readonly string[];
  ui?: {
    kind: StructuredBlockFieldKind;
  };
};

export type StructuredBlockArrayItemSchema = {
  type: "object";
  properties: Record<string, StructuredBlockAttributeSchema>;
  required?: readonly string[];
};

export type StructuredBlockAttributeSchema = StructuredBlockAttributeOptions & {
  type: StructuredBlockAttributeType;
  default?: unknown;
  items?: StructuredBlockArrayItemSchema | StructuredBlockAttributeSchema;
  /**
   * Declared keys of an object attribute. With `additionalProperties: false`
   * any other key is a contract violation, the same as an undeclared row field.
   */
  properties?: Readonly<Record<string, StructuredBlockAttributeSchema>>;
  additionalProperties?: false;
};

export type StructuredBlockRegistration = {
  identity: {
    blockName: `getquick/${string}`;
    catalogId: string;
    schemaVersion: number;
    order: number;
    componentVersion?: string;
  };
  lifecycle: {
    status: "active" | "legacy";
    inserter: boolean;
  };
  /**
   * The block nests other Gutenberg blocks: the editor renders `InnerBlocks`,
   * `save()` serializes the children into post content, and the Astro renderer
   * receives them as slot content from `WpCustomBlock.astro`.
   */
  container?: boolean;
  attributes: Record<string, StructuredBlockAttributeSchema>;
  compatibility?: {
    legacyReads: Record<string, StructuredBlockAttributeType>;
    /**
     * Link key names the renderer still reads that no `ui.kind: "url"`
     * attribute declares — a legacy `ctaUrl`, or `href` inside an untyped `cta`
     * object. `WpCustomBlock.astro` filters their values through `safeHref`
     * alongside the declared URL attributes, at any depth.
     */
    legacyLinks?: readonly string[];
  };
  renderer: {
    module: `${string}.astro`;
    preview: {
      label: string;
      attributes: Record<string, unknown>;
    };
  };
  editor: {
    title: string;
    description: string;
    icon: string;
    /**
     * Extra inserter search terms. The titles are Portuguese, so this is where
     * an English or abbreviated name an editor might type instead belongs.
     */
    keywords?: readonly string[];
    experience: "preview" | "inline-fields";
    /**
     * The block has a hand-written editor, `blocks/<catalogId>/index.js` in
     * nomia-blocks. Every other block's script is generated and registers the
     * generic contract editor.
     */
    bespoke?: true;
  };
  documentation: {
    path: `${string}.md`;
  };
};

export function defineStructuredBlock<const T extends StructuredBlockRegistration>(
  registration: T,
): T {
  return registration;
}

export type StructuredBlockArrayOptions = StructuredBlockAttributeOptions & {
  defaultValue?: unknown[];
  required?: readonly string[];
};

export function arrayAttribute(
  properties: Record<string, StructuredBlockAttributeSchema> | unknown[] = {},
  options: StructuredBlockArrayOptions = {},
): StructuredBlockAttributeSchema {
  const { defaultValue, required, ...attributeOptions } = options;
  const rowProperties = Array.isArray(properties) ? {} : properties;
  const fallbackDefault = Array.isArray(properties) ? properties : [];
  return {
    type: "array",
    default: defaultValue ?? fallbackDefault,
    ...attributeOptions,
    items: {
      type: "object",
      properties: rowProperties,
      ...(required ? { required } : {}),
    },
  };
}

export function arrayOfAttribute(
  itemSchema: StructuredBlockAttributeSchema,
  options: StructuredBlockAttributeOptions & { defaultValue?: unknown[] } = {},
): StructuredBlockAttributeSchema {
  const { defaultValue = [], ...attributeOptions } = options;
  return { type: "array", default: defaultValue, ...attributeOptions, items: itemSchema };
}

export function booleanAttribute(
  defaultValue = false,
  options: StructuredBlockAttributeOptions = {},
): StructuredBlockAttributeSchema {
  return { type: "boolean", default: defaultValue, ...options };
}

export function numberAttribute(
  defaultValue?: number,
  options: StructuredBlockAttributeOptions = {},
): StructuredBlockAttributeSchema {
  return defaultValue === undefined
    ? { type: "number", ...options }
    : { type: "number", default: defaultValue, ...options };
}

export function objectAttribute(
  options: StructuredBlockAttributeOptions & {
    properties?: Readonly<Record<string, StructuredBlockAttributeSchema>>;
  } = {},
): StructuredBlockAttributeSchema {
  const { properties, ...attributeOptions } = options;
  return properties
    ? { type: "object", ...attributeOptions, properties, additionalProperties: false }
    : { type: "object", ...attributeOptions };
}

export function stringAttribute(
  defaultValue = "",
  options: StructuredBlockAttributeOptions = {},
): StructuredBlockAttributeSchema {
  return { type: "string", default: defaultValue, ...options };
}
