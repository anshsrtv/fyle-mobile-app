import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { FooterState } from './footer-state';
import { NetworkService } from '../../../core/services/network.service';
import { ConnectionMessageStatus } from '../fy-connection/connection-status.enum';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-fy-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {

  @Output() homeClicked = new EventEmitter();
  @Output() cameraClicked = new EventEmitter();
  @Output() taskClicked = new EventEmitter();

  @Input() activeState: FooterState;

  connectionState$: Observable<ConnectionMessageStatus>;

  get ConnectionMessageStatus() {
    return ConnectionMessageStatus;
  }

  get FooterState() {
    return FooterState;
  }

  constructor(
    private networkService: NetworkService,
    private trackingService: TrackingService,
    private router: Router
  ) { }

  ngOnInit() {
    this.connectionState$ = this.networkService.getConnectionStatus();
  }

  goToHome() {
    this.trackingService.footerButtonClicked({
      Asset: 'Mobile',
      Action: 'Home',
      Url: this.router.url
    });

    this.homeClicked.emit();
  }

  goToCameraMode() {
    this.trackingService.footerButtonClicked({
      Asset: 'Mobile',
      Action: 'Camera',
      Url: this.router.url
    });

    this.cameraClicked.emit();
  }

<<<<<<< HEAD
  goToTasks(connectionState) {
    if (connectionState !== ConnectionMessageStatus.disconnected) {
      this.taskClicked.emit();
    }
=======
  goToTasks() {
    this.trackingService.footerButtonClicked({
      Asset: 'Mobile',
      Action: 'Tasks',
      Url: this.router.url
    });

    this.taskClicked.emit();
>>>>>>> master
  }
}
