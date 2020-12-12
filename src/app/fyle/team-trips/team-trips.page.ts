import { Component, OnInit, EventEmitter } from '@angular/core';
import { Subject, Observable, from, noop, concat } from 'rxjs';
import { ExtendedTripRequest } from 'src/app/core/models/extended_trip_request.model';
import { concatMap, switchMap, finalize, map, scan, shareReplay } from 'rxjs/operators';
import { LoaderService } from 'src/app/core/services/loader.service';
import { TripRequestsService } from 'src/app/core/services/trip-requests.service';
import { NetworkService } from 'src/app/core/services/network.service';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-team-trips',
  templateUrl: './team-trips.page.html',
  styleUrls: ['./team-trips.page.scss'],
})
export class TeamTripsPage implements OnInit, ViewWillEnter {

  isConnected$: Observable<boolean>;
  teamTripRequests$: Observable<ExtendedTripRequest[]>;
  count$: Observable<number>;
  isInfiniteScrollRequired$: Observable<boolean>;
  loadData$: Subject<{pageNumber: number, state: string}> = new Subject();
  currentPageNumber = 1;
  state = 'PENDING';

  constructor(
    private loaderService: LoaderService,
    private tripRequestsService: TripRequestsService,
    private networkService: NetworkService,
    private router: Router
  ) { }

  ionViewWillEnter() {
    this.teamTripRequests$ = this.loadData$.pipe(
      concatMap(({ pageNumber, state }) => {

        const extraParams = state === 'PENDING'? { 
          trp_approval_state: ['in.(APPROVAL_PENDING)'],
          trp_state: 'eq.APPROVAL_PENDING'
        }: { 
          or: ['(trp_is_pulled_back.is.false,trp_is_pulled_back.is.null)'],
          trp_approval_state: ['in.(APPROVAL_PENDING,APPROVAL_DONE,APPROVAL_REJECTED)']
        };

        return from(this.loaderService.showLoader()).pipe(
          switchMap(() => {
            return this.tripRequestsService.getTeamTrips({
              offset: (pageNumber - 1) * 10,
              limit: 10,
              queryParams: {
                ...extraParams
              }
            });
          }),
          finalize(() => {
            return from(this.loaderService.hideLoader());
          })
        );
      }),
      map(res => res.data),
      scan((acc, curr) => {
        if (this.currentPageNumber === 1) {
          return curr;
        }
        return acc.concat(curr);
      }, [] as ExtendedTripRequest[]),
      shareReplay()
    );

    this.count$ = this.loadData$.pipe(
      switchMap(({ state })=> {
        const extraParams = state === 'PENDING'? { 
          trp_approval_state: ['in.(APPROVAL_PENDING)'],
          trp_state: 'eq.APPROVAL_PENDING'
        }: { 
          or: ['(trp_is_pulled_back.is.false,trp_is_pulled_back.is.null)'],
          trp_approval_state: ['in.(APPROVAL_PENDING,APPROVAL_DONE,APPROVAL_REJECTED)']
        };

        return this.tripRequestsService.getTeamTripsCount(
          {
            ...extraParams
          }
        );
      }),
      shareReplay()
    );
    
    // this.tripRequestsService.getTeamTripsCount({
    //   trp_approval_state: ['in.(APPROVAL_PENDING)'],
    //   trp_state: 'eq.APPROVAL_PENDING'
    // }).pipe(
    //   shareReplay()
    // );

    this.isInfiniteScrollRequired$ = this.teamTripRequests$.pipe(
      concatMap(teamTrips => {
        return this.count$.pipe(map(count => {
          return count > teamTrips.length;
        }));
      })
    );

    this.loadData$.subscribe(noop);
    this.teamTripRequests$.subscribe(noop);
    this.count$.subscribe(noop);
    this.isInfiniteScrollRequired$.subscribe(noop);
    this.loadData$.next({ pageNumber: this.currentPageNumber, state: this.state});

    this.setupNetworkWatcher();
  }

  ngOnInit() {

  }

  doRefresh(event) {
    this.currentPageNumber = 1;
    this.loadData$.next({ pageNumber: this.currentPageNumber, state: this.state});
    event.target.complete();
  }

  loadData(event) {
    this.currentPageNumber = this.currentPageNumber + 1;
    this.loadData$.next({ pageNumber: this.currentPageNumber, state: this.state});
    event.target.complete();
  }

  setupNetworkWatcher() {
    const networkWatcherEmitter = new EventEmitter<boolean>();
    this.networkService.connectivityWatcher(networkWatcherEmitter);
    this.isConnected$ = concat(this.networkService.isOnline(), networkWatcherEmitter.asObservable());
    this.isConnected$.subscribe((isOnline) => {
      if (!isOnline) {
        this.router.navigate(['/', 'enterprise', 'my_expenses']);
      }
    });
  }

  onTripClick(clickedTrip: ExtendedTripRequest) {
    this.router.navigate(['/', 'enterprise', 'view_team_trips', { id: clickedTrip.trp_id }]);
  }

  changeState(state) {
    this.currentPageNumber = 1;
    this.state = state;
    this.loadData$.next({ pageNumber: this.currentPageNumber, state: this.state});
  }

}
