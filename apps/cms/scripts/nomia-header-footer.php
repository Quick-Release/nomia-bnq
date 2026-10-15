<?php

/**
 * Creates Nomia's header and footer as GQ Design Elements: two published
 * synced patterns (GETQUICK → Elements → Patterns), "Nomia — Cabeçalho" and
 * "Nomia — Rodapé", recreating bioeconomia.pt's NomiaHeader and NomiaFooter
 * from the blocks GQ Design allows in header and footer template parts.
 * Run once per site, then the patterns are the editors' to change there:
 *
 *   wp eval-file scripts/nomia-header-footer.php            # from apps/cms
 *   wp eval-file scripts/nomia-header-footer.php dry-run    # print the markup only
 *
 * It reads what the site already holds: the site title (GQ Design allows no
 * Site Logo block in a header), the primary menu (through GQ Design's
 * Navigation block),
 * and nomia-cpt's Aparência → Contacto and → Footer settings (copied into the
 * footer once). Colors are GQ Design palette presets (Nomia's palette, set
 * under GETQUICK → Design → Branding → Colors). A pattern whose slug already
 * exists is left as it is, so running it again changes nothing.
 *
 * It doesn't assign them: choosing them for a route is GETQUICK → Design →
 * Header & Footer.
 *
 * @package NomiaBnq
 */

if (! defined('WP_CLI') || ! WP_CLI) {
    return;
}

$dry_run = in_array('dry-run', $args ?? [], true);

/** A block comment's attributes, as the block editor serializes them. */
$nomia_attrs = static function (array $attributes): string {
    return [] === $attributes ? '' : ' ' . serialize_block_attributes($attributes);
};

/** A preset color, as a block's `style.color` holds it and as CSS. */
$nomia_color = static fn(string $slug): array => [
    'ref' => 'var:preset|color|' . $slug,
    'css' => 'var(--wp--preset--color--' . $slug . ')',
];

/** Both preset spacings of a padding, as attribute and as CSS. */
$nomia_padding = static function (string $block, string $inline): array {
    return [
        'attr' => [
            'top' => 'var:preset|spacing|' . $block,
            'right' => 'var:preset|spacing|' . $inline,
            'bottom' => 'var:preset|spacing|' . $block,
            'left' => 'var:preset|spacing|' . $inline,
        ],
        'css' => sprintf(
            'padding-top:var(--wp--preset--spacing--%1$s);padding-right:var(--wp--preset--spacing--%2$s);padding-bottom:var(--wp--preset--spacing--%1$s);padding-left:var(--wp--preset--spacing--%2$s)',
            $block,
            $inline,
        ),
    ];
};

$nomia_paragraph = static function (string $html, ?string $color = null) use ($nomia_attrs, $nomia_color): string {
    if (null === $color) {
        return "<!-- wp:paragraph -->\n<p>{$html}</p>\n<!-- /wp:paragraph -->";
    }
    $preset = $nomia_color($color);

    return '<!-- wp:paragraph' . $nomia_attrs(['style' => ['color' => ['text' => $preset['ref']]]]) . " -->\n"
        . '<p class="has-text-color" style="color:' . $preset['css'] . '">' . $html . "</p>\n<!-- /wp:paragraph -->";
};

// The palette's class form: the editor saves a separator's `style.color`
// preset as an invalid CSS color.
$nomia_separator = static function (): string {
    $slug = 'monocromatico-claro-400';

    return "<!-- wp:separator {\"backgroundColor\":\"{$slug}\"} -->\n"
        . "<hr class=\"wp-block-separator has-text-color has-{$slug}-color has-alpha-channel-opacity has-{$slug}-background-color has-background\"/>\n<!-- /wp:separator -->";
};

$nomia_image = static function (int $id, string $class = '') use ($nomia_attrs): string {
    $url = wp_get_attachment_image_url($id, 'full');
    if (! is_string($url) || '' === $url) {
        return '';
    }
    $alt = trim((string) get_post_meta($id, '_wp_attachment_image_alt', true));

    return '<!-- wp:image' . $nomia_attrs(['id' => $id, 'sizeSlug' => 'full', 'className' => $class]) . " -->\n"
        . '<figure class="wp-block-image size-full ' . esc_attr($class) . '"><img src="' . esc_url($url) . '" alt="'
        . esc_attr($alt) . '" class="wp-image-' . $id . "\"/></figure>\n<!-- /wp:image -->";
};

/**
 * A menu of fixed links (core/navigation with its links inline), as the
 * footer's columns: editors change them in the pattern.
 *
 * @param array<int, array{0: string, 1: string}> $links Label and URL.
 */
$nomia_menu = static function (string $label, array $links, string $orientation) use ($nomia_attrs): string {
    $items = array_map(
        static fn(array $link): string => '<!-- wp:navigation-link'
            . $nomia_attrs(['label' => $link[0], 'url' => $link[1], 'kind' => 'custom', 'isTopLevelLink' => true]) . ' /-->',
        $links,
    );

    return '<!-- wp:navigation' . $nomia_attrs([
        'overlayMenu' => 'never',
        'ariaLabel' => $label,
        'layout' => ['type' => 'flex', 'orientation' => $orientation, 'flexWrap' => 'wrap'],
    ]) . " -->\n" . implode("\n", $items) . "\n<!-- /wp:navigation -->";
};

/** A group with a flex or constrained layout around its blocks. */
$nomia_group = static function (array $blocks, array $layout, array $style = [], string $class = '') use ($nomia_attrs): string {
    $attributes = array_filter([
        'className' => $class,
        'style' => $style['attr'] ?? [],
        'layout' => $layout,
    ]);
    $classes = implode(' ', array_filter(['wp-block-group', $class, $style['class'] ?? '']));
    $css = $style['css'] ?? '';

    return '<!-- wp:group' . $nomia_attrs($attributes) . " -->\n"
        . '<div class="' . $classes . '"' . ('' !== $css ? ' style="' . $css . '"' : '') . '>'
        . implode("\n\n", array_filter($blocks)) . "</div>\n<!-- /wp:group -->";
};

// Header: the bar of NomiaHeader.astro (home link, primary menu, contact
// link), teal under a light text. The logo image, the search panel, the pill
// colors of the first two menu items and the translucent fixed bar have no
// allowed block or attribute.
$teal = $nomia_color('teal-500');
$light = $nomia_color('cinza-100');
$bar = $nomia_padding('30', '40');

$header = $nomia_group(
    [
        $nomia_group(
            [
                '<!-- wp:site-title {"level":0,"isLink":true} /-->',
                '<!-- wp:getquick-design/navigation' . $nomia_attrs(['location' => 'primary', 'label' => 'Principal']) . ' /-->',
            ],
            ['type' => 'flex', 'flexWrap' => 'nowrap'],
            [
                'attr' => ['spacing' => ['blockGap' => 'var:preset|spacing|30']],
            ],
        ),
        "<!-- wp:buttons -->\n<div class=\"wp-block-buttons\"><!-- wp:button"
            . $nomia_attrs(['url' => '/contactos/', 'style' => ['color' => ['background' => $nomia_color('teal-400')['ref'], 'text' => $light['ref']]]])
            . " -->\n<div class=\"wp-block-button\"><a class=\"wp-block-button__link has-text-color has-background wp-element-button\" href=\"/contactos/\" style=\"color:"
            . $light['css'] . ';background-color:' . $nomia_color('teal-400')['css']
            . "\">Contactos</a></div>\n<!-- /wp:button --></div>\n<!-- /wp:buttons -->",
    ],
    ['type' => 'flex', 'flexWrap' => 'nowrap', 'justifyContent' => 'space-between'],
    [
        'attr' => [
            'color' => ['background' => $teal['ref'], 'text' => $light['ref']],
            'spacing' => ['padding' => $bar['attr'], 'blockGap' => 'var:preset|spacing|30'],
        ],
        'class' => 'has-text-color has-background',
        'css' => 'color:' . $light['css'] . ';background-color:' . $teal['css'] . ';' . $bar['css'],
    ],
    'gqd-site-header',
);

// Footer: NomiaFooter.astro's columns (its menus, then the contact from
// Aparência → Contacto), the legal bar and the partner logos from
// Aparência → Footer, dark text on white.
$muted = 'cinza-400';
$columns = [
    ['Index', [['Bioeconomia Sustentável', '/bioeconomia-sustentavel/'], ['Visão Geral', '/bioeconomia-sustentavel/visao-geral/'], ['PABS 2030', '/bioeconomia-sustentavel/pabs-2030/']]],
    ['Nomia', [['Economia Circular', '/economia-circular/'], ['Visão geral', '/economia-circular/visao-geral/'], ['PAEC 2030', '/economia-circular/paec-2030/']]],
    ['Social', [['Facebook', 'https://facebook.com'], ['Instagram', 'https://instagram.com'], ['Youtube', 'https://youtube.com']]],
];
$column_blocks = array_map(
    static fn(array $column): string => "<!-- wp:column -->\n<div class=\"wp-block-column\">"
        . $nomia_paragraph(esc_html($column[0]), $muted) . "\n\n" . $nomia_menu($column[0], $column[1], 'vertical')
        . "</div>\n<!-- /wp:column -->",
    $columns,
);

$contact = function_exists('nomia_cpt_get_contact') ? nomia_cpt_get_contact() : [];
$contact_rows = [];
foreach (['address' => 'Morada', 'phone' => 'Telefone', 'email' => 'Email', 'gps_coordinates' => 'GPS'] as $field => $label) {
    $value = trim((string) ($contact[ $field ] ?? ''));
    if ('' === $value) {
        continue;
    }
    $html = esc_html($value);
    if ('phone' === $field) {
        $html = '<a href="tel:' . esc_attr(preg_replace('/[^0-9+]/', '', $value)) . '">' . $html . '</a>';
    } elseif ('email' === $field) {
        $html = '<a href="mailto:' . esc_attr($value) . '">' . $html . '</a>';
    }
    $contact_rows[] = $nomia_paragraph(esc_html($label), $muted) . "\n\n" . $nomia_paragraph($html);
}
if ([] !== $contact_rows) {
    $column_blocks[] = "<!-- wp:column -->\n<div class=\"wp-block-column\">" . $nomia_paragraph('Contacto', $muted)
        . "\n\n" . implode("\n\n", $contact_rows) . "</div>\n<!-- /wp:column -->";
}

$logo_ids = function_exists('nomia_cpt_get_footer_logo_ids') ? nomia_cpt_get_footer_logo_ids() : [];
$partner_logos = array_filter(array_map(static fn(int $id): string => $nomia_image($id, 'nomia-footer__logo'), $logo_ids));
$dark = $nomia_color('cinza-700');
$white = $nomia_color('branco');
$page = $nomia_padding('60', '40');

$footer = $nomia_group(
    [
        $nomia_separator(),
        "<!-- wp:columns -->\n<div class=\"wp-block-columns\">" . implode("\n\n", $column_blocks) . "</div>\n<!-- /wp:columns -->",
        $nomia_separator(),
        $nomia_group(
            [
                $nomia_paragraph('©&nbsp;2026&nbsp;NOMIA', $muted),
                $nomia_menu('Legal', [['Política de Privacidade', '/politica-de-privacidade/']], 'horizontal'),
            ],
            ['type' => 'flex', 'flexWrap' => 'wrap', 'justifyContent' => 'space-between'],
        ),
        [] === $partner_logos ? '' : $nomia_separator(),
        // Columns of a fixed width, as images have no size GQ Design keeps.
        [] === $partner_logos ? '' : '<!-- wp:columns {"verticalAlignment":"center"} -->' . "\n"
            . '<div class="wp-block-columns are-vertically-aligned-center">' . implode("\n\n", array_map(
                static fn(string $image): string => '<!-- wp:column {"verticalAlignment":"center","width":"180px"} -->' . "\n"
                    . '<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:180px">' . $image . "</div>\n<!-- /wp:column -->",
                $partner_logos,
            )) . "</div>\n<!-- /wp:columns -->",
    ],
    ['type' => 'constrained'],
    [
        'attr' => [
            'color' => ['background' => $white['ref'], 'text' => $dark['ref']],
            'spacing' => ['padding' => $page['attr']],
        ],
        'class' => 'has-text-color has-background',
        'css' => 'color:' . $dark['css'] . ';background-color:' . $white['css'] . ';' . $page['css'],
    ],
);

$patterns = [
    'nomia-cabecalho' => ['Nomia — Cabeçalho', $header],
    'nomia-rodape' => ['Nomia — Rodapé', $footer],
];

foreach ($patterns as $slug => [$title, $content]) {
    if ($dry_run) {
        WP_CLI::log("== {$slug}\n{$content}\n");
        continue;
    }

    $existing = get_posts([
        'post_type' => 'wp_block',
        'name' => $slug,
        'post_status' => 'any',
        'numberposts' => 1,
        'fields' => 'ids',
    ]);
    if ([] !== $existing) {
        WP_CLI::log("= {$title} already exists (#{$existing[0]}); left as it is.");
        continue;
    }

    $id = wp_insert_post([
        'post_type' => 'wp_block',
        'post_status' => 'publish',
        'post_name' => $slug,
        'post_title' => $title,
        'post_content' => wp_slash($content),
    ], true);
    if (is_wp_error($id)) {
        WP_CLI::error("{$title}: " . $id->get_error_message());
    }
    WP_CLI::log("+ {$title} (#{$id})");
}

WP_CLI::success($dry_run ? 'Dry run: nothing saved.' : 'Nomia header and footer patterns are in place.');
