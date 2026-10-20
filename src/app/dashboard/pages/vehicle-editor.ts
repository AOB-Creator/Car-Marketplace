import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { BODIES, BRANDS, FUELS } from '../../core/data/cars.data';
import { Car, CarColor, CarStatus, FuelType } from '../../core/models';
import { CarImage } from '../../shared/car-image';
import { Icon } from '../../shared/icon';

const PALETTE: CarColor[] = [
  { name: 'Oq', hex: '#f2f2f0', paint: 'white' },
  { name: 'Qora', hex: '#111113', paint: 'black' },
  { name: 'Kulrang', hex: '#7d858c', paint: 'grey' },
  { name: 'Kumush', hex: '#c4c7cb', paint: 'silver' },
  { name: 'Yashil', hex: '#1f6b4f', paint: 'green' },
  { name: 'Ko‘k', hex: '#1d4fbf', paint: 'blue' },
  { name: 'Qizil', hex: '#b3121d', paint: 'red' },
  { name: 'Bronza', hex: '#d39a6a', paint: 'orange' },
];

const slug = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

@Component({
  selector: 'app-vehicle-editor',
  imports: [ReactiveFormsModule, CarImage, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vehicle-editor.html',
  styleUrl: './vehicle-editor.scss',
  host: { '(document:keydown.escape)': 'closed.emit()' },
})
export class VehicleEditor implements OnInit {
  /** null = create a new car. */
  readonly car = input.required<Car | null>();
  readonly saved = output<Car>();
  readonly closed = output<void>();

  protected readonly brands = BRANDS;
  protected readonly bodies = BODIES;
  protected readonly fuelsList = FUELS;
  protected readonly palette = PALETTE;
  protected readonly statuses: CarStatus[] = ['Sotuvda', 'Band', 'Servisda', 'Sotilgan'];

  private readonly fb = inject(FormBuilder).nonNullable;
  protected readonly form = this.fb.group({
    make: ['BMW', Validators.required],
    model: ['', [Validators.required, Validators.maxLength(40)]],
    trim: [''],
    year: [2025, [Validators.required, Validators.min(1990), Validators.max(2027)]],
    body: this.fb.control<Car['body']>('Sedan'),
    transmission: this.fb.control<Car['transmission']>('Avtomat'),
    drive: this.fb.control<Car['drive']>('AWD'),
    engine: ['', Validators.required],
    hp: [300, [Validators.required, Validators.min(50)]],
    torque: [400, [Validators.required, Validators.min(50)]],
    accel: [5.5, [Validators.required, Validators.min(1.5)]],
    topSpeed: [240, [Validators.required, Validators.min(100)]],
    seats: [5, [Validators.required, Validators.min(1), Validators.max(9)]],
    price: [45000, [Validators.required, Validators.min(1000)]],
    rentPerDay: [120, [Validators.required, Validators.min(10)]],
    status: this.fb.control<CarStatus>('Sotuvda'),
    location: ['Toshkent, Yunusobod'],
    featured: [false],
  });

  protected readonly fuels = signal<FuelType[]>(['Benzin']);
  protected readonly colors = signal<CarColor[]>([PALETTE[0], PALETTE[1]]);
  protected readonly submitted = signal(false);

  private readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  /** Live preview built from the current form state. */
  protected readonly preview = computed<Car>(() => {
    const v = { ...this.form.getRawValue(), ...this.value() };
    const base = this.car();
    return {
      ...(base ?? ({} as Car)),
      ...v,
      id: base?.id ?? slug(`${v.make}-${v.model}-${v.trim}`) + '-' + Date.now().toString(36),
      fuel: this.fuels(),
      colors: this.colors().length ? this.colors() : [PALETTE[0]],
      render: { make: slug(v.make.replace('Mercedes-Benz', 'mercedes')), model: slug(v.model.split(' ')[0] || 'x') },
      rating: base?.rating ?? 5,
      reviews: base?.reviews ?? 0,
      distance: base?.distance ?? 150,
      mileage: base?.mileage ?? 0,
      addedAt: base?.addedAt ?? new Date().toISOString(),
      description:
        base?.description ??
        `${v.make} ${v.model} ${v.trim} — ${v.engine} dvigateli, ${v.hp} o.k. quvvat va ${v.torque} N·m moment.`,
    } as Car;
  });

  ngOnInit(): void {
    const c = this.car();
    if (c) {
      this.form.patchValue(c);
      this.fuels.set([...c.fuel]);
      this.colors.set(c.colors.map((x) => PALETTE.find((p) => p.paint === x.paint && p.hex === x.hex) ?? x));
    }
  }

  protected toggleFuel(f: FuelType): void {
    this.fuels.update((l) => (l.includes(f) ? l.filter((x) => x !== f) : [...l, f]));
  }

  protected toggleColor(c: CarColor): void {
    this.colors.update((l) => (l.some((x) => x.hex === c.hex) ? l.filter((x) => x.hex !== c.hex) : [...l, c]));
  }

  protected hasColor(c: CarColor): boolean {
    return this.colors().some((x) => x.hex === c.hex);
  }

  protected invalid(name: keyof typeof this.form.controls): boolean {
    const ctrl = this.form.controls[name];
    return ctrl.invalid && (ctrl.touched || this.submitted());
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid || !this.fuels().length) {
      this.form.markAllAsTouched();
      return;
    }
    this.saved.emit(this.preview());
  }
}
