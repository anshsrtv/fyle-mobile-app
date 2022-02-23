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
  toArray,
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
import { MergeExpensesService } from 'src/app/core/services/merge-expenses.service';
import { HumanizeCurrencyPipe } from 'src/app/shared/pipes/humanize-currency.pipe';

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

  mergedExpenseOptions: any = {};

  fg: FormGroup;

  expenseOptions$: Observable<{ label: string; value: any }[]>;

  isMerging = false;

  selectedReceiptsId: string[] = [];

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

  isFieldChanged = false;

  customFieldsLoaded = false;

  dummyfields: any;

  projects: any;

  categories: any;

  mergedCustomProperties: any = {};

  oldSelectedId: string;

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
    private snackbarProperties: SnackbarPropertiesService,
    private mergeExpensesService: MergeExpensesService,
    private humanizeCurrency: HumanizeCurrencyPipe
  ) {}

  ngOnInit() {
    this.expenses = this.router.getCurrentNavigation().extras.state.selectedElements;
    console.log(JSON.stringify(this.expenses));

    //     const expenses = `
    // [{"_search_document":"'3m':13 '55':1 '55.00':2 'c1':5 'complete':4 'e/2022/02/t/833':6 'e0233':7 'engine':10,11 'inr':3 'kavya':8 'kavya.hl@fyle.in':9 'others':12","duplicates":null,"external_expense_id":null,"matched_by":null,"ou_band":null,"ou_business_unit":null,"ou_department":null,"ou_department_id":null,"ou_employee_id":"E0233","ou_id":"ouKrh6zKkazp","ou_joining_dt":null,"ou_level":null,"ou_location":null,"ou_mobile":null,"ou_org_id":"orNVthTo2Zyo","ou_org_name":"Staging Loaded","ou_rank":null,"ou_sub_department":null,"ou_title":null,"ou_user_id":"us2KhpQLpzX4","rp_approved_at":null,"rp_claim_number":null,"rp_purpose":null,"rp_reimbursed_at":null,"source_account_id":"acc0waQov9fgP","source_account_type":"PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT","tg_name":null,"tg_percentage":null,"transaction_approvals":{"oufIVELfl7I6":{"state":"APPROVAL_PENDING"}},"tx_activity_details":null,"tx_activity_policy_pending":null,"tx_admin_amount":null,"tx_amount":55,"tx_billable":true,"tx_boolean_column1":null,"tx_boolean_column10":null,"tx_boolean_column2":null,"tx_boolean_column3":null,"tx_boolean_column4":null,"tx_boolean_column5":null,"tx_boolean_column6":null,"tx_boolean_column7":null,"tx_boolean_column8":null,"tx_boolean_column9":null,"tx_bus_travel_class":null,"tx_category":null,"tx_corporate_credit_card_expense_group_id":null,"tx_cost_center_code":null,"tx_cost_center_id":null,"tx_cost_center_name":null,"tx_created_at":"2022-02-16T09:28:14.446629","tx_creator_id":"ouKrh6zKkazp","tx_currency":"INR","tx_custom_properties":[{"name":"userlist","value":[]},{"name":"hsdgja","value":null},{"name":"cfgn","value":null},{"name":"test_report","value":null},{"name":"Test","value":null},{"name":"List type number","value":null},{"name":"TCF","value":{"display":"Mariyamman Kovil St, Vagai Nagar, Ramanathapuram, Tamil Nadu 623504, India"}}],"tx_decimal_column1":null,"tx_decimal_column10":null,"tx_decimal_column2":null,"tx_decimal_column3":null,"tx_decimal_column4":null,"tx_decimal_column5":null,"tx_decimal_column6":null,"tx_decimal_column7":null,"tx_decimal_column8":null,"tx_decimal_column9":null,"tx_distance":null,"tx_distance_unit":null,"tx_expense_number":"E/2022/02/T/833","tx_external_id":null,"tx_extracted_data":null,"tx_file_ids":null,"tx_flight_journey_travel_class":null,"tx_flight_return_travel_class":null,"tx_from_dt":null,"tx_fyle_category":"Others","tx_hotel_is_breakfast_provided":null,"tx_id":"txcR56ISjq8p","tx_invoice_number":null,"tx_is_duplicate_expense":null,"tx_is_holiday_expense":null,"tx_is_split_expense":false,"tx_location_column1":null,"tx_location_column10":null,"tx_location_column2":null,"tx_location_column3":null,"tx_location_column4":null,"tx_location_column5":null,"tx_location_column6":null,"tx_location_column7":null,"tx_location_column8":{"actual":null,"city":null,"country":null,"display":"Mariyamman Kovil St, Vagai Nagar, Ramanathapuram, Tamil Nadu 623504, India","formatted_address":null,"latitude":null,"longitude":null,"state":null},"tx_location_column9":null,"tx_locations":[],"tx_mandatory_fields_present":true,"tx_manual_flag":false,"tx_mileage_calculated_amount":null,"tx_mileage_calculated_distance":null,"tx_mileage_is_round_trip":null,"tx_mileage_rate":null,"tx_mileage_vehicle_type":null,"tx_num_days":null,"tx_num_files":0,"tx_org_category":"Engine","tx_org_category_code":null,"tx_org_category_id":116090,"tx_org_user_id":"ouKrh6zKkazp","tx_orig_amount":null,"tx_orig_currency":null,"tx_payment_id":"payxEnLXYSQuE","tx_per_diem_rate_id":null,"tx_physical_bill":false,"tx_physical_bill_at":null,"tx_policy_amount":null,"tx_policy_flag":false,"tx_policy_state":null,"tx_project_code":"1397","tx_project_id":247935,"tx_project_name":"3M","tx_purpose":"C1","tx_receipt_required":false,"tx_report_id":null,"tx_reported_at":null,"tx_risk_state":null,"tx_skip_reimbursement":true,"tx_source":"MOBILE","tx_source_account_id":"acc0waQov9fgP","tx_split_group_id":"txcR56ISjq8p","tx_split_group_user_amount":55,"tx_state":"COMPLETE","tx_sub_category":"Engine","tx_tax":null,"tx_tax_amount":null,"tx_tax_group_id":null,"tx_text_array_column1":null,"tx_text_array_column10":null,"tx_text_array_column2":null,"tx_text_array_column3":null,"tx_text_array_column4":null,"tx_text_array_column5":null,"tx_text_array_column6":null,"tx_text_array_column7":null,"tx_text_array_column8":null,"tx_text_array_column9":null,"tx_text_column1":null,"tx_text_column10":null,"tx_text_column11":null,"tx_text_column12":null,"tx_text_column13":null,"tx_text_column14":null,"tx_text_column15":null,"tx_text_column2":null,"tx_text_column3":null,"tx_text_column4":null,"tx_text_column5":null,"tx_text_column6":null,"tx_text_column7":null,"tx_text_column8":null,"tx_text_column9":null,"tx_timestamp_column1":null,"tx_timestamp_column10":null,"tx_timestamp_column2":null,"tx_timestamp_column3":null,"tx_timestamp_column4":null,"tx_timestamp_column5":null,"tx_timestamp_column6":null,"tx_timestamp_column7":null,"tx_timestamp_column8":null,"tx_timestamp_column9":null,"tx_to_dt":null,"tx_train_travel_class":null,"tx_transcribed_data":null,"tx_transcription_state":null,"tx_txn_dt":"2022-02-16T01:00:00.000Z","tx_updated_at":"2022-02-16T19:08:17.090285","tx_user_amount":55,"tx_user_can_delete":true,"tx_user_reason_for_duplicate_expenses":null,"tx_user_review_needed":null,"tx_vendor":null,"tx_vendor_id":null,"tx_verification_state":null,"us_email":"kavya.hl@fyle.in","us_full_name":"kavya","isDraft":false,"isPolicyViolated":false,"isCriticalPolicyViolated":false,"vendorDetails":null},{"_search_document":"'3m':13 '44':1 '44.00':2 'c1':5 'complete':4 'e/2022/02/t/832':6 'e0233':7 'engine':10,11 'inr':3 'kavya':8 'kavya.hl@fyle.in':9 'others':12","duplicates":null,"external_expense_id":null,"matched_by":null,"ou_band":null,"ou_business_unit":null,"ou_department":null,"ou_department_id":null,"ou_employee_id":"E0233","ou_id":"ouKrh6zKkazp","ou_joining_dt":null,"ou_level":null,"ou_location":null,"ou_mobile":null,"ou_org_id":"orNVthTo2Zyo","ou_org_name":"Staging Loaded","ou_rank":null,"ou_sub_department":null,"ou_title":null,"ou_user_id":"us2KhpQLpzX4","rp_approved_at":null,"rp_claim_number":null,"rp_purpose":null,"rp_reimbursed_at":null,"source_account_id":"acc0waQov9fgP","source_account_type":"PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT","tg_name":null,"tg_percentage":null,"transaction_approvals":{"oufIVELfl7I6":{"state":"APPROVAL_PENDING"}},"tx_activity_details":null,"tx_activity_policy_pending":null,"tx_admin_amount":null,"tx_amount":44,"tx_billable":true,"tx_boolean_column1":null,"tx_boolean_column10":null,"tx_boolean_column2":null,"tx_boolean_column3":null,"tx_boolean_column4":null,"tx_boolean_column5":null,"tx_boolean_column6":null,"tx_boolean_column7":null,"tx_boolean_column8":null,"tx_boolean_column9":null,"tx_bus_travel_class":null,"tx_category":null,"tx_corporate_credit_card_expense_group_id":null,"tx_cost_center_code":null,"tx_cost_center_id":null,"tx_cost_center_name":null,"tx_created_at":"2022-02-16T09:27:45.538403","tx_creator_id":"ouKrh6zKkazp","tx_currency":"INR","tx_custom_properties":[{"name":"userlist","value":[]},{"name":"hsdgja","value":null},{"name":"cfgn","value":null},{"name":"test_report","value":null},{"name":"Test","value":null},{"name":"List type number","value":null},{"name":"TCF","value":{"city":"Ramanathapuram","country":"India","display":"19/13, Mariyamman Kovil St, Vagai Nagar, Ramanathapuram, Tamil Nadu 623504, India","formatted_address":"19/13, Mariyamman Kovil St, Vagai Nagar, Ramanathapuram, Tamil Nadu 623504, India","latitude":9.3725305,"longitude":78.84564089999999,"state":"Tamil Nadu"}}],"tx_decimal_column1":null,"tx_decimal_column10":null,"tx_decimal_column2":null,"tx_decimal_column3":null,"tx_decimal_column4":null,"tx_decimal_column5":null,"tx_decimal_column6":null,"tx_decimal_column7":null,"tx_decimal_column8":null,"tx_decimal_column9":null,"tx_distance":null,"tx_distance_unit":null,"tx_expense_number":"E/2022/02/T/832","tx_external_id":null,"tx_extracted_data":null,"tx_file_ids":null,"tx_flight_journey_travel_class":null,"tx_flight_return_travel_class":null,"tx_from_dt":null,"tx_fyle_category":"Food","tx_hotel_is_breakfast_provided":null,"tx_id":"txRTO8q49TzO","tx_invoice_number":null,"tx_is_duplicate_expense":null,"tx_is_holiday_expense":null,"tx_is_split_expense":false,"tx_location_column1":null,"tx_location_column10":null,"tx_location_column2":null,"tx_location_column3":null,"tx_location_column4":null,"tx_location_column5":null,"tx_location_column6":null,"tx_location_column7":null,"tx_location_column8":{"actual":null,"city":"Ramanathapuram","country":"India","display":"19/13, Mariyamman Kovil St, Vagai Nagar, Ramanathapuram, Tamil Nadu 623504, India","formatted_address":"19/13, Mariyamman Kovil St, Vagai Nagar, Ramanathapuram, Tamil Nadu 623504, India","latitude":9.3725305,"longitude":78.84564089999999,"state":"Tamil Nadu"},"tx_location_column9":null,"tx_locations":[],"tx_mandatory_fields_present":true,"tx_manual_flag":false,"tx_mileage_calculated_amount":null,"tx_mileage_calculated_distance":null,"tx_mileage_is_round_trip":null,"tx_mileage_rate":null,"tx_mileage_vehicle_type":null,"tx_num_days":null,"tx_num_files":0,"tx_org_category":"Food","tx_org_category_code":null,"tx_org_category_id":16566,"tx_org_user_id":"ouKrh6zKkazp","tx_orig_amount":null,"tx_orig_currency":null,"tx_payment_id":"pay6yp25bRdrd","tx_per_diem_rate_id":null,"tx_physical_bill":false,"tx_physical_bill_at":null,"tx_policy_amount":null,"tx_policy_flag":true,"tx_policy_state":null,"tx_project_code":"1397","tx_project_id":247935,"tx_project_name":"3M","tx_purpose":"C1","tx_receipt_required":true,"tx_report_id":null,"tx_reported_at":null,"tx_risk_state":null,"tx_skip_reimbursement":true,"tx_source":"MOBILE","tx_source_account_id":"acc0waQov9fgP","tx_split_group_id":"txRTO8q49TzO","tx_split_group_user_amount":44,"tx_state":"COMPLETE","tx_sub_category":"Food","tx_tax":null,"tx_tax_amount":null,"tx_tax_group_id":null,"tx_text_array_column1":null,"tx_text_array_column10":null,"tx_text_array_column2":null,"tx_text_array_column3":null,"tx_text_array_column4":null,"tx_text_array_column5":null,"tx_text_array_column6":null,"tx_text_array_column7":null,"tx_text_array_column8":null,"tx_text_array_column9":null,"tx_text_column1":null,"tx_text_column10":null,"tx_text_column11":null,"tx_text_column12":null,"tx_text_column13":null,"tx_text_column14":null,"tx_text_column15":null,"tx_text_column2":null,"tx_text_column3":null,"tx_text_column4":null,"tx_text_column5":null,"tx_text_column6":null,"tx_text_column7":null,"tx_text_column8":null,"tx_text_column9":null,"tx_timestamp_column1":null,"tx_timestamp_column10":null,"tx_timestamp_column2":null,"tx_timestamp_column3":null,"tx_timestamp_column4":null,"tx_timestamp_column5":null,"tx_timestamp_column6":null,"tx_timestamp_column7":null,"tx_timestamp_column8":null,"tx_timestamp_column9":null,"tx_to_dt":null,"tx_train_travel_class":null,"tx_transcribed_data":null,"tx_transcription_state":null,"tx_txn_dt":"2022-02-16T01:00:00.000Z","tx_updated_at":"2022-02-16T18:46:04.656493","tx_user_amount":44,"tx_user_can_delete":true,"tx_user_reason_for_duplicate_expenses":null,"tx_user_review_needed":null,"tx_vendor":null,"tx_vendor_id":null,"tx_verification_state":null,"us_email":"kavya.hl@fyle.in","us_full_name":"kavya","isDraft":false,"isPolicyViolated":true,"isCriticalPolicyViolated":false,"vendorDetails":null}]
    //             `;
    // this.expenses = JSON.parse(expenses);
    // console.log(JSON.stringify(this.expenses));
    // console.log(this.expenses);
    this.generateCustomInputOptions();
  }

  ionViewWillEnter() {
    this.fg = this.formBuilder.group({
      target_txn_id: [, Validators.required],
      currencyObj: [],
      paymentMode: [, Validators.required],
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
      receipt_ids: [],
    });

    //  this.setupTfc();
    this.setupCustomFields();
    from(Object.keys(this.expenses[0])).subscribe((item) => {
      this.mergedExpense[item] = [];
      from(this.expenses)
        .pipe(
          map((expense) => {
            if (expense[item]) {
              this.mergedExpense[item].push(expense[item]);
            }
          })
        )
        .subscribe(noop);
    });

    from(Object.keys(this.expenses[0])).subscribe((item) => {
      this.mergedExpenseOptions[item] = {};
      this.mergedExpenseOptions[item].options = [];
      from(this.expenses)
        .pipe(
          map((expense) => {
            if (expense[item] !== undefined && expense[item] !== null) {
              this.mergedExpenseOptions[item].options.push({
                label: String(expense[item]),
                value: expense[item],
              });
            }
          })
        )
        .subscribe(noop);

      let valueArr = this.mergedExpenseOptions[item].options.map((item) => item.value);
      if (item === 'tx_txn_dt') {
        valueArr = this.mergedExpenseOptions[item].options.map((item) => new Date(item.value.toDateString()).getTime());
      }
      const isDuplicate = valueArr.some((item, idx) => valueArr.indexOf(item) !== idx);

      this.mergedExpenseOptions[item].isSame = isDuplicate;
      // if(this.mergedExpenseOptions[item].options.length === 1){
      //   isDuplicate = true;
      // }
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

      if (item === 'tx_txn_dt' && isDuplicate) {
        this.fg.patchValue({
          dateOfSpend: this.mergedExpenseOptions[item].options[0].value,
        });
      }

      if (item === 'tx_amount' && isDuplicate) {
        this.fg.patchValue({
          amount: this.mergedExpenseOptions[item].options[0].value,
        });
      }

      if (item === 'tx_billable' && isDuplicate) {
        this.fg.patchValue({
          billable: this.mergedExpenseOptions[item].options[0].value,
        });
      }

      if (item === 'tx_project_id' && isDuplicate) {
        this.fg.patchValue({
          project: this.mergedExpenseOptions[item].options[0].value,
        });
      }

      if (item === 'tx_vendor_id' && isDuplicate) {
        this.fg.patchValue({
          vendor_id: this.mergedExpenseOptions[item].options[0].value,
        });
      }
      if (item === 'tx_org_category_id' && isDuplicate) {
        this.fg.patchValue({
          category: this.mergedExpenseOptions[item].options[0].value,
        });
      }
    });

    console.log(this.mergedExpenseOptions);
    console.log('this.mergedExpenseOptions');

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
        // console.log(this.humanizeCurrency.transform(expense.tx_amount, expense.tx_currency, 2));
        // console.log(expense);
        // console.log(expense.tx_amount, expense.tx_currency);
        // console.log(expense.tx_amount);
        // console.log(expense.tx_currency);
        return {
          label: `${moment(expense.tx_txn_dt).format('MMM DD')} ${this.humanizeCurrency.transform(
            expense.tx_amount,
            expense.tx_currency,
            2
          )} 
           ${vendorOrCategory} ${projectName}`,
          value: expense.tx_split_group_id,
        };
      }),
      scan((acc, curr) => {
        acc.push(curr);
        return acc;
      }, []),
      shareReplay(1)
    );

    this.projectService.getAllActive().subscribe((reso) => {
      this.projects = reso;
    });

    const allCategories$ = this.offlineService.getAllEnabledCategories();

    allCategories$.pipe(map((catogories) => this.categoriesService.filterRequired(catogories))).subscribe((res) => {
      // console.log('categories');
      // console.log(res);
      this.categories = res;
    });

    //     this.attachments$ =  this.fg.controls.receipt_ids.valueChanges.pipe(
    //       switchMap((etxn) =>  this.fileService.findByTransactionId(etxn)),
    //       switchMap((fileObjs) => from(fileObjs)),
    //       concatMap((fileObj: any) =>
    //         this.fileService.downloadUrl(fileObj.id).pipe(
    //           map((downloadUrl) => {
    //             fileObj.url = downloadUrl;
    //             const details = this.getReceiptDetails(fileObj);
    //             fileObj.type = details.type;
    //             fileObj.thumbnail = details.thumbnail;
    //             return fileObj;
    //           }),
    //         ),
    //         reduce((acc, curr) => acc.concat(curr), []),
    //       ),
    //       // reduce((acc, curr) => acc.concat(curr), []),
    //       // tap((res) => {
    //       //   console.log(res);
    //       // }),
    // );
    this.attachments$ = this.fg.controls.receipt_ids.valueChanges.pipe(
      startWith({}),
      switchMap((etxn) =>
        this.fileService.findByTransactionId(etxn).pipe(
          switchMap((fileObjs) => from(fileObjs)),
          concatMap((fileObj: any) =>
            this.fileService.downloadUrl(fileObj.id).pipe(
              map((downloadUrl) => {
                fileObj.url = downloadUrl;
                const details = this.getReceiptDetails(fileObj);
                fileObj.type = details.type;
                fileObj.thumbnail = details.thumbnail;
                return fileObj;
              })
            )
          ),
          reduce((acc, curr) => acc.concat(curr), [])
        )
      ),
      // reduce((acc, curr) => acc.concat(curr), []),
      // scan((a, c) => [...a, c], []),
      tap((receipts) => {
        this.selectedReceiptsId = receipts.map((receipt) => receipt.id);
        // console.log(receipts);
      })
    );

    this.fg.controls.target_txn_id.valueChanges.subscribe((expenseId) => {
      const selectedIndex = this.expenses.map((e) => e.tx_split_group_id).indexOf(expenseId);
      this.oldSelectedId = this.fg.value.target_txn_id;
      if (!this.isFieldChanged) {
        this.onExpenseChanged(selectedIndex);
      }
    });

    this.fg.valueChanges.subscribe(() => {
      this.getDirtyValues(this.fg).hasOwnProperty('target_txn_id');
      // console.log(this.getDirtyValues(this.fg).hasOwnProperty('target_txn_id'));
      const dirtyValues = this.getDirtyValues(this.fg); // or use => delete test['blue'];
      // console.log(dirtyValues);
      delete dirtyValues['target_txn_id']; // or use => delete test['blue'];
      if (Object.keys(dirtyValues).length > 0) {
        this.isFieldChanged = true;
      }

      // if(this.getDirtyValues(this.fg).hasOwnProperty('target_txn_id') ){
      //   this.isFieldChanged = true;
      // }
    });

    this.isLoaded = true;
  }

  getDirtyValues(form: any) {
    const dirtyValues = {};

    Object.keys(form.controls).forEach((key) => {
      const currentControl = form.controls[key];

      if (currentControl.dirty) {
        if (currentControl.controls) {
          dirtyValues[key] = this.getDirtyValues(currentControl);
        } else {
          dirtyValues[key] = currentControl.value;
        }
      }
    });
    // console.log(dirtyValues);
    return dirtyValues;
  }

  setupTfc() {
    // const txnFieldsMap$ = this.fg.valueChanges.pipe(
    //   startWith({}),
    //   switchMap((formValue) =>
    //     this.offlineService.getExpenseFieldsMap().pipe(
    //       switchMap((expenseFieldsMap) => {
    //         const fields = [
    //           'purpose',
    //           'txn_dt',
    //           'vendor_id',
    //           'cost_center_id',
    //           'project_id',
    //           'from_dt',
    //           'to_dt',
    //           'location1',
    //           'location2',
    //           'distance',
    //           'distance_unit',
    //           'flight_journey_travel_class',
    //           'flight_return_travel_class',
    //           'train_travel_class',
    //           'bus_travel_class',
    //           'billable',
    //           'tax_group_id',
    //         ];
    //         return this.expenseFieldsService.filterByOrgCategoryId(expenseFieldsMap, fields, formValue.category);
    //       })
    //     )
    //   )
    // );

    // this.txnFields$
    //   .pipe(
    //     distinctUntilChanged((a, b) => isEqual(a, b)),
    //     switchMap((txnFields) =>
    //       forkJoin({
    //         isConnected: this.isConnected$.pipe(take(1)),
    //         orgSettings: this.offlineService.getOrgSettings(),
    //         costCenters: this.costCenters$,
    //         taxGroups: this.taxGroups$,
    //       }).pipe(
    //         map(({ isConnected, orgSettings, costCenters, taxGroups }) => ({
    //           isConnected,
    //           txnFields,
    //           orgSettings,
    //           costCenters,
    //           taxGroups,
    //         }))
    //       )
    //     )
    //   )
    //   .subscribe(({ isConnected, txnFields, orgSettings, costCenters, taxGroups }) => {
    //     const keyToControlMap: {
    //       [id: string]: AbstractControl;
    //     } = {
    //       purpose: this.fg.controls.purpose,
    //       txn_dt: this.fg.controls.dateOfSpend,
    //       vendor_id: this.fg.controls.vendor_id,
    //       cost_center_id: this.fg.controls.costCenter,
    //       from_dt: this.fg.controls.from_dt,
    //       to_dt: this.fg.controls.to_dt,
    //       location1: this.fg.controls.location_1,
    //       location2: this.fg.controls.location_2,
    //       distance: this.fg.controls.distance,
    //       distance_unit: this.fg.controls.distance_unit,
    //       flight_journey_travel_class: this.fg.controls.flight_journey_travel_class,
    //       flight_return_travel_class: this.fg.controls.flight_return_travel_class,
    //       train_travel_class: this.fg.controls.train_travel_class,
    //       bus_travel_class: this.fg.controls.bus_travel_class,
    //       project_id: this.fg.controls.project,
    //       billable: this.fg.controls.billable,
    //       tax_group_id: this.fg.controls.tax_group,
    //     };
    //     for (const control of Object.values(keyToControlMap)) {
    //       control.clearValidators();
    //       control.updateValueAndValidity();
    //     }
    //     this.fg.updateValueAndValidity();
    //   });

    // this.etxn$
    //   .pipe(
    //     switchMap(() => txnFieldsMap$),
    //     map((txnFields) => this.expenseFieldsService.getDefaultTxnFieldValues(txnFields))
    //   )
    //   .subscribe((defaultValues) => {
    //     this.billableDefaultValue = defaultValues.billable;
    //     const keyToControlMap: {
    //       [id: string]: AbstractControl;
    //     } = {
    //       purpose: this.fg.controls.purpose,
    //       txn_dt: this.fg.controls.dateOfSpend,
    //       vendor_id: this.fg.controls.vendor_id,
    //       cost_center_id: this.fg.controls.costCenter,
    //       from_dt: this.fg.controls.from_dt,
    //       to_dt: this.fg.controls.to_dt,
    //       location1: this.fg.controls.location_1,
    //       location2: this.fg.controls.location_2,
    //       distance: this.fg.controls.distance,
    //       distance_unit: this.fg.controls.distance_unit,
    //       flight_journey_travel_class: this.fg.controls.flight_journey_travel_class,
    //       flight_return_travel_class: this.fg.controls.flight_return_travel_class,
    //       train_travel_class: this.fg.controls.train_travel_class,
    //       bus_travel_class: this.fg.controls.bus_travel_class,
    //       billable: this.fg.controls.billable,
    //       tax_group_id: this.fg.controls.tax_group,
    //     };

    //   for (const defaultValueColumn in defaultValues) {
    //     if (defaultValues.hasOwnProperty(defaultValueColumn)) {
    //       const control = keyToControlMap[defaultValueColumn];
    //       if (
    //         !['vendor_id', 'billable', 'tax_group_id'].includes(defaultValueColumn) &&
    //         !control.value &&
    //         !control.touched
    //       ) {
    //         control.patchValue(defaultValues[defaultValueColumn]);
    //       } else if (defaultValueColumn === 'vendor_id' && !control.value && !control.touched) {
    //         control.patchValue({
    //           display_name: defaultValues[defaultValueColumn],
    //         });
    //       } else if (
    //         defaultValueColumn === 'billable' &&
    //         this.fg.controls.project.value &&
    //         (control.value === null || control.value === undefined) &&
    //         !control.touched
    //       ) {
    //         control.patchValue(defaultValues[defaultValueColumn]);
    //       } else if (
    //         defaultValueColumn === 'tax_group_id' &&
    //         !control.value &&
    //         !control.touched &&
    //         control.value !== ''
    //       ) {
    //         this.taxGroups$.subscribe((taxGroups) => {
    //           const tg = taxGroups.find((tg) => (tg.name = defaultValues[defaultValueColumn]));
    //           control.patchValue(tg);
    //         });
    //       }
    //     }
    //   }
    // });

    this.attachments$ = this.fg.controls.receipt_ids.valueChanges.pipe(
      switchMap((etxn) => this.fileService.findByTransactionId(etxn)),
      switchMap((fileObjs) => from(fileObjs)),
      concatMap((fileObj: any) =>
        this.fileService.downloadUrl(fileObj.id).pipe(
          map((downloadUrl) => {
            fileObj.url = downloadUrl;
            const details = this.getReceiptDetails(fileObj);
            fileObj.type = details.type;
            fileObj.thumbnail = details.thumbnail;
            return fileObj;
          })
        )
      ),
      reduce((acc, curr) => acc.concat(curr), [])
    );
  }

  mergeExpense() {
    const selectedExpense = this.fg.value.target_txn_id;
    // console.log(selectedExpense);
    console.log(this.fg.value);
    console.log('78787878');
    console.log(this.generate());

    // return;
    const source_txn_ids = [];
    from(this.expenses)
      .pipe(
        map((expense) => {
          source_txn_ids.push(expense.tx_id);
        })
      )
      .subscribe(noop);
    const index = source_txn_ids.findIndex((id) => id === selectedExpense);
    source_txn_ids.splice(index, 1);
    // console.log(source_txn_ids);
    const form = this.generate();
    if (!this.fg.valid) {
      return;
    }
    this.isMerging = true;
    console.log(source_txn_ids, selectedExpense, form);
    this.mergeExpensesService
      .mergeExpenses(source_txn_ids, selectedExpense, form)
      .pipe(
        finalize(() => {
          this.isMerging = false;
          this.navController.back();
        })
      )
      .subscribe(noop);
  }

  generate() {
    this.fg.markAllAsTouched();

    console.log('909090');
    console.log(this.fg.controls.target_txn_id.touched);
    console.log(this.fg.controls.target_txn_id);
    console.log(this.fg.controls.target_txn_id.valid);

    return {
      // source_account_id: this.fg.value.paymentMode.acc.id,
      billable: this.fg.value.billable,
      currency: this.fg.value.currencyObj,
      amount: this.fg.value.amount,
      project_id: this.fg.value.project,
      tax_amount: this.fg.value.tax_amount,
      tax_group_id: this.fg.value.tax_group && this.fg.value.tax_group.id,
      org_category_id: this.fg.value.category && this.fg.value.category,
      fyle_category: this.fg.value.category && this.fg.value.category.category,
      policy_amount: null,
      vendor: this.fg.value.vendor_id && this.fg.value.vendor_id,
      purpose: this.fg.value.purpose,
      txn_dt: this.fg.value.dateOfSpend,
      receipt_ids: this.selectedReceiptsId,
    };
  }

  setupCustomFields() {
    this.customInputs$ = this.fg.controls.category.valueChanges.pipe(
      startWith({}),
      switchMap((category) =>
        this.offlineService.getCustomInputs().pipe(
          switchMap((fields) => {
            // console.log('-------------------category-----------');
            // console.log(category);
            const customFields = this.customInputsService.filterByCategory(fields, category);
            const customFieldsFormArray = this.fg.controls.custom_inputs as FormArray;
            customFieldsFormArray.clear();
            // console.log(customFields);
            for (const customField of customFields) {
              customFieldsFormArray.push(
                this.formBuilder.group({
                  name: [customField.name],
                  value: '',
                })
              );
            }
            customFieldsFormArray.updateValueAndValidity();
            return (this.dummyfields = customFields.map((customField, i) => ({
              ...customField,
              control: customFieldsFormArray.at(i),
            })));
          }),
          toArray()
        )
      ),
      tap(() => {
        // console.log('98989979786786876rdfgghcvgvchv ghbv bhb vghb vghb vfg');
        // console.log(this.dummyfields);
        // this.dummyfields.map((input) => {
        //   console.log(input);
        //   console.log(this.mergedCustomProperties[input.field_name]);
        //   console.log(this.mergedCustomProperties);
        // });
      })
    );
  }

  formatDateOptions(options) {
    return options.map((option) => {
      option.label = moment(option.label).format('MMM DD, YYYY');
      return option;
    });
  }

  formatPaymentModeOptions(options) {
    return options.map((option) => {
      if (option.value === 'PERSONAL_CORPORATE_CREDIT_CARD_ACCOUNT') {
        option.label = 'Paid via Corporate Card';
      } else if (option.value === 'PERSONAL_ACCOUNT') {
        option.label = 'Paid by Me';
      } else if (option.value === 'PERSONAL_ADVANCE_ACCOUNT') {
        option.label = 'Paid from Advance';
      }
      return option;
    });
  }

  formatBillableOptions(options) {
    return options.map((option) => {
      if (option.value === true) {
        option.label = 'Yes';
      } else {
        option.label = 'No';
      }
      return option;
    });
  }

  getActiveCategories() {
    const allCategories$ = this.offlineService.getAllEnabledCategories();

    allCategories$.pipe(map((catogories) => this.categoriesService.filterRequired(catogories))).subscribe((res) => {
      // console.log('categories');
      // console.log(res);
    });
  }

  getProjects() {
    // const orgSettings$ = this.offlineService.getOrgSettings();
    // this.isIndividualProjectsEnabled$ = orgSettings$.pipe(
    //   map((orgSettings) => orgSettings.advanced_projects)
    // );
    // this.isIndividualProjectsEnabled$.subscribe((reso) => {
    //   console.log('projects');
    //   console.log(reso);
    // });
    this.projectService.getAllActive().subscribe((reso) => {
      // console.log('projects');
      // console.log(reso);
    });
  }

  formatProjectOptions(options) {
    if (!options || !this.projects) {
      return;
    }
    return options.map((option) => {
      option.label = this.projects[this.projects.map((project) => project.id).indexOf(option.value)].name;
      return option;
    });
  }

  formatCategoryOptions(options) {
    if (!options || !this.categories) {
      return;
    }
    return options.map((option) => {
      option.label = this.categories[this.categories.map((category) => category.id).indexOf(option.value)]?.displayName;
      return option;
    });
  }

  getReceiptDetails(file) {
    const ext = this.getReceiptExtension(file.name);
    const res = {
      type: 'unknown',
      thumbnail: 'img/fy-receipt.svg',
    };

    if (ext && ['pdf'].indexOf(ext) > -1) {
      res.type = 'pdf';
      res.thumbnail = 'img/fy-pdf.svg';
    } else if (ext && ['png', 'jpg', 'jpeg', 'gif'].indexOf(ext) > -1) {
      res.type = 'image';
      res.thumbnail = file.url;
    }

    return res;
  }

  getReceiptExtension(name) {
    let res = null;

    if (name) {
      const filename = name.toLowerCase();
      const idx = filename.lastIndexOf('.');

      if (idx > -1) {
        res = filename.substring(idx + 1, filename.length);
      }
    }

    return res;
  }

  generateCustomInputOptions() {
    console.log('--------Custom properties--------------');
    const customProperties = this.expenses.map((expense) => expense.tx_custom_properties);

    let mergedCustomProperties = [].concat.apply([], customProperties);

    console.log(mergedCustomProperties);
    mergedCustomProperties = mergedCustomProperties.map((res) => {
      if (res.value && res.value.display) {
        res.value = res.value.display;
        res.id = res.value.id;
      }
      return res;
    });
    console.log(mergedCustomProperties);

    let output = [];

    mergedCustomProperties.forEach(function (item) {
      const existing = output.filter(function (v) {
        return v.name === item.name;
      });
      if (existing.length) {
        const existingIndex = output.indexOf(existing[0]);
        if (!output[existingIndex].value) {
          output[existingIndex].value = [];
        }
        output[existingIndex].value = output[existingIndex].value.concat(item.value);
      } else {
        if (typeof item.value == 'string') {
          item.value = [item.value];
        }
        output.push(item);
      }
    });

    output = output.map((item) => ({
      name: item.name,
      options: item.value,
      id: item.id,
    }));
    console.log('output 1');
    console.log(output);
    const finalOut = output.map((res) => {
      console.log(res);
      let options;
      if (res.options) {
        options = res.options.filter((el) => el != null);

        const isDuplicate = options.some((item, idx) => options.indexOf(item) !== idx);

        options = options.map(
          (res) =>
            (res = {
              label: res,
              value: res,
            })
        );
        res.isSame = isDuplicate;
        res.options = options;
      } else {
        res.options = [];
      }
      return res;
    });
    console.log('output 2');
    console.log(finalOut);

    finalOut.map((res) => {
      this.mergedCustomProperties[res.name] = res;
    });
    console.log(this.mergedCustomProperties);
  }

  onExpenseChanged(selectedIndex) {
    from(Object.keys(this.expenses[selectedIndex])).subscribe((item) => {
      const valueArr = this.mergedExpenseOptions[item].options.map((item) => item.value);
      const isDuplicate = valueArr.some((item, idx) => valueArr.indexOf(item) !== idx);
      if (
        this.mergedExpenseOptions[item].options[selectedIndex] &&
        this.mergedExpenseOptions[item].options[selectedIndex].value &&
        !isDuplicate
      ) {
        this.fg.patchValue({
          receipt_ids: this.expenses[selectedIndex].tx_split_group_id,
        });

        if (item === 'source_account_type') {
          this.fg.patchValue({
            paymentMode: this.mergedExpenseOptions[item].options[selectedIndex].value,
          });
        }

        if (item === 'tx_currency') {
          this.fg.patchValue({
            currencyObj: this.mergedExpenseOptions[item].options[selectedIndex].value,
          });
        }

        if (item === 'tx_txn_dt') {
          this.fg.patchValue({
            dateOfSpend: this.mergedExpenseOptions[item].options[selectedIndex].value,
          });
        }

        if (item === 'tx_amount') {
          this.fg.patchValue({
            amount: this.mergedExpenseOptions[item].options[selectedIndex].value,
          });
        }

        if (item === 'tx_billable') {
          this.fg.patchValue({
            billable: this.mergedExpenseOptions[item].options[selectedIndex].value,
          });
        }

        if (item === 'tx_project_id') {
          this.fg.patchValue({
            project: this.mergedExpenseOptions[item].options[selectedIndex].value,
          });
        }

        if (item === 'tx_vendor_id') {
          this.fg.patchValue({
            vendor_id: this.mergedExpenseOptions[item].options[selectedIndex].value,
          });
        }
        if (item === 'tx_org_category_id') {
          this.fg.patchValue({
            category: this.mergedExpenseOptions[item].options[selectedIndex].value,
          });
        }
      }
    });
  }
}
