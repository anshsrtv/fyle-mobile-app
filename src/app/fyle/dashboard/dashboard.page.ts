import { Component, OnInit } from '@angular/core';
import { MobileEventService } from 'src/app/core/services/mobile-event.service';
import { DashboardService } from 'src/app/fyle/dashboard/dashboard.service';
import { OfflineService } from 'src/app/core/services/offline.service';
import { forkJoin, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  dashboardList: { title: string, isVisible: boolean, isCollapsed: boolean, class: string, icon: string, subTitle: string }[];
  isDashboardCardExpanded: boolean;
  pageTitle: string;
  orgUserSettings$: Observable<any>;
  orgSettings$: Observable<any>;
  homeCurrency$: Observable<any>;

  constructor(
    private mobileEventService: MobileEventService,
    private dashboardService: DashboardService,
    private offlineService: OfflineService
  ) { }


  dashboardCardExpanded() {
    this.isDashboardCardExpanded = true;
    const expandedCard = this.dashboardList.filter((item) => {
      return (!item.isCollapsed);
    });
    this.pageTitle = (expandedCard && expandedCard.length > 0) ? expandedCard[0].title + ' Overview' : this.pageTitle;
  }

  backButtonClick() {
    this.dashboardList = this.dashboardList.map((item) => {
      item.isCollapsed = true;
      return item;
    });
    this.dashboardService.setDashBoardState('default');
    this.reset();
  }

  reset() {
    this.isDashboardCardExpanded = false;
    this.pageTitle = 'dashboard';
    forkJoin({
      orgUserSettings: this.orgUserSettings$,
      orgSettings: this.orgSettings$
    }).subscribe(res => {
      this.dashboardList = [{
        title: 'expenses',
        isVisible: true,
        isCollapsed: false,
        class: 'expenses',
        icon: 'fy-receipts',
        subTitle: 'Expense'
      },
      {
        title: 'reports',
        isVisible: true,
        isCollapsed: false,
        class: 'reports',
        icon: 'fy-reports',
        subTitle: 'Report'
      },
      {
        title: 'corporate cards',
        isVisible: !!(res.orgSettings.corporate_credit_card_settings.enabled),
        isCollapsed: false,
        class: 'corporate-cards',
        icon: 'fy-card',
        subTitle: 'Unmatched Expense'
      },
      {
        title: 'advances',
        isVisible: !!(res.orgSettings.advances.enabled || res.orgSettings.advance_requests.enabled),
        isCollapsed: false,
        class: 'advances',
        icon: 'fy-wallet',
        subTitle: 'Advance Request'
      },
      {
        title: 'trips',
        isVisible: !!(res.orgSettings.trip_requests.enabled
          && (!res.orgSettings.trip_requests.enable_for_certain_employee
            || (res.orgSettings.trip_requests.enable_for_certain_employee && res.orgUserSettings.trip_request_org_user_settings.enabled))),
        isCollapsed: false,
        class: 'trips',
        icon: 'fy-trips',
        subTitle: 'Trip Request'
      }];
    });

  }

  ionViewWillEnter() {
    this.orgUserSettings$ = this.offlineService.getOrgUserSettings().pipe(
     shareReplay(),
    );
    this.orgSettings$ = this.offlineService.getOrgSettings().pipe(
      shareReplay(),
    );
    this.homeCurrency$ = this.offlineService.getHomeCurrency().pipe(
      shareReplay(),
    );
    this.dashboardList = [];
    this.reset();

    this.mobileEventService.onDashboardCardExpanded().subscribe(() => {
      this.dashboardCardExpanded();
    });
  }

  ngOnInit() {
  }
}
