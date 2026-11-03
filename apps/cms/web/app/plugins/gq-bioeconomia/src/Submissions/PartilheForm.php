<?php
/**
 * The Partilhe form.
 *
 * @package GetQuick\Bioeconomia\Submissions
 */

declare(strict_types=1);

namespace GetQuick\Bioeconomia\Submissions;

use GetQuick\Bioeconomia\Content\PostTypes;

/**
 * The Gravity Forms form on /partilhe/, where visitors propose content.
 *
 * Form ids differ between CMSs, so the form is recognised by its CSS class
 * (Form Settings → CSS Class Name) and its fields by their admin labels
 * (Field → Advanced → Admin Field Label). `definition()` is the whole form, in
 * Gravity Forms' form-object shape, for creating it (`apps/cms/scripts/partilhe-form.php`).
 */
final class PartilheForm {

	public const CSS_CLASS = 'gq-bioeconomia-partilhe';

	public const LABEL_NAME         = 'name';
	public const LABEL_EMAIL        = 'email';
	public const LABEL_CONTENT_TYPE = 'content_type';
	public const LABEL_TITLE        = 'title';
	public const LABEL_CONTENT      = 'content';
	public const LABEL_MEDIA        = 'media';

	public const ALLOWED_EXTENSIONS = 'jpg,jpeg,png,webp,gif,pdf';

	/**
	 * At most this many files, of at most MAX_FILE_SIZE MB each. Together they
	 * stay under the Frontend form route's 10 MiB cap on a post, so readiness
	 * doesn't warn that the largest posts would be refused.
	 */
	public const MAX_FILES     = 3;
	public const MAX_FILE_SIZE = 3;

	/**
	 * Whether a Gravity Forms form is the Partilhe form.
	 *
	 * @param array|object $form The form object.
	 */
	public static function isPartilheForm( $form ): bool {
		$classes = preg_split( '/\s+/', (string) ( $form['cssClass'] ?? '' ), -1, PREG_SPLIT_NO_EMPTY );

		return in_array( self::CSS_CLASS, $classes, true );
	}

	/**
	 * The content type choices: one per post type, valued by its slug and
	 * labelled by its singular name.
	 *
	 * @return list<array{text: string, value: string, isSelected: bool}>
	 */
	public static function contentTypeChoices(): array {
		$choices = [];

		foreach ( PostTypes::definitions() as $post_type => $definition ) {
			$choices[] = [
				'text'       => $definition['labels']['singular_name'],
				'value'      => $post_type,
				'isSelected' => false,
			];
		}

		return $choices;
	}

	/**
	 * The form, as a Gravity Forms form object without an id.
	 *
	 * @return array<string, mixed>
	 */
	public static function definition(): array {
		return [
			'title'                => __( 'Partilhe', 'gq-bioeconomia' ),
			'description'          => '',
			'cssClass'             => self::CSS_CLASS,
			'labelPlacement'       => 'top_label',
			'descriptionPlacement' => 'below',
			'enableHoneypot'       => true,
			'honeypotAction'       => 'abort',
			'button'               => [
				'type' => 'text',
				'text' => __( 'Enviar', 'gq-bioeconomia' ),
			],
			'fields'               => [
				[
					'id'         => 1,
					'type'       => 'name',
					'label'      => __( 'Nome', 'gq-bioeconomia' ),
					'adminLabel' => self::LABEL_NAME,
					'isRequired' => true,
					'nameFormat' => 'advanced',
					'inputs'     => [
						[
							'id'       => '1.2',
							'label'    => __( 'Prefixo', 'gq-bioeconomia' ),
							'isHidden' => true,
						],
						[
							'id'    => '1.3',
							'label' => __( 'Nome próprio', 'gq-bioeconomia' ),
						],
						[
							'id'       => '1.4',
							'label'    => __( 'Segundo nome', 'gq-bioeconomia' ),
							'isHidden' => true,
						],
						[
							'id'    => '1.6',
							'label' => __( 'Apelido', 'gq-bioeconomia' ),
						],
						[
							'id'       => '1.8',
							'label'    => __( 'Sufixo', 'gq-bioeconomia' ),
							'isHidden' => true,
						],
					],
				],
				[
					'id'         => 2,
					'type'       => 'email',
					'label'      => __( 'Email', 'gq-bioeconomia' ),
					'adminLabel' => self::LABEL_EMAIL,
					'isRequired' => true,
				],
				[
					'id'          => 3,
					'type'        => 'select',
					'label'       => __( 'Tipo de conteúdo', 'gq-bioeconomia' ),
					'adminLabel'  => self::LABEL_CONTENT_TYPE,
					'isRequired'  => true,
					'placeholder' => __( 'Escolha um tipo', 'gq-bioeconomia' ),
					'choices'     => self::contentTypeChoices(),
				],
				[
					'id'         => 4,
					'type'       => 'text',
					'label'      => __( 'Título', 'gq-bioeconomia' ),
					'adminLabel' => self::LABEL_TITLE,
					'isRequired' => true,
					'maxLength'  => 200,
				],
				[
					'id'                => 5,
					'type'              => 'textarea',
					'label'             => __( 'Conteúdo', 'gq-bioeconomia' ),
					'adminLabel'        => self::LABEL_CONTENT,
					'isRequired'        => true,
					'useRichTextEditor' => false,
				],
				[
					'id'                => 6,
					'type'              => 'fileupload',
					'label'             => __( 'Ficheiros', 'gq-bioeconomia' ),
					'adminLabel'        => self::LABEL_MEDIA,
					'isRequired'        => false,
					'multipleFiles'     => true,
					'maxFiles'          => self::MAX_FILES,
					'maxFileSize'       => self::MAX_FILE_SIZE,
					'allowedExtensions' => self::ALLOWED_EXTENSIONS,
				],
				[
					'id'            => 7,
					'type'          => 'consent',
					'label'         => __( 'Consentimento', 'gq-bioeconomia' ),
					'adminLabel'    => 'consent',
					'isRequired'    => true,
					'checkboxLabel' => __( 'Autorizo o tratamento dos meus dados para a análise e eventual publicação deste conteúdo.', 'gq-bioeconomia' ),
					'inputs'        => [
						[
							'id'    => '7.1',
							'label' => __( 'Consentimento', 'gq-bioeconomia' ),
						],
						[
							'id'       => '7.2',
							'label'    => __( 'Texto', 'gq-bioeconomia' ),
							'isHidden' => true,
						],
						[
							'id'       => '7.3',
							'label'    => __( 'Descrição', 'gq-bioeconomia' ),
							'isHidden' => true,
						],
					],
				],
			],
			'notifications'        => [
				'gq-bioeconomia-partilhe-editors' => [
					'id'       => 'gq-bioeconomia-partilhe-editors',
					'name'     => __( 'Nova submissão (editores)', 'gq-bioeconomia' ),
					'isActive' => true,
					'event'    => 'form_submission',
					'toType'   => 'email',
					'to'       => '{admin_email}',
					'from'     => '{admin_email}',
					'fromName' => 'Bio.Eco.Nomia',
					'replyTo'  => '{Email:2}',
					'subject'  => __( 'Nova submissão em Partilhe: {Título:4}', 'gq-bioeconomia' ),
					'message'  => __( 'Foi submetido um conteúdo do tipo {Tipo de conteúdo:3:value}. O conteúdo fica pendente de revisão no CMS.', 'gq-bioeconomia' ) . "\n\n{all_fields}\n\n{entry_url}",
				],
			],
			'confirmations'        => [
				'gq-bioeconomia-partilhe-message' => [
					'id'        => 'gq-bioeconomia-partilhe-message',
					'name'      => __( 'Confirmação', 'gq-bioeconomia' ),
					'isDefault' => true,
					'type'      => 'message',
					'message'   => __( 'Obrigado. A sua submissão foi recebida e será revista pela equipa editorial antes de ser publicada.', 'gq-bioeconomia' ),
				],
			],
		];
	}
}
