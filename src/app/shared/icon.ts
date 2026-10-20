import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Circle as path data so every icon is a plain list of paths. */
const c = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const rect = (x: number, y: number, w: number, h: number, r = 2) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;

const ICONS: Record<string, string[]> = {
  search: [c(11, 11, 7), 'm21 21-4.3-4.3'],
  bag: ['M6 7h12l1 13H5z', 'M9 7V6a3 3 0 0 1 6 0v1'],
  user: [c(12, 8, 4), 'M4 21a8 8 0 0 1 16 0'],
  users: [c(9, 8, 4), 'M2 21a7 7 0 0 1 14 0', 'M16 4.1a4 4 0 0 1 0 7.8', 'M22 21a7 7 0 0 0-4-6.3'],
  sliders: ['M4 6h10', 'M18 6h2', c(16, 6, 2), 'M4 12h4', 'M12 12h8', c(10, 12, 2), 'M4 18h12', 'M20 18h0', c(18, 18, 2)],
  'arrow-up-right': ['M7 17 17 7', 'M8 7h9v9'],
  'arrow-right': ['M5 12h14', 'm13 6 6 6-6 6'],
  'arrow-left': ['M19 12H5', 'm11 18-6-6 6-6'],
  'arrow-down': ['M12 5v14', 'm6 13 6 6 6-6'],
  'chevron-down': ['m6 9 6 6 6-6'],
  'chevron-right': ['m9 6 6 6-6 6'],
  'chevron-left': ['m15 6-6 6 6 6'],
  grid: [rect(3, 3, 7, 7), rect(14, 3, 7, 7), rect(3, 14, 7, 7), rect(14, 14, 7, 7)],
  rows: [rect(3, 4, 18, 7), rect(3, 13, 18, 7)],
  heart: ['M19.5 12.6 12 20l-7.5-7.4A5 5 0 0 1 12 6a5 5 0 0 1 7.5 6.6z'],
  star: ['m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z'],
  walk: [c(13, 4, 1.6), 'm7 21 3-7', 'm10 14 2 2v5', 'M8 9l4-2 3 3 3 1', 'M12 7l-2 7'],
  pin: ['M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z', c(12, 9, 2.5)],
  navigation: ['m3 11 18-8-8 18-2-8z'],
  clock: [c(12, 12, 9), 'M12 7v5l3 2'],
  home: ['M3 10.5 12 3l9 7.5', 'M5 9v11h14V9', 'M10 20v-6h4v6'],
  car: ['M5 17H3v-5l2-5a2 2 0 0 1 2-1.3h10A2 2 0 0 1 19 7l2 5v5h-2', 'M3 12h18', c(7.5, 17, 2), c(16.5, 17, 2), 'M9.5 17h5'],
  notes: [rect(5, 3, 14, 18), 'M9 8h6', 'M9 12h6', 'M9 16h3'],
  history: ['M3 12a9 9 0 1 0 3-6.7L3 8', 'M3 3v5h5', 'M12 7v5l3 2'],
  bell: ['M6 9a6 6 0 0 1 12 0c0 6 2.5 8 2.5 8h-17S6 15 6 9', 'M10 20a2 2 0 0 0 4 0'],
  chat: ['M21 12a8 8 0 0 1-11.7 7.1L4 20.5l1.4-5.1A8 8 0 1 1 21 12z'],
  license: [rect(3, 5, 18, 14), c(8.5, 11, 2), 'M5.5 16a3 3 0 0 1 6 0', 'M14 10h4', 'M14 14h3'],
  support: [c(12, 12, 9), c(12, 12, 4), 'm5.6 5.6 3.6 3.6', 'm14.8 14.8 3.6 3.6', 'm14.8 9.2 3.6-3.6', 'm5.6 18.4 3.6-3.6'],
  logout: ['M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3', 'M10 17l-5-5 5-5', 'M5 12h11'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  plus: ['M12 5v14', 'M5 12h14'],
  minus: ['M5 12h14'],
  check: ['m5 12 5 5 9-10'],
  info: [c(12, 12, 9), 'M12 11v5', 'M12 8h.01'],
  gauge: ['M4 18a9 9 0 1 1 16 0', 'm12 14 4-5', c(12, 14, 1.2)],
  zap: ['M13 2 4 14h7l-1 8 9-12h-7z'],
  fuel: ['M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16', 'M3 21h13', 'M4 10h11', 'M15 8h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3'],
  seat: ['M7 3h5a2 2 0 0 1 2 2l1 9H9z', 'M6 14h11a2 2 0 0 1 2 2v2H6z', 'M8 18v3', 'M17 18v3'],
  engine: [c(12, 12, 3), 'M12 2v3', 'M12 19v3', 'm4.9 4.9 2.1 2.1', 'm17 17 2.1 2.1', 'M2 12h3', 'M19 12h3', 'm4.9 19.1 2.1-2.1', 'm17 7 2.1-2.1'],
  shield: ['M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6z', 'm9 12 2 2 4-4'],
  cart: [c(9, 20, 1.3), c(18, 20, 1.3), 'M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6'],
  key: [c(7.5, 15.5, 4.5), 'm10.7 12.3 8.8-8.8', 'm16 7 3 3', 'm14 9 2 2'],
  card: [rect(2, 5, 20, 14), 'M2 10h20', 'M6 15h4'],
  'trend-up': ['m3 17 6-6 4 4 8-8', 'M15 7h6v6'],
  'trend-down': ['m3 7 6 6 4-4 8 8', 'M15 17h6v-6'],
  settings: [c(12, 12, 3), 'M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z'],
  edit: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z'],
  trash: ['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 14H6L5 6', 'M10 11v6', 'M14 11v6'],
  eye: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z', c(12, 12, 3)],
  menu: ['M4 6h16', 'M4 12h16', 'M4 18h16'],
  phone: ['M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z'],
  mail: [rect(2, 4, 20, 16), 'm22 7-10 6L2 7'],
  calendar: [rect(3, 4, 18, 18), 'M16 2v4', 'M8 2v4', 'M3 10h18'],
  send: ['m22 2-7 20-4-9-9-4z', 'M22 2 11 13'],
  crown: ['m2 7 5 5 5-8 5 8 5-5-2 12H4z'],
  sparkles: ['M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z', 'M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z'],
  more: [c(5, 12, 1), c(12, 12, 1), c(19, 12, 1)],
  download: ['M12 3v12', 'm7 10 5 5 5-5', 'M5 21h14'],
  map: ['m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z', 'M9 3v15', 'M15 6v15'],
  infinity: ['M12 12c-2-2.7-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.3 6-4zm0 0c2 2.7 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.3-6 4z'],
  award: [c(12, 9, 6), 'm8.2 13.6-1.7 7.9L12 18.5l5.5 3-1.7-7.9'],
  play: ['m7 4 13 8-13 8z'],
  filter: ['M3 5h18l-7 8.5V20l-4-2v-4.5z'],
  globe: [c(12, 12, 9), 'M3 12h18', 'M12 3a14 14 0 0 1 0 18', 'M12 3a14 14 0 0 0 0 18'],
  instagram: [rect(3, 3, 18, 18, 5), c(12, 12, 4), 'M17.5 6.5h.01'],
  telegram: ['m21 4-18 7 6 2 2 6 3-4 5 4z', 'm9 13 9-7'],
  youtube: [rect(2, 5, 20, 14, 4), 'm10 9 5 3-5 3z'],
  moon: ['M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z'],
  box: ['M21 8 12 3 3 8v8l9 5 9-5z', 'm3 8 9 5 9-5', 'M12 13v8'],
};

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      viewBox="0 0 24 24"
      [attr.width]="size()"
      [attr.height]="size()"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="stroke()"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @for (d of paths(); track $index) {
        <path [attr.d]="d" [attr.fill]="fill() ? 'currentColor' : null" />
      }
    </svg>
  `,
  styles: `
    :host { display: inline-flex; flex-shrink: 0; line-height: 0; }
  `,
})
export class Icon {
  readonly name = input.required<string>();
  readonly size = input(18);
  readonly stroke = input(1.7);
  readonly fill = input(false);
  protected readonly paths = computed(() => ICONS[this.name()] ?? []);
}
