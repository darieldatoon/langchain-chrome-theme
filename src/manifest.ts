import {
  type ChromeColorKey,
  type Rgb,
  chromeColors,
  toRgb,
} from './chrome.ts';
import { type TokenFile, type Variant, palette, tokenTable } from './tokens.ts';

export type ThemeSpec = {
  readonly variant: Variant;
  readonly name: string;
  /** Folder under themes/; also the release zip's name. */
  readonly dir: string;
  /**
   * Chrome styles a New Tab page with a theme image for a dark image (white
   * logo and links, a top scrim), so only the dark theme ships one.
   */
  readonly ntpImage: boolean;
};

export const THEMES: readonly ThemeSpec[] = [
  {
    variant: 'light',
    name: 'LangChain Light',
    dir: 'langchain-light',
    ntpImage: false,
  },
  {
    variant: 'dark',
    name: 'LangChain Dark',
    dir: 'langchain-dark',
    ntpImage: true,
  },
];

export const ICON_SIZES = [16, 32, 48, 128] as const;

/**
 * New Tab background, relative to a theme folder. One 1x file: the art is soft
 * gradients, and a 200_percent copy would quadruple its weight for no detail.
 */
export const NTP_IMAGE = 'images/ntp.png';

export type Manifest = {
  readonly manifest_version: 3;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly icons: Readonly<Record<string, string>>;
  readonly theme: {
    readonly colors: Readonly<Record<ChromeColorKey, Rgb>>;
    readonly images?: { readonly theme_ntp_background: typeof NTP_IMAGE };
    readonly properties?: {
      readonly ntp_background_alignment: 'center';
      readonly ntp_background_repeat: 'no-repeat';
      /** 1: the white Google logo, for a dark New Tab image. */
      readonly ntp_logo_alternate: 1;
    };
  };
};

export const iconPath = (size: number) => `icons/icon-${size}.png`;

export function buildManifest(
  file: TokenFile,
  spec: ThemeSpec,
  version: string
): Manifest {
  const colors = chromeColors(palette(tokenTable(file, spec.variant)));
  return {
    manifest_version: 3,
    name: spec.name,
    version,
    description: `${spec.name}: Chrome colors from LangChain's Macaw design system.`,
    icons: Object.fromEntries(ICON_SIZES.map((s) => [String(s), iconPath(s)])),
    theme: {
      colors: Object.fromEntries(
        Object.entries(colors).map(([key, hex]) => [key, toRgb(hex)])
      ) as Record<ChromeColorKey, Rgb>,
      ...(spec.ntpImage
        ? {
            images: { theme_ntp_background: NTP_IMAGE },
            properties: {
              ntp_background_alignment: 'center',
              ntp_background_repeat: 'no-repeat',
              ntp_logo_alternate: 1,
            },
          }
        : {}),
    },
  };
}

export const renderManifest = (manifest: Manifest): string =>
  `${JSON.stringify(manifest, null, 2)}\n`;
