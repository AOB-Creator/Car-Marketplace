import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

export interface Series {
  name: string;
  color: string;
  values: number[];
}

const W = 600;
const H = 220;

function linePath(values: number[], max: number): string {
  const step = W / (values.length - 1);
  const pts = values.map((v, i) => [i * step, H - (v / max) * (H - 12)] as const);
  // Monotone-ish cubic smoothing.
  return pts
    .map(([x, y], i) => {
      if (i === 0) return `M${x},${y}`;
      const [px, py] = pts[i - 1];
      const cx = (px + x) / 2;
      return `C${cx},${py} ${cx},${y} ${x},${y}`;
    })
    .join(' ');
}

/** Smoothed multi-series area chart with hover crosshair. */
@Component({
  selector: 'app-area-chart',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="plot" (pointermove)="track($event)" (pointerleave)="hover.set(null)">
      <div class="y">
        @for (t of ticks(); track t) { <span>{{ prefix() }}{{ t | number: '1.0-0' }}{{ suffix() }}</span> }
      </div>
      <div class="area">
        <svg [attr.viewBox]="'0 0 ' + W + ' ' + H" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            @for (s of series(); track s.name; let i = $index) {
              <linearGradient [attr.id]="uid + i" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" [attr.stop-color]="s.color" stop-opacity="0.22" />
                <stop offset="1" [attr.stop-color]="s.color" stop-opacity="0" />
              </linearGradient>
            }
          </defs>
          @for (t of ticks(); track t) {
            <line x1="0" [attr.x2]="W" [attr.y1]="H - (t / max()) * (H - 12)" [attr.y2]="H - (t / max()) * (H - 12)"
              stroke="var(--line)" stroke-dasharray="3 5" vector-effect="non-scaling-stroke" />
          }
          @for (p of paths(); track p.name; let i = $index) {
            <path [attr.d]="p.d + ' L' + W + ',' + H + ' L0,' + H + ' Z'" [attr.fill]="'url(#' + uid + i + ')'" />
            <path [attr.d]="p.d" fill="none" [attr.stroke]="p.color" stroke-width="2.2" vector-effect="non-scaling-stroke"
              [attr.stroke-dasharray]="i > 0 ? '5 5' : null" class="line" />
          }
          @if (hover() !== null) {
            <line [attr.x1]="x(hover()!)" [attr.x2]="x(hover()!)" y1="0" [attr.y2]="H" stroke="var(--ink)" stroke-opacity=".25" vector-effect="non-scaling-stroke" />
          }
        </svg>
        @if (hover() !== null) {
          @for (s of series(); track s.name) {
            <span class="dot" [style.left.%]="(x(hover()!) / W) * 100" [style.top.%]="(y(s.values[hover()!]) / H) * 100" [style.border-color]="s.color"></span>
          }
          <div class="tip" [style.left.%]="(x(hover()!) / W) * 100" [class.tip--left]="hover()! > labels().length / 2">
            <b>{{ labels()[hover()!] }}</b>
            @for (s of series(); track s.name) {
              <div><i [style.background]="s.color"></i>{{ s.name }} <strong>{{ prefix() }}{{ s.values[hover()!] | number }}{{ suffix() }}</strong></div>
            }
          </div>
        }
      </div>
    </div>
    <div class="x">
      @for (l of labels(); track $index; let i = $index) { <span [class.on]="hover() === i">{{ l }}</span> }
    </div>
  `,
  styles: `
    :host { display: block; }
    .plot { display: grid; grid-template-columns: auto 1fr; gap: 10px; height: var(--h, 240px); }
    .y { display: flex; flex-direction: column-reverse; justify-content: space-between; padding-bottom: 0; font-size: 11px; color: var(--muted-2); text-align: right; }
    .y span { transform: translateY(50%); }
    .y span:last-child { transform: translateY(0); }
    .area { position: relative; }
    svg { width: 100%; height: 100%; overflow: visible; }
    .line { stroke-dashoffset: 0; animation: draw 1.4s var(--ease) both; }
    .dot { position: absolute; width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 3px solid; transform: translate(-50%, -50%); pointer-events: none; }
    .tip {
      position: absolute; top: 4px; transform: translateX(14px); min-width: 160px; padding: 10px 12px;
      border-radius: 12px; background: var(--ink); color: #fff; font-size: 12px; pointer-events: none;
      box-shadow: var(--shadow); z-index: 2;
    }
    .tip--left { transform: translateX(calc(-100% - 14px)); }
    .tip b { display: block; margin-bottom: 6px; font-weight: 600; }
    .tip div { display: flex; align-items: center; gap: 6px; color: rgba(255,255,255,.7); }
    .tip strong { margin-left: auto; padding-left: 12px; color: #fff; font-weight: 600; }
    .tip i { width: 8px; height: 8px; border-radius: 2px; }
    .x { display: flex; justify-content: space-between; margin: 10px 0 0 var(--yw, 44px); font-size: 11px; color: var(--muted-2); }
    .x .on { color: var(--ink); font-weight: 600; }
    @keyframes draw { from { stroke-dasharray: 0 2000; } }
  `,
})
export class AreaChart {
  readonly series = input.required<Series[]>();
  readonly labels = input.required<string[]>();
  readonly prefix = input('');
  readonly suffix = input('');

  protected readonly W = W;
  protected readonly H = H;
  protected readonly uid = `ac${Math.random().toString(36).slice(2, 8)}`;
  protected readonly hover = signal<number | null>(null);

  protected readonly max = computed(() => {
    const peak = Math.max(...this.series().flatMap((s) => s.values));
    const mag = Math.pow(10, Math.floor(Math.log10(peak)));
    return Math.ceil((peak * 1.1) / mag) * mag;
  });
  protected readonly ticks = computed(() => [0, 1, 2, 3, 4].map((i) => (this.max() / 4) * i));
  protected readonly paths = computed(() => this.series().map((s) => ({ ...s, d: linePath(s.values, this.max()) })));

  protected x(i: number): number {
    return (i * W) / (this.labels().length - 1);
  }

  protected y(v: number): number {
    return H - (v / this.max()) * (H - 12);
  }

  protected track(e: PointerEvent): void {
    const area = (e.currentTarget as HTMLElement).querySelector('.area')!.getBoundingClientRect();
    const rel = (e.clientX - area.left) / area.width;
    if (rel < -0.02 || rel > 1.02) return this.hover.set(null);
    const n = this.labels().length - 1;
    this.hover.set(Math.max(0, Math.min(n, Math.round(rel * n))));
  }
}

/** Rounded vertical bars. */
@Component({
  selector: 'app-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bars">
      @for (v of values(); track $index; let i = $index) {
        <div class="col" [class.on]="i === highlight()" [title]="labels()[i] + ': ' + v">
          <span class="val">{{ v }}</span>
          <div class="bar" [style.height.%]="(v / max()) * 100" [style.animation-delay.ms]="i * 40"></div>
          <span class="lbl">{{ labels()[i] }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .bars { display: flex; align-items: stretch; gap: 8px; height: var(--h, 180px); }
    .col { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 6px; min-width: 0; }
    .bar { width: 100%; max-width: 34px; min-height: 4px; border-radius: 8px; background: repeating-linear-gradient(135deg, var(--surface-3) 0 6px, var(--surface-2) 6px 12px); transform-origin: bottom; animation: grow .9s var(--ease) both; transition: background .2s; }
    .col:hover .bar { background: var(--line-2); }
    .col.on .bar { background: var(--ink); }
    .val { font-size: 11px; font-weight: 600; opacity: 0; transition: opacity .2s; }
    .col:hover .val, .col.on .val { opacity: 1; }
    .lbl { font-size: 11px; color: var(--muted-2); }
    .col.on .lbl { color: var(--ink); font-weight: 600; }
    @keyframes grow { from { transform: scaleY(0); } }
  `,
})
export class BarChart {
  readonly values = input.required<number[]>();
  readonly labels = input.required<string[]>();
  readonly highlight = input(-1);
  protected readonly max = computed(() => Math.max(...this.values(), 1));
}

/** Donut with a centred total. */
@Component({
  selector: 'app-donut',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="48" fill="none" stroke="var(--surface-2)" stroke-width="14" />
        @for (s of arcs(); track s.label; let i = $index) {
          <circle cx="60" cy="60" r="48" fill="none" [attr.stroke]="s.color" stroke-width="14"
            [attr.stroke-dasharray]="s.len + ' ' + (C - s.len)" [attr.stroke-dashoffset]="-s.offset"
            [class.dim]="active() !== null && active() !== i" (mouseenter)="active.set(i)" (mouseleave)="active.set(null)" />
        }
      </svg>
      <div class="center">
        @if (active() !== null) {
          <b>{{ items()[active()!].value | number }}</b><span>{{ items()[active()!].label }}</span>
        } @else {
          <b>{{ total() | number }}</b><span>{{ caption() }}</span>
        }
      </div>
    </div>
    <ul>
      @for (s of items(); track s.label; let i = $index) {
        <li (mouseenter)="active.set(i)" (mouseleave)="active.set(null)" [class.on]="active() === i">
          <i [style.background]="s.color"></i>{{ s.label }}<b>{{ ((s.value / total()) * 100).toFixed(0) }}%</b>
        </li>
      }
    </ul>
  `,
  styles: `
    :host { display: flex; align-items: center; gap: 24px; }
    .wrap { position: relative; width: 150px; height: 150px; flex-shrink: 0; }
    svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    circle { transition: opacity .25s, stroke-width .25s; cursor: pointer; }
    circle.dim { opacity: .25; }
    .center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
    .center b { font-size: 22px; font-weight: 600; letter-spacing: -.02em; }
    .center span { font-size: 11px; color: var(--muted); max-width: 90px; }
    ul { flex: 1; margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 4px; }
    li { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 8px; font-size: 12px; cursor: default; transition: background .2s; }
    li.on { background: var(--surface-2); }
    li i { width: 10px; height: 10px; border-radius: 3px; }
    li b { margin-left: auto; font-weight: 600; }
  `,
})
export class Donut {
  readonly items = input.required<{ label: string; value: number; color: string }[]>();
  readonly caption = input('Jami');
  protected readonly C = 2 * Math.PI * 48;
  protected readonly active = signal<number | null>(null);
  protected readonly total = computed(() => this.items().reduce((a, b) => a + b.value, 0) || 1);
  protected readonly arcs = computed(() => {
    let offset = 0;
    return this.items().map((s) => {
      const len = (s.value / this.total()) * this.C;
      const arc = { ...s, len: Math.max(0, len - 2), offset };
      offset += len;
      return arc;
    });
  });
}

/** Tiny inline trend line. */
@Component({
  selector: 'app-sparkline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
      <path [attr.d]="d() + ' L100,32 L0,32 Z'" [attr.fill]="color()" fill-opacity=".12" />
      <path [attr.d]="d()" fill="none" [attr.stroke]="color()" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round" />
    </svg>
  `,
  styles: `:host { display: block; width: 100%; height: 36px; } svg { width: 100%; height: 100%; }`,
})
export class Sparkline {
  readonly values = input.required<number[]>();
  readonly color = input('var(--ink)');
  protected readonly d = computed(() => {
    const v = this.values();
    const min = Math.min(...v);
    const span = Math.max(...v) - min || 1;
    return v.map((n, i) => `${i ? 'L' : 'M'}${(i / (v.length - 1)) * 100},${30 - ((n - min) / span) * 26}`).join(' ');
  });
}
