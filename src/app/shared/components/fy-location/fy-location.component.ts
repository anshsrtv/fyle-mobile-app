import { Component, OnInit, forwardRef, Input, Injector } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NgControl } from '@angular/forms';
import { noop } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { FyLocationModalComponent } from './fy-location-modal/fy-location-modal.component';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';

@Component({
  selector: 'app-fy-location',
  templateUrl: './fy-location.component.html',
  styleUrls: ['./fy-location.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FyLocationComponent),
      multi: true
    }
  ]
})
export class FyLocationComponent implements ControlValueAccessor, OnInit {

  @Input() label = 'location';

  @Input() mandatory = false;

  @Input() disabled = false;

  @Input() allowCustom = false;

  @Input() hideSuffix = false;

  @Input() recentLocations: string[] = [];

  @Input() cacheName;

  displayValue;

  private ngControl: NgControl;

  private innerValue;

  get valid() {
    if (this.ngControl.touched) {
      return this.ngControl.valid;
    } else {
      return true;
    }
  }

  private onTouchedCallback: () => void = noop;

  private onChangeCallback: (_: any) => void = noop;

  constructor(
    private modalController: ModalController,
    private modalProperties: ModalPropertiesService,
    private injector: Injector
  ) { }

  ngOnInit() {
    this.ngControl = this.injector.get(NgControl);
    console.log(this.recentLocations);
  }

  get value(): any {
    return this.innerValue;
  }

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      const selectedOption = this.innerValue;
      if (selectedOption) {
        this.displayValue = selectedOption.display;
      } else {
        this.displayValue = '';
      }

      this.onChangeCallback(v);
    }
  }

  async openModal() {
    if (!this.disabled) {
      const selectionModal = await this.modalController.create({
        component: FyLocationModalComponent,
        componentProps: {
          currentSelection: this.value,
          allowCustom: this.allowCustom,
          recentLocations: this.recentLocations,
          cacheName: this.cacheName
        }
      });

      await selectionModal.present();

      const { data } = await selectionModal.onWillDismiss();

      if (data) {
        this.value = data.selection;
      }
    }
  }

  onBlur() {
    this.onTouchedCallback();
  }

  writeValue(value: any): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
      const selectedOption = this.innerValue;
      if (selectedOption) {
        this.displayValue = selectedOption.display;
      } else {
        this.displayValue = '';
      }
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
