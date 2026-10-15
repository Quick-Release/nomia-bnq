/**
 * Minimal Gravity Forms form/field shapes from GET /wp-json/gf/v2/forms/{id}.
 * Full schema is larger; we only type what the Nomia wizard reads.
 */
export type GFChoice = {
  text: string;
  value: string;
  isSelected?: boolean;
};

export type GFInput = {
  id?: string;
  name?: string;
  label?: string;
  isHidden?: boolean;
  defaultValue?: string;
  value?: string;
  choices?: GFChoice[];
};

export type GFField = {
  id: number;
  type: string;
  formId?: number;
  label: string;
  adminLabel?: string;
  isRequired?: boolean;
  pageNumber?: number;
  visibility?: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  choices?: GFChoice[];
  inputs?: GFInput[];
  inputType?: string;
  cssClass?: string;
  /** HTML field body (GF `type: "html"`). */
  content?: string;
};

export type GFForm = {
  id: number;
  title: string;
  description?: string;
  fields?: GFField[];
};

export type GFSubmissionResponse = {
  is_valid: boolean;
  validation_messages?: Record<string, string> | string[];
  page_number?: number;
  source_page_number?: number;
  confirmation_message?: string;
  confirmation_type?: string;
  confirmation_redirect?: string;
  entry_id?: number;
  resume_token?: string;
};
