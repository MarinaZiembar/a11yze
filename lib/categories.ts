import type { CategoryId, Lang, Principle } from "./types";

type L = Record<Lang, string>;

export interface Resource {
  label: L;
  href: string;
}

export interface Category {
  id: CategoryId;
  principle: Principle;
  wcag: string[];
  /** IDs de auditorías de Lighthouse que pertenecen a la categoría */
  audits: string[];
  /** Grupos de Lighthouse como fallback para auditorías nuevas que no estén mapeadas */
  groups: string[];
  title: L;
  short: L;
  analyzed: L;
  strategies: Record<Lang, string[]>;
  resources: Resource[];
}

const U = (slug: string) => `https://www.w3.org/WAI/WCAG22/Understanding/${slug}.html`;

export const PRINCIPLES: Record<Principle, L> = {
  perceivable: { es: "Perceptible", en: "Perceivable" },
  operable: { es: "Operable", en: "Operable" },
  understandable: { es: "Comprensible", en: "Understandable" },
  robust: { es: "Robusto", en: "Robust" },
  all: { es: "Todos los principios", en: "All principles" },
};

export const CATEGORIES: Category[] = [
  {
    id: "images",
    principle: "perceivable",
    wcag: ["1.1.1", "1.2.2"],
    audits: [
      "image-alt",
      "input-image-alt",
      "object-alt",
      "role-img-alt",
      "svg-img-alt",
      "area-alt",
      "image-redundant-alt",
      "video-caption",
    ],
    groups: ["a11y-audio-video"],
    title: { es: "Imágenes y multimedia", en: "Images & media" },
    short: {
      es: "Textos alternativos para imágenes, íconos y subtítulos en videos.",
      en: "Text alternatives for images, icons and captions for video.",
    },
    analyzed: {
      es: "Revisamos que cada imagen, SVG informativo, botón-imagen y video tenga una alternativa en texto, para que quien usa lector de pantalla reciba la misma información.",
      en: "We check that every image, meaningful SVG, image button and video has a text alternative, so screen reader users get the same information.",
    },
    strategies: {
      es: [
        "Escribí un `alt` que describa la función o el contenido de la imagen, no “imagen de…”.",
        "Si la imagen es decorativa, usá `alt=\"\"` para que el lector de pantalla la ignore.",
        "A los SVG informativos dales `role=\"img\"` y un `<title>` o `aria-label`.",
        "Sumá subtítulos con `<track kind=\"captions\">` a los videos con audio.",
      ],
      en: [
        "Write an `alt` that describes the image’s purpose or content, not “image of…”.",
        "If the image is decorative, use `alt=\"\"` so screen readers skip it.",
        "Give meaningful SVGs `role=\"img\"` plus a `<title>` or `aria-label`.",
        "Add captions with `<track kind=\"captions\">` to videos with audio.",
      ],
    },
    resources: [
      { label: { es: "Tutorial de imágenes (W3C)", en: "Images tutorial (W3C)" }, href: "https://www.w3.org/WAI/tutorials/images/" },
      { label: { es: "Árbol de decisión para alt", en: "Alt decision tree" }, href: "https://www.w3.org/WAI/tutorials/images/decision-tree/" },
      { label: { es: "WCAG 1.1.1 Contenido no textual", en: "WCAG 1.1.1 Non-text content" }, href: U("non-text-content") },
    ],
  },
  {
    id: "contrast",
    principle: "perceivable",
    wcag: ["1.4.3", "1.4.1"],
    audits: ["color-contrast", "link-in-text-block"],
    groups: ["a11y-color-contrast"],
    title: { es: "Contraste de color", en: "Color contrast" },
    short: {
      es: "Que el texto se lea bien y que el color no sea la única pista.",
      en: "Readable text, and color is never the only cue.",
    },
    analyzed: {
      es: "Medimos el contraste entre cada texto y su fondo, y verificamos que los links dentro de párrafos se distingan por algo más que el color.",
      en: "We measure the contrast between each text and its background, and check that links inside paragraphs stand out by more than color.",
    },
    strategies: {
      es: [
        "Texto normal: contraste mínimo 4.5:1. Texto grande (24px, o 18.66px en negrita): 3:1.",
        "Si hay texto sobre fotos o degradados, sumá un overlay o un fondo sólido detrás.",
        "Los links dentro de texto necesitan subrayado u otro indicador además del color.",
        "Definí tokens de color ya validados en tu sistema de diseño y reutilizalos.",
      ],
      en: [
        "Body text: at least 4.5:1. Large text (24px, or 18.66px bold): 3:1.",
        "For text over photos or gradients, add an overlay or a solid backdrop.",
        "Inline links need an underline or another cue besides color.",
        "Define pre-validated color tokens in your design system and reuse them.",
      ],
    },
    resources: [
      { label: { es: "WCAG 1.4.3 Contraste mínimo", en: "WCAG 1.4.3 Contrast (minimum)" }, href: U("contrast-minimum") },
      { label: { es: "WebAIM Contrast Checker", en: "WebAIM Contrast Checker" }, href: "https://webaim.org/resources/contrastchecker/" },
      { label: { es: "WCAG 1.4.1 Uso del color", en: "WCAG 1.4.1 Use of color" }, href: U("use-of-color") },
    ],
  },
  {
    id: "structure",
    principle: "perceivable",
    wcag: ["1.3.1", "2.4.6"],
    audits: [
      "heading-order",
      "empty-heading",
      "list",
      "listitem",
      "definition-list",
      "dlitem",
      "landmark-one-main",
      "td-headers-attr",
      "th-has-data-cells",
      "table-duplicate-name",
      "table-fake-caption",
      "td-has-header",
    ],
    groups: ["a11y-tables-lists"],
    title: { es: "Estructura y encabezados", en: "Structure & headings" },
    short: {
      es: "Encabezados en orden, landmarks, listas y tablas bien marcadas.",
      en: "Ordered headings, landmarks, and properly marked lists and tables.",
    },
    analyzed: {
      es: "Revisamos el orden de los encabezados, que exista una región principal y que listas y tablas usen el marcado correcto, porque así es como se navega con lector de pantalla.",
      en: "We check heading order, that a main landmark exists, and that lists and tables use proper markup — that’s how screen reader users navigate.",
    },
    strategies: {
      es: [
        "Usá un solo `<h1>` y bajá de nivel sin saltearte ninguno (h2 → h3).",
        "Marcá regiones con `<header>`, `<nav>`, `<main>` y `<footer>`.",
        "Usá `<ul>`/`<ol>` para listas y `<th scope>` en tablas de datos.",
        "No elijas un heading por su tamaño: el estilo va por CSS.",
      ],
      en: [
        "Use a single `<h1>` and step down without skipping levels (h2 → h3).",
        "Mark regions with `<header>`, `<nav>`, `<main>` and `<footer>`.",
        "Use `<ul>`/`<ol>` for lists and `<th scope>` in data tables.",
        "Don’t pick a heading level for its size — style it with CSS.",
      ],
    },
    resources: [
      { label: { es: "Tutorial de estructura de página", en: "Page structure tutorial" }, href: "https://www.w3.org/WAI/tutorials/page-structure/" },
      { label: { es: "Encabezados (W3C)", en: "Headings (W3C)" }, href: "https://www.w3.org/WAI/tutorials/page-structure/headings/" },
      { label: { es: "Tutorial de tablas", en: "Tables tutorial" }, href: "https://www.w3.org/WAI/tutorials/tables/" },
    ],
  },
  {
    id: "keyboard",
    principle: "operable",
    wcag: ["2.1.1", "2.4.1", "2.4.3", "2.4.7"],
    audits: ["bypass", "tabindex", "accesskeys", "skip-link"],
    groups: ["a11y-navigation"],
    title: { es: "Teclado y foco", en: "Keyboard & focus" },
    short: {
      es: "Que todo se pueda usar sin mouse y el foco siempre se vea.",
      en: "Everything works without a mouse and focus is always visible.",
    },
    analyzed: {
      es: "Buscamos formas de saltar bloques repetidos, valores de tabindex que rompen el orden natural y atajos de teclado duplicados.",
      en: "We look for ways to skip repeated blocks, tabindex values that break the natural order, and duplicated access keys.",
    },
    strategies: {
      es: [
        "Agregá un link “Saltar al contenido” como primer elemento enfocable.",
        "Evitá `tabindex` mayor a 0: altera el orden natural del foco.",
        "Nunca quites el outline sin reemplazarlo: usá `:focus-visible` con buen contraste.",
        "Usá `<button>` y `<a>` nativos en lugar de `<div onClick>`.",
      ],
      en: [
        "Add a “Skip to content” link as the first focusable element.",
        "Avoid `tabindex` greater than 0 — it breaks the natural focus order.",
        "Never remove the outline without a replacement: use `:focus-visible` with good contrast.",
        "Use native `<button>` and `<a>` instead of `<div onClick>`.",
      ],
    },
    resources: [
      { label: { es: "WCAG 2.1.1 Teclado", en: "WCAG 2.1.1 Keyboard" }, href: U("keyboard") },
      { label: { es: "WCAG 2.4.1 Evitar bloques", en: "WCAG 2.4.1 Bypass blocks" }, href: U("bypass-blocks") },
      { label: { es: "WebAIM: accesibilidad con teclado", en: "WebAIM: keyboard accessibility" }, href: "https://webaim.org/techniques/keyboard/" },
    ],
  },
  {
    id: "names",
    principle: "operable",
    wcag: ["2.4.4", "2.5.3", "4.1.2"],
    audits: [
      "link-name",
      "button-name",
      "input-button-name",
      "identical-links-same-purpose",
      "frame-title",
      "label-content-name-mismatch",
      "aria-command-name",
    ],
    groups: ["a11y-names-labels"],
    title: { es: "Links y botones", en: "Links & buttons" },
    short: {
      es: "Cada control dice qué hace, también para lectores de pantalla.",
      en: "Every control says what it does, to screen readers too.",
    },
    analyzed: {
      es: "Verificamos que links, botones e iframes tengan un nombre accesible y que el nombre coincida con el texto visible.",
      en: "We verify that links, buttons and iframes have an accessible name that matches their visible text.",
    },
    strategies: {
      es: [
        "Cada link y botón necesita un nombre: texto visible o `aria-label`.",
        "Evitá “click acá” o “ver más” sueltos: describí el destino.",
        "Botones de solo ícono: `aria-label` en el botón y `aria-hidden=\"true\"` en el ícono.",
        "Dale un `title` descriptivo a cada `<iframe>`.",
      ],
      en: [
        "Every link and button needs a name: visible text or `aria-label`.",
        "Avoid bare “click here” or “read more” — describe the destination.",
        "Icon-only buttons: `aria-label` on the button and `aria-hidden=\"true\"` on the icon.",
        "Give every `<iframe>` a descriptive `title`.",
      ],
    },
    resources: [
      { label: { es: "WCAG 2.4.4 Propósito de los links", en: "WCAG 2.4.4 Link purpose" }, href: U("link-purpose-in-context") },
      { label: { es: "Nombres y descripciones (ARIA APG)", en: "Names & descriptions (ARIA APG)" }, href: "https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/" },
      { label: { es: "WCAG 4.1.2 Nombre, función, valor", en: "WCAG 4.1.2 Name, role, value" }, href: U("name-role-value") },
    ],
  },
  {
    id: "forms",
    principle: "understandable",
    wcag: ["3.3.2", "1.3.5"],
    audits: [
      "label",
      "select-name",
      "form-field-multiple-labels",
      "aria-input-field-name",
      "aria-toggle-field-name",
      "autocomplete-valid",
    ],
    groups: [],
    title: { es: "Formularios y etiquetas", en: "Forms & labels" },
    short: {
      es: "Campos con etiqueta clara y errores fáciles de entender.",
      en: "Clearly labelled fields and easy-to-understand errors.",
    },
    analyzed: {
      es: "Revisamos que inputs, selects y switches tengan una etiqueta asociada, una sola, y que el autocompletado esté bien declarado.",
      en: "We check that inputs, selects and switches have one associated label, and that autocomplete is declared correctly.",
    },
    strategies: {
      es: [
        "Asociá cada campo con un `<label for>`: el placeholder no reemplaza al label.",
        "Un solo label por campo; si necesitás ayuda extra, usá `aria-describedby`.",
        "Usá `autocomplete` (email, name, tel…) para que completar sea más fácil.",
        "Mostrá los errores en texto, junto al campo, y no solo en rojo.",
      ],
      en: [
        "Tie each field to a `<label for>` — a placeholder is not a label.",
        "One label per field; for extra hints use `aria-describedby`.",
        "Use `autocomplete` (email, name, tel…) to make filling in easier.",
        "Show errors as text next to the field, not just in red.",
      ],
    },
    resources: [
      { label: { es: "Tutorial de formularios (W3C)", en: "Forms tutorial (W3C)" }, href: "https://www.w3.org/WAI/tutorials/forms/" },
      { label: { es: "WCAG 3.3.2 Etiquetas o instrucciones", en: "WCAG 3.3.2 Labels or instructions" }, href: U("labels-or-instructions") },
      { label: { es: "WCAG 1.3.5 Propósito de los campos", en: "WCAG 1.3.5 Identify input purpose" }, href: U("identify-input-purpose") },
    ],
  },
  {
    id: "language",
    principle: "understandable",
    wcag: ["3.1.1", "3.1.2", "2.4.2"],
    audits: ["document-title", "html-has-lang", "html-lang-valid", "html-xml-lang-mismatch", "valid-lang"],
    groups: ["a11y-language"],
    title: { es: "Idioma y título", en: "Language & title" },
    short: {
      es: "El idioma declarado y un título que diga dónde estás.",
      en: "A declared language and a title that tells you where you are.",
    },
    analyzed: {
      es: "Verificamos que la página declare su idioma (así el lector de pantalla pronuncia bien) y que tenga un título descriptivo.",
      en: "We verify the page declares its language (so screen readers pronounce it right) and has a descriptive title.",
    },
    strategies: {
      es: [
        "Declará el idioma en `<html lang=\"es\">` (o el que corresponda).",
        "Marcá fragmentos en otro idioma con `lang=\"en\"`.",
        "Cada página necesita un `<title>` único y descriptivo.",
        "Si tu sitio es bilingüe, actualizá el `lang` al cambiar de idioma.",
      ],
      en: [
        "Declare the language with `<html lang=\"en\">` (or the right one).",
        "Mark passages in another language with `lang=\"es\"`.",
        "Every page needs a unique, descriptive `<title>`.",
        "If your site is bilingual, update `lang` when switching languages.",
      ],
    },
    resources: [
      { label: { es: "WCAG 3.1.1 Idioma de la página", en: "WCAG 3.1.1 Language of page" }, href: U("language-of-page") },
      { label: { es: "WCAG 2.4.2 Página titulada", en: "WCAG 2.4.2 Page titled" }, href: U("page-titled") },
      { label: { es: "Cómo declarar el idioma (W3C i18n)", en: "Declaring language (W3C i18n)" }, href: "https://www.w3.org/International/questions/qa-html-language-declarations" },
    ],
  },
  {
    id: "aria",
    principle: "robust",
    wcag: ["4.1.2"],
    audits: [
      "aria-allowed-attr",
      "aria-allowed-role",
      "aria-conditional-attr",
      "aria-deprecated-role",
      "aria-dialog-name",
      "aria-hidden-body",
      "aria-hidden-focus",
      "aria-prohibited-attr",
      "aria-required-attr",
      "aria-required-children",
      "aria-required-parent",
      "aria-roles",
      "aria-text",
      "aria-valid-attr-value",
      "aria-valid-attr",
      "aria-meter-name",
      "aria-progressbar-name",
      "aria-tooltip-name",
      "aria-treeitem-name",
      "duplicate-id-aria",
    ],
    groups: ["a11y-aria"],
    title: { es: "ARIA y semántica", en: "ARIA & semantics" },
    short: {
      es: "Código que las tecnologías de apoyo puedan interpretar.",
      en: "Code that assistive technologies can interpret.",
    },
    analyzed: {
      es: "Validamos roles y atributos ARIA: que existan, estén permitidos, tengan sus partes requeridas y no oculten elementos que reciben foco.",
      en: "We validate ARIA roles and attributes: that they exist, are allowed, include required parts and don’t hide focusable elements.",
    },
    strategies: {
      es: [
        "Primera regla de ARIA: si existe un elemento HTML nativo, usalo.",
        "Respetá la estructura de cada patrón (ej. `tablist` → `tab`).",
        "No pongas `aria-hidden` en elementos que reciben foco.",
        "Los IDs referenciados por ARIA tienen que ser únicos.",
      ],
      en: [
        "First rule of ARIA: if a native HTML element exists, use it.",
        "Follow each pattern’s structure (e.g. `tablist` → `tab`).",
        "Never put `aria-hidden` on focusable elements.",
        "IDs referenced by ARIA must be unique.",
      ],
    },
    resources: [
      { label: { es: "ARIA Authoring Practices Guide", en: "ARIA Authoring Practices Guide" }, href: "https://www.w3.org/WAI/ARIA/apg/" },
      { label: { es: "ARIA: leé esto primero", en: "ARIA: read me first" }, href: "https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/" },
      { label: { es: "WCAG 4.1.2 Nombre, función, valor", en: "WCAG 4.1.2 Name, role, value" }, href: U("name-role-value") },
    ],
  },
  {
    id: "touch",
    principle: "operable",
    wcag: ["1.4.4", "1.4.10", "2.5.8"],
    audits: ["meta-viewport", "target-size", "meta-refresh"],
    groups: ["a11y-best-practices"],
    title: { es: "Zoom y áreas táctiles", en: "Zoom & touch targets" },
    short: {
      es: "Que se pueda ampliar y tocar sin errores, sobre todo en mobile.",
      en: "Zoomable, and easy to tap without mistakes — especially on mobile.",
    },
    analyzed: {
      es: "Revisamos que el viewport no bloquee el zoom, que las áreas táctiles tengan tamaño suficiente y que la página no se recargue sola.",
      en: "We check the viewport doesn’t block zoom, touch targets are big enough and the page doesn’t refresh by itself.",
    },
    strategies: {
      es: [
        "No bloquees el zoom: quitá `user-scalable=no` y `maximum-scale` menor a 5.",
        "Áreas táctiles de al menos 24×24 px (ideal 44×44) con espacio entre sí.",
        "El contenido tiene que funcionar a 320 px de ancho sin scroll horizontal.",
        "Evitá `<meta http-equiv=\"refresh\">`: dejá que la persona controle los tiempos.",
      ],
      en: [
        "Don’t block zoom: remove `user-scalable=no` and `maximum-scale` below 5.",
        "Touch targets of at least 24×24 px (ideally 44×44) with spacing.",
        "Content must work at 320 px wide without horizontal scrolling.",
        "Avoid `<meta http-equiv=\"refresh\">` — let people control timing.",
      ],
    },
    resources: [
      { label: { es: "WCAG 2.5.8 Tamaño del objetivo", en: "WCAG 2.5.8 Target size (minimum)" }, href: U("target-size-minimum") },
      { label: { es: "WCAG 1.4.10 Reflow", en: "WCAG 1.4.10 Reflow" }, href: U("reflow") },
      { label: { es: "Accesibilidad mobile (W3C)", en: "Mobile accessibility (W3C)" }, href: "https://www.w3.org/WAI/standards-guidelines/mobile/" },
    ],
  },
  {
    id: "manual",
    principle: "all",
    wcag: [],
    audits: [],
    groups: [],
    title: { es: "Revisión manual", en: "Manual review" },
    short: {
      es: "Lo automático detecta solo una parte. Esto lo tiene que probar una persona.",
      en: "Automated tests catch only part of it. A person has to check these.",
    },
    analyzed: {
      es: "Lighthouse marca estos puntos como pruebas manuales: requieren navegar el sitio de verdad. Te los listamos para que no se pierdan.",
      en: "Lighthouse flags these as manual checks: they require actually navigating the site. We list them so they don’t get lost.",
    },
    strategies: {
      es: [
        "Recorré todo el sitio solo con `Tab`, `Shift+Tab`, `Enter` y `Esc`.",
        "Probá con lector de pantalla: VoiceOver (Mac/iOS), NVDA (Windows) o TalkBack (Android).",
        "Hacé zoom al 200% y verificá que nada se corte ni se superponga.",
        "Si podés, sumá pruebas con personas con discapacidad.",
      ],
      en: [
        "Go through the whole site using only `Tab`, `Shift+Tab`, `Enter` and `Esc`.",
        "Test with a screen reader: VoiceOver (Mac/iOS), NVDA (Windows) or TalkBack (Android).",
        "Zoom to 200% and check nothing gets cut off or overlaps.",
        "If you can, include testing with people with disabilities.",
      ],
    },
    resources: [
      { label: { es: "Easy Checks: primera revisión (W3C)", en: "Easy Checks (W3C)" }, href: "https://www.w3.org/WAI/test-evaluate/preliminary/" },
      { label: { es: "Cómo usan la web las personas con discapacidad", en: "How people with disabilities use the web" }, href: "https://www.w3.org/WAI/people-use-web/" },
      { label: { es: "Principios de accesibilidad (W3C)", en: "Accessibility principles (W3C)" }, href: "https://www.w3.org/WAI/fundamentals/accessibility-principles/" },
    ],
  },
];

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
