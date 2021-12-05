// TODO: Very hard to fix this file without making massive changes
/* eslint-disable complexity */
import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import {
  combineLatest,
  concat,
  EMPTY,
  forkJoin,
  from,
  iif,
  merge,
  noop,
  Observable,
  of,
  Subject,
  throwError,
} from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  mergeMap,
  reduce,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
  timeout,
  withLatestFrom,
} from 'rxjs/operators';
import { scan } from 'rxjs/operators';
import { AccountsService } from 'src/app/core/services/accounts.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { AuthService } from 'src/app/core/services/auth.service';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoriesService } from 'src/app/core/services/categories.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { DateService } from 'src/app/core/services/date.service';
import * as moment from 'moment';
import { ReportService } from 'src/app/core/services/report.service';
import { CustomInputsService } from 'src/app/core/services/custom-inputs.service';
import { CustomFieldsService } from 'src/app/core/services/custom-fields.service';
import { cloneDeep, isEqual, isNull, isNumber, mergeWith } from 'lodash';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { DataTransformService } from 'src/app/core/services/data-transform.service';
import { PolicyService } from 'src/app/core/services/policy.service';
import { TransactionsOutboxService } from 'src/app/core/services/transactions-outbox.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { DuplicateDetectionService } from 'src/app/core/services/duplicate-detection.service';
import { ActionSheetController, ModalController, NavController, PopoverController } from '@ionic/angular';
import { FyCriticalPolicyViolationComponent } from 'src/app/shared/components/fy-critical-policy-violation/fy-critical-policy-violation.component';
import { StatusService } from 'src/app/core/services/status.service';
import { FileService } from 'src/app/core/services/file.service';
import { CurrencyService } from 'src/app/core/services/currency.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { PopupService } from 'src/app/core/services/popup.service';
import { CorporateCreditCardExpenseSuggestionsService } from '../../core/services/corporate-credit-card-expense-suggestions.service';
import { CorporateCreditCardExpenseService } from '../../core/services/corporate-credit-card-expense.service';
import { TrackingService } from '../../core/services/tracking.service';
import { RecentLocalStorageItemsService } from 'src/app/core/services/recent-local-storage-items.service';
import { TokenService } from 'src/app/core/services/token.service';
import { RecentlyUsedItemsService } from 'src/app/core/services/recently-used-items.service';
import { RecentlyUsed } from 'src/app/core/models/v1/recently_used.model';
import { OrgUserSettings } from 'src/app/core/models/org_user_settings.model';
import { OrgCategory, OrgCategoryListItem } from 'src/app/core/models/v1/org-category.model';
import { ExtendedProject } from 'src/app/core/models/v2/extended-project.model';
import { CostCenter } from 'src/app/core/models/v1/cost-center.model';
import { FyViewAttachmentComponent } from 'src/app/shared/components/fy-view-attachment/fy-view-attachment.component';
import { ExpenseFieldsService } from 'src/app/core/services/expense-fields.service';
import { ModalPropertiesService } from 'src/app/core/services/modal-properties.service';
import { Currency } from 'src/app/core/models/currency.model';
import { DomSanitizer } from '@angular/platform-browser';
import { FileObject } from 'src/app/core/models/file_obj.model';
import { ViewCommentComponent } from 'src/app/shared/components/comments-history/view-comment/view-comment.component';
import { FyDeleteDialogComponent } from 'src/app/shared/components/fy-delete-dialog/fy-delete-dialog.component';
import { PopupAlertComponentComponent } from 'src/app/shared/components/popup-alert-component/popup-alert-component.component';
import { TaxGroupService } from 'src/app/core/services/tax_group.service';
import { TaxGroup } from 'src/app/core/models/tax_group.model';
import { PersonalCardsService } from 'src/app/core/services/personal-cards.service';
import { SnackbarPropertiesService } from 'src/app/core/services/snackbar-properties.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';
import { Expense } from 'src/app/core/models/expense.model';

@Component({
  selector: 'app-merge-expense',
  templateUrl: './merge-expense.page.html',
  styleUrls: ['./merge-expense.page.scss'],
})
export class MergeExpensePage implements OnInit {
  @ViewChild('duplicateInputContainer') duplicateInputContainer: ElementRef;

  @ViewChild('formContainer') formContainer: ElementRef;

  expenses: Expense[];

  mergedExpense = {};

  mergedExpenseOptions = {};

  fg: FormGroup;

  expenseOptions$: Observable<{ label: string; value: any }[]>;

  etxn$: Observable<any>;

  paymentModes$: Observable<any[]>;

  recentlyUsedValues$: Observable<RecentlyUsed>;

  isCreatedFromCCC = false;

  isCreatedFromPersonalCard = false;

  paymentAccount$: Observable<any>;

  isCCCAccountSelected$: Observable<boolean>;

  homeCurrency$: Observable<string>;

  mode: string;

  title: string;

  activeIndex: number;

  reviewList: string[];

  filteredCategories$: Observable<any[]>;

  minDate: string;

  maxDate: string;

  txnFields$: Observable<any>;

  taxSettings$: Observable<any>;

  reports$: Observable<any>;

  isProjectsEnabled$: Observable<boolean>;

  flightJourneyTravelClassOptions$: Observable<any>;

  customInputs$: Observable<any>;

  isBalanceAvailableInAnyAdvanceAccount$: Observable<boolean>;

  selectedCCCTransaction;

  canChangeMatchingCCCTransaction = true;

  transactionInReport$: Observable<boolean>;

  transactionMandatoyFields$: Observable<any>;

  isCriticalPolicyViolated = false;

  showSelectedTransaction = false;

  isIndividualProjectsEnabled$: Observable<boolean>;

  individualProjectIds$: Observable<[]>;

  isNotReimbursable$: Observable<boolean>;

  costCenters$: Observable<any[]>;

  receiptsData: any;

  duplicates$: Observable<any>;

  duplicateBoxOpen = false;

  isAmountCapped$: Observable<boolean>;

  isAmountDisabled$: Observable<boolean>;

  isCriticalPolicyViolated$: Observable<boolean>;

  isSplitExpenseAllowed$: Observable<boolean>;

  attachmentUploadInProgress = false;

  attachedReceiptsCount = 0;

  instaFyleCancelled = false;

  newExpenseDataUrls = [];

  loadAttachments$ = new Subject();

  attachments$: Observable<FileObject[]>;

  focusState = false;

  isConnected$: Observable<boolean>;

  invalidPaymentMode = false;

  pointToDuplicates = false;

  isAdvancesEnabled$: Observable<boolean>;

  comments$: Observable<any>;

  isCCCPaymentModeSelected$: Observable<boolean>;

  isLoadingSuggestions = false;

  matchingCCCTransactions = [];

  matchedCCCTransaction;

  alreadyApprovedExpenses;

  isSplitExpensesPresent: boolean;

  canEditCCCMatchedSplitExpense: boolean;

  cardEndingDigits: string;

  selectedCCCTransactionInSuggestions: boolean;

  isCCCTransactionAutoSelected: boolean;

  isChangeCCCSuggestionClicked: boolean;

  isDraftExpenseEnabled: boolean;

  isDraftExpense: boolean;

  isProjectsVisible$: Observable<boolean>;

  saveExpenseLoader = false;

  saveAndNewExpenseLoader = false;

  saveAndNextExpenseLoader = false;

  saveAndPrevExpenseLoader = false;

  canAttachReceipts: boolean;

  duplicateDetectionReasons = [];

  tfcDefaultValues$: Observable<any>;

  expenseStartTime;

  navigateBack = false;

  isExpenseBankTxn = false;

  recentCategories: OrgCategoryListItem[];

  // Todo: Rename all `selected` to `isSelected`
  presetCategoryId: number;

  recentlyUsedCategories$: Observable<OrgCategoryListItem[]>;

  clusterDomain: string;

  orgUserSettings$: Observable<OrgUserSettings>;

  recentProjects: { label: string; value: ExtendedProject; selected?: boolean }[];

  recentCurrencies: Currency[];

  presetProjectId: number;

  recentlyUsedProjects$: Observable<ExtendedProject[]>;

  recentlyUsedCurrencies$: Observable<Currency[]>;

  recentCostCenters: { label: string; value: CostCenter; selected?: boolean }[];

  presetCostCenterId: number;

  recentlyUsedCostCenters$: Observable<{ label: string; value: CostCenter; selected?: boolean }[]>;

  presetCurrency: string;

  initialFetch;

  inpageExtractedData;

  actionSheetButtons = [];

  isExpandedView = false;

  billableDefaultValue: boolean;

  taxGroups$: Observable<TaxGroup[]>;

  taxGroupsOptions$: Observable<{ label: string; value: any }[]>;

  canDeleteExpense = true;

  policyDetails;

  source = 'MOBILE';

  isLoaded = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private accountsService: AccountsService,
    private offlineService: OfflineService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private categoriesService: CategoriesService,
    private dateService: DateService,
    private projectService: ProjectsService,
    private reportService: ReportService,
    private customInputsService: CustomInputsService,
    private customFieldsService: CustomFieldsService,
    private transactionService: TransactionService,
    private dataTransformService: DataTransformService,
    private policyService: PolicyService,
    private transactionOutboxService: TransactionsOutboxService,
    private duplicateDetectionService: DuplicateDetectionService,
    private loaderService: LoaderService,
    private modalController: ModalController,
    private statusService: StatusService,
    private fileService: FileService,
    private popoverController: PopoverController,
    private currencyService: CurrencyService,
    private networkService: NetworkService,
    private popupService: PopupService,
    private navController: NavController,
    private corporateCreditCardExpenseSuggestionService: CorporateCreditCardExpenseSuggestionsService,
    private corporateCreditCardExpenseService: CorporateCreditCardExpenseService,
    private trackingService: TrackingService,
    private recentLocalStorageItemsService: RecentLocalStorageItemsService,
    private recentlyUsedItemsService: RecentlyUsedItemsService,
    private tokenService: TokenService,
    private expenseFieldsService: ExpenseFieldsService,
    private modalProperties: ModalPropertiesService,
    private actionSheetController: ActionSheetController,
    private taxGroupsService: TaxGroupService,
    private sanitizer: DomSanitizer,
    private personalCardsService: PersonalCardsService,
    private matSnackBar: MatSnackBar,
    private snackbarProperties: SnackbarPropertiesService
  ) {}

  ngOnInit() {
    // this.expenses = this.router.getCurrentNavigation().extras.state.selectedElements;

    const expenses = `
    [{"_search_document":"'55':1 '55.00':2 'ajain@fyle.in':7 'complete':4 'e/2021/11/t/2':5 'inr':3 'others':8,9,10 'yash':6","duplicates":[{"fields":["amount","currency","txn_dt"],"percent":33,"reason":"(Accuracy rate: 33%) The amount, currency, date of spend of this expense match with another expense.","transaction_id":"txhV3sTkmV5s"}],"external_expense_id":null,"matched_by":null,"ou_band":null,"ou_business_unit":null,"ou_department":null,"ou_department_id":null,"ou_employee_id":null,"ou_id":"oulhcY7LQ4fS","ou_joining_dt":null,"ou_level":null,"ou_location":null,"ou_mobile":"+919535079878","ou_org_id":"orR5DdAEXfeK","ou_org_name":"CCC-Statement","ou_rank":null,"ou_sub_department":null,"ou_title":null,"ou_user_id":"usvKA4X8Ugcr","rp_approved_at":null,"rp_claim_number":null,"rp_purpose":null,"rp_reimbursed_at":null,"source_account_id":"accxhd4TdFVYS","source_account_type":"PERSONAL_ACCOUNT","tg_name":null,"tg_percentage":null,"transaction_approvals":null,"tx_activity_details":null,"tx_activity_policy_pending":null,"tx_admin_amount":null,"tx_amount":55,"tx_billable":false,"tx_boolean_column1":null,"tx_boolean_column10":null,"tx_boolean_column2":null,"tx_boolean_column3":null,"tx_boolean_column4":null,"tx_boolean_column5":null,"tx_boolean_column6":null,"tx_boolean_column7":null,"tx_boolean_column8":null,"tx_boolean_column9":null,"tx_bus_travel_class":null,"tx_category":null,"tx_corporate_credit_card_expense_group_id":null,"tx_cost_center_code":"1","tx_cost_center_id":2425,"tx_cost_center_name":"a2","tx_created_at":"2021-11-18T11:20:02.036696","tx_creator_id":"oulhcY7LQ4fS","tx_currency":"INR","tx_custom_properties":[],"tx_decimal_column1":null,"tx_decimal_column10":null,"tx_decimal_column2":null,"tx_decimal_column3":null,"tx_decimal_column4":null,"tx_decimal_column5":null,"tx_decimal_column6":null,"tx_decimal_column7":null,"tx_decimal_column8":null,"tx_decimal_column9":null,"tx_distance":null,"tx_distance_unit":null,"tx_expense_number":"E/2021/11/T/2","tx_external_id":null,"tx_extracted_data":null,"tx_file_ids":null,"tx_flight_journey_travel_class":null,"tx_flight_return_travel_class":null,"tx_from_dt":null,"tx_fyle_category":"Others","tx_hotel_is_breakfast_provided":null,"tx_id":"txhKMraNUpFv","tx_invoice_number":null,"tx_is_duplicate_expense":null,"tx_is_holiday_expense":null,"tx_is_split_expense":false,"tx_location_column1":null,"tx_location_column10":null,"tx_location_column2":null,"tx_location_column3":null,"tx_location_column4":null,"tx_location_column5":null,"tx_location_column6":null,"tx_location_column7":null,"tx_location_column8":null,"tx_location_column9":null,"tx_locations":[],"tx_mandatory_fields_present":true,"tx_manual_flag":false,"tx_mileage_calculated_amount":null,"tx_mileage_calculated_distance":null,"tx_mileage_is_round_trip":null,"tx_mileage_rate":null,"tx_mileage_vehicle_type":null,"tx_num_days":null,"tx_num_files":0,"tx_org_category":"Others","tx_org_category_code":null,"tx_org_category_id":37028,"tx_org_user_id":"oulhcY7LQ4fS","tx_orig_amount":null,"tx_orig_currency":null,"tx_payment_id":"payLGBQYfgu3X","tx_per_diem_rate_id":null,"tx_physical_bill":false,"tx_physical_bill_at":null,"tx_policy_amount":null,"tx_policy_flag":true,"tx_policy_state":null,"tx_project_code":null,"tx_project_id":null,"tx_project_name":null,"tx_purpose":null,"tx_receipt_required":true,"tx_report_id":null,"tx_reported_at":null,"tx_risk_state":null,"tx_skip_reimbursement":false,"tx_source":"MOBILE","tx_source_account_id":"accxhd4TdFVYS","tx_split_group_id":"txhKMraNUpFv","tx_split_group_user_amount":55,"tx_state":"COMPLETE","tx_sub_category":"Others","tx_tax":null,"tx_tax_amount":null,"tx_tax_group_id":null,"tx_text_array_column1":null,"tx_text_array_column10":null,"tx_text_array_column2":null,"tx_text_array_column3":null,"tx_text_array_column4":null,"tx_text_array_column5":null,"tx_text_array_column6":null,"tx_text_array_column7":null,"tx_text_array_column8":null,"tx_text_array_column9":null,"tx_text_column1":null,"tx_text_column10":null,"tx_text_column11":null,"tx_text_column12":null,"tx_text_column13":null,"tx_text_column14":null,"tx_text_column15":null,"tx_text_column2":null,"tx_text_column3":null,"tx_text_column4":null,"tx_text_column5":null,"tx_text_column6":null,"tx_text_column7":null,"tx_text_column8":null,"tx_text_column9":null,"tx_timestamp_column1":null,"tx_timestamp_column10":null,"tx_timestamp_column2":null,"tx_timestamp_column3":null,"tx_timestamp_column4":null,"tx_timestamp_column5":null,"tx_timestamp_column6":null,"tx_timestamp_column7":null,"tx_timestamp_column8":null,"tx_timestamp_column9":null,"tx_to_dt":null,"tx_train_travel_class":null,"tx_transcribed_data":null,"tx_transcription_state":null,"tx_txn_dt":"2021-11-18T01:00:00.000Z","tx_updated_at":"2021-11-18T11:20:10.511","tx_user_amount":55,"tx_user_can_delete":true,"tx_user_reason_for_duplicate_expenses":null,"tx_user_review_needed":null,"tx_vendor":null,"tx_vendor_id":null,"tx_verification_state":null,"us_email":"ajain@fyle.in","us_full_name":"Yash","isDraft":false,"isPolicyViolated":true,"isCriticalPolicyViolated":false,"vendorDetails":null},{"_search_document":"'55':1 '55.00':2 'ajain@fyle.in':7 'complete':4 'e/2021/11/t/1':5 'inr':3 'others':8,9,10 'yash':6","duplicates":[{"fields":["amount","currency","txn_dt"],"percent":33,"reason":"(Accuracy rate: 33%) The amount, currency, date of spend of this expense match with another expense.","transaction_id":"txhKMraNUpFv"}],"external_expense_id":null,"matched_by":null,"ou_band":null,"ou_business_unit":null,"ou_department":null,"ou_department_id":null,"ou_employee_id":null,"ou_id":"oulhcY7LQ4fS","ou_joining_dt":null,"ou_level":null,"ou_location":null,"ou_mobile":"+919535079878","ou_org_id":"orR5DdAEXfeK","ou_org_name":"CCC-Statement","ou_rank":null,"ou_sub_department":null,"ou_title":null,"ou_user_id":"usvKA4X8Ugcr","rp_approved_at":null,"rp_claim_number":null,"rp_purpose":null,"rp_reimbursed_at":null,"source_account_id":"accxhd4TdFVYS","source_account_type":"PERSONAL_ACCOUNT","tg_name":null,"tg_percentage":null,"transaction_approvals":null,"tx_activity_details":null,"tx_activity_policy_pending":null,"tx_admin_amount":null,"tx_amount":55,"tx_billable":false,"tx_boolean_column1":null,"tx_boolean_column10":null,"tx_boolean_column2":null,"tx_boolean_column3":null,"tx_boolean_column4":null,"tx_boolean_column5":null,"tx_boolean_column6":null,"tx_boolean_column7":null,"tx_boolean_column8":null,"tx_boolean_column9":null,"tx_bus_travel_class":null,"tx_category":null,"tx_corporate_credit_card_expense_group_id":null,"tx_cost_center_code":"1","tx_cost_center_id":2425,"tx_cost_center_name":"a2","tx_created_at":"2021-11-18T11:19:48.044044","tx_creator_id":"oulhcY7LQ4fS","tx_currency":"INR","tx_custom_properties":[],"tx_decimal_column1":null,"tx_decimal_column10":null,"tx_decimal_column2":null,"tx_decimal_column3":null,"tx_decimal_column4":null,"tx_decimal_column5":null,"tx_decimal_column6":null,"tx_decimal_column7":null,"tx_decimal_column8":null,"tx_decimal_column9":null,"tx_distance":null,"tx_distance_unit":null,"tx_expense_number":"E/2021/11/T/1","tx_external_id":null,"tx_extracted_data":null,"tx_file_ids":null,"tx_flight_journey_travel_class":null,"tx_flight_return_travel_class":null,"tx_from_dt":null,"tx_fyle_category":"Others","tx_hotel_is_breakfast_provided":null,"tx_id":"txhV3sTkmV5s","tx_invoice_number":null,"tx_is_duplicate_expense":null,"tx_is_holiday_expense":null,"tx_is_split_expense":false,"tx_location_column1":null,"tx_location_column10":null,"tx_location_column2":null,"tx_location_column3":null,"tx_location_column4":null,"tx_location_column5":null,"tx_location_column6":null,"tx_location_column7":null,"tx_location_column8":null,"tx_location_column9":null,"tx_locations":[],"tx_mandatory_fields_present":true,"tx_manual_flag":false,"tx_mileage_calculated_amount":null,"tx_mileage_calculated_distance":null,"tx_mileage_is_round_trip":null,"tx_mileage_rate":null,"tx_mileage_vehicle_type":null,"tx_num_days":null,"tx_num_files":0,"tx_org_category":"Others","tx_org_category_code":null,"tx_org_category_id":37028,"tx_org_user_id":"oulhcY7LQ4fS","tx_orig_amount":null,"tx_orig_currency":null,"tx_payment_id":"payKH2meul0cg","tx_per_diem_rate_id":null,"tx_physical_bill":false,"tx_physical_bill_at":null,"tx_policy_amount":null,"tx_policy_flag":true,"tx_policy_state":null,"tx_project_code":null,"tx_project_id":null,"tx_project_name":null,"tx_purpose":null,"tx_receipt_required":true,"tx_report_id":null,"tx_reported_at":null,"tx_risk_state":null,"tx_skip_reimbursement":false,"tx_source":"MOBILE","tx_source_account_id":"accxhd4TdFVYS","tx_split_group_id":"txhV3sTkmV5s","tx_split_group_user_amount":55,"tx_state":"COMPLETE","tx_sub_category":"Others","tx_tax":null,"tx_tax_amount":null,"tx_tax_group_id":null,"tx_text_array_column1":null,"tx_text_array_column10":null,"tx_text_array_column2":null,"tx_text_array_column3":null,"tx_text_array_column4":null,"tx_text_array_column5":null,"tx_text_array_column6":null,"tx_text_array_column7":null,"tx_text_array_column8":null,"tx_text_array_column9":null,"tx_text_column1":null,"tx_text_column10":null,"tx_text_column11":null,"tx_text_column12":null,"tx_text_column13":null,"tx_text_column14":null,"tx_text_column15":null,"tx_text_column2":null,"tx_text_column3":null,"tx_text_column4":null,"tx_text_column5":null,"tx_text_column6":null,"tx_text_column7":null,"tx_text_column8":null,"tx_text_column9":null,"tx_timestamp_column1":null,"tx_timestamp_column10":null,"tx_timestamp_column2":null,"tx_timestamp_column3":null,"tx_timestamp_column4":null,"tx_timestamp_column5":null,"tx_timestamp_column6":null,"tx_timestamp_column7":null,"tx_timestamp_column8":null,"tx_timestamp_column9":null,"tx_to_dt":null,"tx_train_travel_class":null,"tx_transcribed_data":null,"tx_transcription_state":null,"tx_txn_dt":"2021-11-18T01:00:00.000Z","tx_updated_at":"2021-11-18T11:19:52.82829","tx_user_amount":55,"tx_user_can_delete":true,"tx_user_reason_for_duplicate_expenses":null,"tx_user_review_needed":null,"tx_vendor":null,"tx_vendor_id":null,"tx_verification_state":null,"us_email":"ajain@fyle.in","us_full_name":"Yash","isDraft":false,"isPolicyViolated":true,"isCriticalPolicyViolated":false,"vendorDetails":null}]
    `;
    this.expenses = JSON.parse(expenses);
    console.log(this.expenses);
  }

  ionViewWillEnter() {
    this.fg = this.formBuilder.group({
      currencyObj: [],
      paymentMode: [],
      amount: [],
      project: [],
      category: [],
      dateOfSpend: [],
      vendor_id: [],
      purpose: [],
      report: [],
      tax_group: [],
      tax_amount: [],
      location_1: [],
      location_2: [],
      from_dt: [],
      to_dt: [],
      flight_journey_travel_class: [],
      flight_return_travel_class: [],
      train_travel_class: [],
      bus_travel_class: [],
      distance: [],
      distance_unit: [],
      custom_inputs: new FormArray([]),
      add_to_new_report: [],
      duplicate_detection_reason: [],
      billable: [],
      costCenter: [],
      hotel_is_breakfast_provided: [],
    });

    //  this.setupTfc();

    from(Object.keys(this.expenses[0])).subscribe((item) => {
      this.mergedExpense[item] = [];
      if (this.expenses[0][item]) {
        this.mergedExpense[item].push(this.expenses[0][item]);
      }
      if (this.expenses[1][item]) {
        this.mergedExpense[item].push(this.expenses[1][item]);
      }
    });

    from(Object.keys(this.expenses[0])).subscribe((item) => {
      this.mergedExpenseOptions[item] = {};
      this.mergedExpenseOptions[item].options = [];
      if (this.expenses[0][item]) {
        this.mergedExpenseOptions[item].options.push({
          label: String(this.expenses[0][item]),
          value: this.expenses[0][item],
        });
      }
      if (this.expenses[1][item]) {
        this.mergedExpenseOptions[item].options.push({
          label: String(this.expenses[1][item]),
          value: this.expenses[1][item],
        });
      }

      const valueArr = this.mergedExpenseOptions[item].options.map((item) => item.value);
      const isDuplicate = valueArr.some((item, idx) => valueArr.indexOf(item) !== idx);
      this.mergedExpenseOptions[item].isSame = isDuplicate;
      if (item === 'source_account_type' && isDuplicate) {
        this.fg.patchValue({
          paymentMode: this.mergedExpenseOptions[item].options[0].value,
        });
      }

      if (item === 'tx_currency' && isDuplicate) {
        this.fg.patchValue({
          currencyObj: this.mergedExpenseOptions[item].options[0].value,
        });
      }
    });

    console.log(this.mergedExpenseOptions);

    this.expenseOptions$ = from(this.expenses).pipe(
      map((expense) => {
        let vendorOrCategory = '';
        if (expense.tx_vendor) {
          vendorOrCategory = expense.tx_vendor;
        } else {
          vendorOrCategory = expense.tx_org_category;
        }
        let projectName = '';
        if (expense.tx_project_name) {
          projectName = `- ${expense.tx_project_name}`;
        }

        return {
          label: `${moment(expense.tx_txn_dt).format('MMM DD')} ${expense.tx_currency} ${
            expense.tx_amount
          }  ${vendorOrCategory} ${projectName}`,
          value: expense.tx_split_group_id,
        };
      }),
      scan((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      shareReplay(1)
    );
    this.isLoaded = true;
  }

  setupTfc() {
    const txnFieldsMap$ = this.fg.valueChanges.pipe(
      startWith({}),
      switchMap((formValue) =>
        this.offlineService.getExpenseFieldsMap().pipe(
          switchMap((expenseFieldsMap) => {
            const fields = [
              'purpose',
              'txn_dt',
              'vendor_id',
              'cost_center_id',
              'project_id',
              'from_dt',
              'to_dt',
              'location1',
              'location2',
              'distance',
              'distance_unit',
              'flight_journey_travel_class',
              'flight_return_travel_class',
              'train_travel_class',
              'bus_travel_class',
              'billable',
              'tax_group_id',
            ];
            return this.expenseFieldsService.filterByOrgCategoryId(expenseFieldsMap, fields, formValue.category);
          })
        )
      )
    );

    this.txnFields$ = txnFieldsMap$.pipe(
      map((expenseFieldsMap: any) => {
        if (expenseFieldsMap) {
          for (const tfc of Object.keys(expenseFieldsMap)) {
            if (expenseFieldsMap[tfc].options && expenseFieldsMap[tfc].options.length > 0) {
              if (tfc === 'vendor_id') {
                expenseFieldsMap[tfc].options = expenseFieldsMap[tfc].options.map((value) => ({
                  label: value,
                  value: {
                    display_name: value,
                  },
                }));
              } else {
                expenseFieldsMap[tfc].options = expenseFieldsMap[tfc].options.map((value) => ({ label: value, value }));
              }
            }
          }
        }
        return expenseFieldsMap;
      }),
      shareReplay(1)
    );

    this.txnFields$
      .pipe(
        distinctUntilChanged((a, b) => isEqual(a, b)),
        switchMap((txnFields) =>
          forkJoin({
            isConnected: this.isConnected$.pipe(take(1)),
            orgSettings: this.offlineService.getOrgSettings(),
            costCenters: this.costCenters$,
            taxGroups: this.taxGroups$,
          }).pipe(
            map(({ isConnected, orgSettings, costCenters, taxGroups }) => ({
              isConnected,
              txnFields,
              orgSettings,
              costCenters,
              taxGroups,
            }))
          )
        )
      )
      .subscribe(({ isConnected, txnFields, orgSettings, costCenters, taxGroups }) => {
        const keyToControlMap: {
          [id: string]: AbstractControl;
        } = {
          purpose: this.fg.controls.purpose,
          txn_dt: this.fg.controls.dateOfSpend,
          vendor_id: this.fg.controls.vendor_id,
          cost_center_id: this.fg.controls.costCenter,
          from_dt: this.fg.controls.from_dt,
          to_dt: this.fg.controls.to_dt,
          location1: this.fg.controls.location_1,
          location2: this.fg.controls.location_2,
          distance: this.fg.controls.distance,
          distance_unit: this.fg.controls.distance_unit,
          flight_journey_travel_class: this.fg.controls.flight_journey_travel_class,
          flight_return_travel_class: this.fg.controls.flight_return_travel_class,
          train_travel_class: this.fg.controls.train_travel_class,
          bus_travel_class: this.fg.controls.bus_travel_class,
          project_id: this.fg.controls.project,
          billable: this.fg.controls.billable,
          tax_group_id: this.fg.controls.tax_group,
        };
        for (const control of Object.values(keyToControlMap)) {
          control.clearValidators();
          control.updateValueAndValidity();
        }
        this.fg.updateValueAndValidity();
      });

    this.etxn$
      .pipe(
        switchMap(() => txnFieldsMap$),
        map((txnFields) => this.expenseFieldsService.getDefaultTxnFieldValues(txnFields))
      )
      .subscribe((defaultValues) => {
        this.billableDefaultValue = defaultValues.billable;
        const keyToControlMap: {
          [id: string]: AbstractControl;
        } = {
          purpose: this.fg.controls.purpose,
          txn_dt: this.fg.controls.dateOfSpend,
          vendor_id: this.fg.controls.vendor_id,
          cost_center_id: this.fg.controls.costCenter,
          from_dt: this.fg.controls.from_dt,
          to_dt: this.fg.controls.to_dt,
          location1: this.fg.controls.location_1,
          location2: this.fg.controls.location_2,
          distance: this.fg.controls.distance,
          distance_unit: this.fg.controls.distance_unit,
          flight_journey_travel_class: this.fg.controls.flight_journey_travel_class,
          flight_return_travel_class: this.fg.controls.flight_return_travel_class,
          train_travel_class: this.fg.controls.train_travel_class,
          bus_travel_class: this.fg.controls.bus_travel_class,
          billable: this.fg.controls.billable,
          tax_group_id: this.fg.controls.tax_group,
        };

        for (const defaultValueColumn in defaultValues) {
          if (defaultValues.hasOwnProperty(defaultValueColumn)) {
            const control = keyToControlMap[defaultValueColumn];
            if (
              !['vendor_id', 'billable', 'tax_group_id'].includes(defaultValueColumn) &&
              !control.value &&
              !control.touched
            ) {
              control.patchValue(defaultValues[defaultValueColumn]);
            } else if (defaultValueColumn === 'vendor_id' && !control.value && !control.touched) {
              control.patchValue({
                display_name: defaultValues[defaultValueColumn],
              });
            } else if (
              defaultValueColumn === 'billable' &&
              this.fg.controls.project.value &&
              (control.value === null || control.value === undefined) &&
              !control.touched
            ) {
              control.patchValue(defaultValues[defaultValueColumn]);
            } else if (
              defaultValueColumn === 'tax_group_id' &&
              !control.value &&
              !control.touched &&
              control.value !== ''
            ) {
              this.taxGroups$.subscribe((taxGroups) => {
                const tg = taxGroups.find((tg) => (tg.name = defaultValues[defaultValueColumn]));
                control.patchValue(tg);
              });
            }
          }
        }
      });
  }
}
