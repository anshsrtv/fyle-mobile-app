import {Injectable} from '@angular/core';
import {JwtHelperService} from './jwt-helper.service';
import {TokenService} from './token.service';
import {ApiService} from './api.service';
import {User} from '../models/user.model';
import {concatMap, map, reduce, switchMap, tap} from 'rxjs/operators';
import {AuthService} from './auth.service';
import {Observable, range, Subject, from} from 'rxjs';
import {ExtendedOrgUser} from '../models/extended-org-user.model';
import {DataTransformService} from './data-transform.service';
import {StorageService} from './storage.service';
import {Cacheable, globalCacheBusterNotifier, CacheBuster} from 'ts-cacheable';
import {TrackingService} from './tracking.service';
import { ApiV2Service } from './api-v2.service';
import { Employee } from '../models/employee.model';

const orgUsersCacheBuster$ = new Subject<void>();

@Injectable({
  providedIn: 'root'
})
export class OrgUserService {

  constructor(
    private jwtHelperService: JwtHelperService,
    private tokenService: TokenService,
    private apiService: ApiService,
    private authService: AuthService,
    private dataTransformService: DataTransformService,
    private storageService: StorageService,
    private trackingService: TrackingService,
    private apiV2Service: ApiV2Service
  ) { }


  postUser(user: User) {
    globalCacheBusterNotifier.next();
    return this.apiService.post('/users', user);
  }

  postOrgUser(orgUser) {
    globalCacheBusterNotifier.next();
    return this.apiService.post('/orgusers', orgUser);
  }

  markActive() {
    return this.apiService.post('/orgusers/current/mark_active').pipe(
      switchMap(() => {
        return this.authService.refreshEou();
      }),
      tap(() => this.trackingService.activated({Asset: 'Mobile'}))
    );
  }

  // TODO: move to v2
  @Cacheable({
    cacheBusterObserver: orgUsersCacheBuster$
  })
  getCompanyEouc(params: { offset: number, limit: number }) {
    return this.apiService.get('/eous/company', {
      params
    }).pipe(
      map(
        eous => eous.map(eou => this.dataTransformService.unflatten(eou) as ExtendedOrgUser)
      )
    );
  }

  getAllCompanyEouc() {
    return this.getCompanyEouCount().pipe(
      switchMap(res => {
        const count = res.count > 50 ? res.count / 50 : 1;
        return range(0, count);
      }),
      concatMap(page => {
        return this.getCompanyEouc({ offset: 50 * page, limit: 50 });
      }),
      reduce((acc, curr) => {
        return acc.concat(curr);
      }, [] as ExtendedOrgUser[])
    );
  }

  getCompanyEouCount(): Observable<{ count: number }> {
    return this.apiService.get('/eous/company/count').pipe(
      map(
        res => res as { count: number }
      )
    );
  }

  getEmployeesByParams(params): Observable<{
    count: number,
    data: Employee[],
    limit: number,
    offset: number,
    url: string}> {
    return this.apiV2Service.get('/employees', {params});
  }

  getEmployees(params) {
    return this.getEmployeesByParams({...params, limit: 1}).pipe(
      switchMap(res => {
        const count = res.count > 200 ? res.count / 200 : 1;
        return range(0, count);
      }),
      concatMap(page => {
        return this.getEmployeesByParams({ ...params, offset: 200 * page, limit: 200 });
      }),
      reduce((acc, curr) => {
        return acc.concat(curr.data);
      }, [] as Employee[])
    );
  }

  getEmployeesBySearch(params) {
    if (params.or) {
      params.and = `(or${params.or},or(ou_status.like.*"ACTIVE",ou_status.like.*"PENDING_DETAILS"))`;
    } else {
      params.or = '(ou_status.like.*"ACTIVE",ou_status.like.*"PENDING_DETAILS")';
    }
    return this.getEmployeesByParams({
      ...params,
    }).pipe(
      map(res => res.data)
    );
  }


  exclude(eous: ExtendedOrgUser[], userIds: string[]) {
    return eous.filter((eou) => {
      return userIds.indexOf(eou.ou.id) === -1;
    });
  }

  @Cacheable()
  getCurrent() {
    return this.apiService.get('/eous/current').pipe(
      map(eou => {
        return this.dataTransformService.unflatten(eou);;
      })
    );
  }


  // TODO: move to v2
  findDelegatedAccounts() {
    return this.apiService.get('/eous/current/delegated_eous').pipe(
      map(delegatedAccounts => {
        delegatedAccounts = delegatedAccounts.map((delegatedAccount) => {
          return this.dataTransformService.unflatten(delegatedAccount);
        });

        return delegatedAccounts;
      })
    );
  }

  excludeByStatus(eous: ExtendedOrgUser[], status: string) {
    const eousFiltered = eous.filter((eou) => {
      return status.indexOf(eou.ou.status) === -1;
    });
    return eousFiltered;
  }

  filterByRole(eous: ExtendedOrgUser[], role: string) {
    const eousFiltered = eous.filter((eou) => {
      return eou.ou.roles.indexOf(role);
    });

    return eousFiltered;
  }

  filterByRoles(eous: ExtendedOrgUser[], role) {
    const filteredEous = eous.filter(eou => {
      return role.some(userRole => {
        if (eou.ou.roles.indexOf(userRole) > -1) {
          return true;
        }
      });
    });

    return filteredEous;
  }

  @CacheBuster({
    cacheBusterNotifier: orgUsersCacheBuster$
  })
  switchToDelegator(orgUser) {
    return this.apiService.post('/orgusers/delegator_refresh_token', orgUser).pipe(
      switchMap(data => {
        return this.authService.newRefreshToken(data.refresh_token);
      })
    );
  }

  switchToDelegatee() {
    return this.apiService.post('/orgusers/delegatee_refresh_token').pipe(
      switchMap(data => {
        return this.authService.newRefreshToken(data.refresh_token);
      })
    );
  }

  async isSwitchedToDelegator() {
    const accessToken = this.jwtHelperService.decodeToken(await this.tokenService.getAccessToken());
    return accessToken && !!accessToken.proxy_org_user_id;
  }

  verifyMobile() {
    return this.apiService.post('/orgusers/verify_mobile');
  }

  checkMobileVerificationCode(otp) {
    return this.apiService.postWithConfig('/orgusers/check_mobile_verification_code', otp, {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    });
  }
}
