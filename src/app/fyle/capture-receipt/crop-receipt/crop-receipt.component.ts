import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { Platform, ModalController } from '@ionic/angular';
import { LoaderService } from 'src/app/core/services/loader.service';

type Image = Partial<{
  source: string;
  base64Image: string;
}>;

@Component({
  selector: 'app-crop-receipt',
  templateUrl: './crop-receipt.component.html',
  styleUrls: ['./crop-receipt.component.scss'],
})
export class CropReceiptComponent implements OnInit {
  @Input() base64ImageWithSource: Image;

  @ViewChild('imageCropper') imageCropper: ImageCropperComponent;

  constructor(
    private modalController: ModalController,
    private loaderService: LoaderService,
    private platform: Platform
  ) {
    this.registerBackButtonAction();
  }

  ngOnInit() {
    this.loaderService.showLoader();
  }

  cropReceipt() {
    this.base64ImageWithSource.base64Image = this.imageCropper.crop().base64;
    this.modalController.dismiss({
      base64ImageWithSource: this.base64ImageWithSource,
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  imageLoaded() {
    this.loaderService.hideLoader();
  }

  registerBackButtonAction() {
    console.log('Back button action registered for crop receipt');
    this.platform.backButton.subscribe(() => {
      console.log('Closing crop receipt modal');
      this.closeModal();
    });
  }
}
