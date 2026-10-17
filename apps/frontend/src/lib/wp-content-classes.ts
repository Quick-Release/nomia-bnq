/** Typography + link styles for WordPress body HTML (single blob or assembled blocks). */
export const WP_PDF_EMBED_PREVIEW =
  "[&_object.wp-block-file\\_\\_embed]:aspect-[4/5] [&_object.wp-block-file\\_\\_embed]:h-[min(78vh,760px)] [&_object.wp-block-file\\_\\_embed]:w-full [&_object.wp-block-file\\_\\_embed]:rounded-lg [&_object.wp-block-file\\_\\_embed]:border [&_object.wp-block-file\\_\\_embed]:border-monochrome-light-200 [&_object.wp-block-file\\_\\_embed]:bg-neutral-bw-white";

export const WP_CONTENT_PROSE = `wp-content text-[var(--main-cinza-700)] [&_a]:text-blue-600 [&_a]:underline [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_img]:h-auto [&_img]:max-w-full [&_li]:my-1 ${WP_PDF_EMBED_PREVIEW} [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6`;

/** Same as {@link WP_CONTENT_PROSE} plus vertical rhythm when blocks are not layout-flex. */
export const WP_CONTENT_PROSE_STACKED = `${WP_CONTENT_PROSE} space-y-4`;
