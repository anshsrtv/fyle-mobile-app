import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// pipe imports
import { EllipsisPipe } from './pipes/ellipses.pipe';
import { HumanizeCurrencyPipe } from './pipes/humanize-currency.pipe';
import { ReportState } from './pipes/report-state.pipe';
import { SnakeCaseToSpaceCase } from './pipes/snake_case_to_space_case.pipe';
import { FySelectComponent } from './components/fy-select/fy-select.component';
import { FySelectModalComponent } from './components/fy-select/fy-select-modal/fy-select-modal.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { IonicModule } from '@ionic/angular';
import { FyLocationComponent } from './components/fy-location/fy-location.component';
import { FyMultiselectComponent } from './components/fy-multiselect/fy-multiselect.component';
import { FyUserlistComponent } from './components/fy-userlist/fy-userlist.component';
import { FyLocationModalComponent } from './components/fy-location/fy-location-modal/fy-location-modal.component';
import { FyMultiselectModalComponent } from './components/fy-multiselect/fy-multiselect-modal/fy-multiselect-modal.component';
import { FyUserlistModalComponent } from './components/fy-userlist/fy-userlist-modal/fy-userlist-modal.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FyAlertComponent } from './components/fy-alert/fy-alert.component';
import { FyDuplicateDetectionComponent } from './components/fy-duplicate-detection/fy-duplicate-detection.component';
import { FyDuplicateDetectionModalComponent } from './components/fy-duplicate-detection/fy-duplicate-detection-modal/fy-duplicate-detection-modal.component';
import { AdvanceState } from './pipes/advance-state.pipe';
import { InitialsPipe } from './pipes/initials.pipe';
import { DatePipe, DecimalPipe } from '@angular/common';

// component imports
import { DelegatedAccMessageComponent } from './components/delegated-acc-message/delegated-acc-message.component';
import { IconModule } from './icon/icon.module';
import { CurrencyComponent } from './components/currency/currency.component';
import { CommentsComponent } from './components/comments/comments.component';
import { ViewCommentComponent } from './components/comments/view-comment/view-comment.component';
import { FyPreviewAttachmentsComponent } from './components/fy-preview-attachments/fy-preview-attachments.component';


@NgModule({
  declarations: [
    AdvanceState,
    InitialsPipe,
    EllipsisPipe,
    HumanizeCurrencyPipe,
    ReportState,
    SnakeCaseToSpaceCase,
    FySelectComponent,
    FySelectModalComponent,
    FyLocationComponent,
    FyMultiselectComponent,
    FyUserlistComponent,
    FyLocationModalComponent,
    FyMultiselectModalComponent,
    FyUserlistModalComponent,
    FyAlertComponent,
    FyDuplicateDetectionComponent,
    FyDuplicateDetectionModalComponent,
    DelegatedAccMessageComponent,
    CurrencyComponent,
    CommentsComponent,
    ViewCommentComponent,
    FyPreviewAttachmentsComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatCheckboxModule
  ],
  exports: [
    EllipsisPipe,
    HumanizeCurrencyPipe,
    ReportState,
    SnakeCaseToSpaceCase,
    FySelectComponent,
    FyLocationComponent,
    FyMultiselectComponent,
    FyUserlistComponent,
    FyAlertComponent,
    FyDuplicateDetectionComponent,
    AdvanceState,
    SnakeCaseToSpaceCase,
    InitialsPipe,
    DelegatedAccMessageComponent,
    IconModule,
    CurrencyComponent,
    CommentsComponent,
    FyPreviewAttachmentsComponent
  ],
  providers: [
    DecimalPipe,
    DatePipe,
  ]
})
export class SharedModule { }
