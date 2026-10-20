import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { DecimalPipe } from '@angular/common';

/** Histogram-backed dual-thumb price slider. */
@Component({
  selector: 'app-price-range',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="hist" [class.hist--tall]="tall()">
      @for (b of bars(); track $index) {
        <span [style.height.%]="b.h" [class.on]="b.on"></span>
      }
    </div>
    <div class="slider">
      <div class="track"></div>
      <div class="fill" [style.left.%]="pct(low())" [style.right.%]="100 - pct(high())"></div>
      <input type="range" [min]="min()" [max]="max()" [step]="step()" [value]="low()"
        aria-label="Minimal narx" (input)="setLow($any($event.target))" />
      <input type="range" [min]="min()" [max]="max()" [step]="step()" [value]="high()"
        aria-label="Maksimal narx" (input)="setHigh($any($event.target))" />
    </div>
    <div class="inputs">
      <label class="box">
        <span>{{ fromLabel() }}</span>
        <b>{{ prefix() }}{{ low() | number: '1.0-2' }}</b>
      </label>
      <span class="dash">–</span>
      <label class="box">
        <span>{{ toLabel() }}</span>
        <b>{{ prefix() }}{{ high() | number: '1.0-2' }}</b>
      </label>
    </div>
  `,
  styles: `
    :host { display: block; }
    .hist { display: flex; align-items: flex-end; gap: 2px; height: 44px; padding: 0 9px; }
    .hist--tall { height: 64px; }
    .hist span { flex: 1; min-height: 3px; border-radius: 2px 2px 0 0; background: var(--line-2); transition: background .2s, height .4s var(--ease); }
    .hist span.on { background: var(--ink); }
    .slider { position: relative; height: 18px; margin-top: -1px; }
    .track, .fill { position: absolute; top: 0; height: 3px; border-radius: 2px; }
    .track { left: 9px; right: 9px; background: var(--line-2); }
    .fill { background: var(--ink); margin: 0 9px; }
    input[type='range'] {
      position: absolute; inset: -8px 0 auto; width: 100%; height: 18px; margin: 0;
      appearance: none; background: none; pointer-events: none;
    }
    input[type='range']::-webkit-slider-thumb {
      appearance: none; pointer-events: auto; width: 18px; height: 18px; border-radius: 50%;
      background: #fff; border: 2.5px solid var(--ink); cursor: grab; box-shadow: var(--shadow-sm);
      transition: transform .2s var(--ease);
    }
    input[type='range']::-webkit-slider-thumb:active { transform: scale(1.15); cursor: grabbing; }
    input[type='range']::-moz-range-thumb {
      pointer-events: auto; width: 14px; height: 14px; border-radius: 50%;
      background: #fff; border: 2.5px solid var(--ink); cursor: grab;
    }
    .inputs { display: flex; align-items: center; gap: 8px; margin-top: 12px; }
    .box {
      flex: 1; display: flex; align-items: center; justify-content: space-between; gap: 6px;
      height: 40px; padding: 0 12px; border-radius: var(--radius-sm); background: var(--surface-2);
      font-size: 12px; min-width: 0;
    }
    .box span { color: var(--muted); text-transform: uppercase; letter-spacing: .06em; font-size: 10px; }
    .box b { font-weight: 600; font-size: 13px; white-space: nowrap; }
    .dash { color: var(--muted); }
  `,
})
export class PriceRange {
  readonly values = input.required<number[]>();
  readonly min = input.required<number>();
  readonly max = input.required<number>();
  readonly step = input(500);
  readonly buckets = input(28);
  readonly prefix = input('$');
  readonly fromLabel = input('dan');
  readonly toLabel = input('gacha');
  readonly tall = input(false);
  readonly low = model.required<number>();
  readonly high = model.required<number>();

  protected readonly bars = computed(() => {
    const n = this.buckets();
    const min = this.min();
    const span = Math.max(1, this.max() - min);
    const counts = new Array(n).fill(0);
    for (const v of this.values()) {
      counts[Math.min(n - 1, Math.floor(((v - min) / span) * n))]++;
    }
    // Smooth the distribution a little so sparse data still reads as a histogram.
    const smooth = counts.map((v, i) => v * 2 + (counts[i - 1] ?? 0) + (counts[i + 1] ?? 0) + 0.6);
    const peak = Math.max(...smooth);
    return smooth.map((v, i) => {
      const at = min + ((i + 0.5) / n) * span;
      return { h: (v / peak) * 100, on: at >= this.low() && at <= this.high() };
    });
  });

  protected pct(v: number): number {
    return ((v - this.min()) / Math.max(1, this.max() - this.min())) * 100;
  }

  protected setLow(el: HTMLInputElement): void {
    this.low.set(Math.min(el.valueAsNumber, this.high() - this.step()));
    el.value = String(this.low());
  }

  protected setHigh(el: HTMLInputElement): void {
    this.high.set(Math.max(el.valueAsNumber, this.low() + this.step()));
    el.value = String(this.high());
  }
}
