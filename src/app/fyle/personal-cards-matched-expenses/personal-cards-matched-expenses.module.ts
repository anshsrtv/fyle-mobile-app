import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { PersonalCardsMatchedExpensesPageRoutingModule } from './personal-cards-matched-expenses-routing.module';

import { PersonalCardsMatchedExpensesPage } from './personal-cards-matched-expenses.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PersonalCardsMatchedExpensesPageRoutingModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatRippleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatBottomSheetModule,
    MatSnackBarModule,
    SharedModule,
    MatCheckboxModule
  ],
  declarations: [PersonalCardsMatchedExpensesPage]
})
export class PersonalCardsMatchedExpensesPageModule {}
