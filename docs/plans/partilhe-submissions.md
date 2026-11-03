# Partilhe: visitor submissions

How content proposed by visitors on
[/partilhe/](https://bioeconomia.apambiente.pt/partilhe/) reaches the CMS, and
the Gravity Forms form that has to exist for it. The CMS side lives in
gq-bioeconomia (`src/Submissions/`). The form, its placement on the page, and
the Frontend's support for upload fields come later.

## What happens on a submission

Gravity Forms validates the entry, saves it, and sends the form's
notifications. Then `gform_after_submission` runs, and the plugin acts only on
the Partilhe form:

1. It reads the entry by admin label (below). The content type must be exactly
   the slug of one of the plugin's post types (`PostTypes::definitions()`),
   and the title must not be empty. Otherwise nothing is created.
2. It creates a post of that type, `pending`, with no author (`post_author`
   0), even when someone is logged in. The title goes through
   `sanitize_text_field()`. The content is plain text turned into paragraph
   blocks (escaped, then `wp_kses_post()`).
3. It stores the submitter and the entry in protected post meta. The meta is
   not registered, so it isn't in REST or GraphQL:

   | Meta key                              | Value                  |
   | ------------------------------------- | ---------------------- |
   | `_gq_bioeconomia_submission_entry_id` | Gravity Forms entry id |
   | `_gq_bioeconomia_submission_form_id`  | Gravity Forms form id  |
   | `_gq_bioeconomia_submitter_name`      | The visitor's name     |
   | `_gq_bioeconomia_submitter_email`     | The visitor's email    |

   The entry gets the meta `gq_bioeconomia_post_id` and a note linking to the
   post. An entry that already has a post is never handled again.

4. It copies each uploaded file into the media library, attached to the post
   and with no author. It only reads files inside the entry's Gravity Forms
   upload folder, and checks the content of each (`wp_check_filetype_and_ext()`)
   against JPEG, PNG, WebP, GIF and PDF. The first image becomes the featured
   image when the post type supports one. Gravity Forms keeps its own copy with
   the entry.

Anything that fails is written to the PHP error log and the Gravity Forms log,
and noted on the entry. The entry stays the record of the submission.

Spam entries are skipped. With the honeypot set to abort, Gravity Forms
doesn't save them at all.

## Reviewing

Editors find submissions in each content type's built-in **Pendentes** view
(for example _Recursos Educativos → Pendentes_). In the lists they are marked
"Submissão de visitante". Their edit screen has a **Submissão de visitante**
box with the name and email, and a link to the entry for users who can see
Gravity Forms entries. Publishing is the usual review: edit, set the
taxonomies and details, and publish. To reject a submission, move it to the
bin.

## The form

`apps/cms/scripts/partilhe-form.php` creates the form from
`PartilheForm::definition()`. It is idempotent: when the form exists, the
script only brings the content types in line with the post types, and keeps
the rest as edited in the CMS.

```sh
# from apps/cms, in DDEV
ddev wp --user=<admin> eval-file scripts/partilhe-form.php dry-run
ddev wp --user=<admin> eval-file scripts/partilhe-form.php
# the same form as a Gravity Forms export (Forms → Import/Export → Import Forms)
ddev wp eval-file scripts/partilhe-form.php export > partilhe.json
```

To build it by hand, it needs:

- **Form Settings → CSS Class Name** includes `gq-bioeconomia-partilhe`.
  This is how the plugin finds the form. Form ids differ between the local
  CMS and production, so the id is never used.
- **Form Settings → Anti-spam honeypot** on, with the action "Do not create
  an entry".
- These fields, in this order, each with the **Admin Field Label** given (the
  plugin reads the entry by these labels):

  | Field            | Type               | Admin Field Label | Settings                                                                                   |
  | ---------------- | ------------------ | ----------------- | ------------------------------------------------------------------------------------------ |
  | Nome             | Name (first, last) | `name`            | Required                                                                                   |
  | Email            | Email              | `email`           | Required                                                                                   |
  | Tipo de conteúdo | Drop Down          | `content_type`    | Required; one choice per post type, value = slug, label = singular name ("show values" on) |
  | Título           | Single Line Text   | `title`           | Required; max 200 characters                                                               |
  | Conteúdo         | Paragraph Text     | `content`         | Required; no rich text editor                                                              |
  | Ficheiros        | File Upload        | `media`           | Multiple files, at most 5, 10 MB each; extensions `jpg,jpeg,png,webp,gif,pdf`              |
  | Consentimento    | Consent            | `consent`         | Required                                                                                   |

  Only plain field types: no Gravity Forms "Post" fields, which the headless
  runtime doesn't support. The 13 content types today are `gq_bio_gallery`,
  `biblioteca`, `glossario`, `recursos_educativos`, `eventos`, `indicadores`,
  `podcasts`, `videos`, `infografias`, `oportunidades`, `ferramentas`,
  `plataformas` and `bases_de_dados`. Run the script after adding a post type.

### Notification to the editors

Configured on the form, not in code, so the recipients are the editors' to
change. Recommended settings (the script creates it with these):

- **Name:** Nova submissão (editores). **Event:** Form is submitted.
- **Send To:** the editorial team's address or list. The script sets
  `{admin_email}` as a placeholder; replace it in production.
- **From:** `{admin_email}`, From Name "Bio.Eco.Nomia". **Reply To:**
  `{Email:2}`, so editors can answer the visitor.
- **Subject:** `Nova submissão em Partilhe: {Título:4}`.
- **Message:** the content type (`{Tipo de conteúdo:3:value}`),
  `{all_fields}` and `{entry_url}`. Gravity Forms sends notifications before
  the post exists, so the message can't link to the post: the entry has the
  link in its notes.

The visitor gets the form's confirmation message only, not an email.

## Production rollout (later)

Not done yet, and coordinated outside this change:

1. `@getquick/content` releases support for `fileupload` fields, and the Site
   adopts it. Version 0.5.1 rejects them.
2. The form is created on the production CMS (the script, or the export
   imported by an administrator), and its notification recipients are set.
3. The form is placed on the /partilhe/ page, and the page is refreshed.
4. A test submission is checked end to end, then binned.

Until step 2, the handler does nothing in production: no form has the class.
