import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-share-report',
  templateUrl: './share-report.component.html',
  styleUrls: ['./share-report.component.scss'],
})
export class ShareReportComponent implements OnInit {
  email = '';

  constructor(
    private popoverController: PopoverController
  ) { }

  async cancel() {
    await this.popoverController.dismiss();
  }

  shareReport() {
    this.popoverController.dismiss({
      email: this.email
    });
  }

  ngOnInit() { }
}
