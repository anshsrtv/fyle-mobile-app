import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiV2Service } from './api-v2.service';
import { ApiService } from './api.service';
import { ISODateString } from '@capacitor/core';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root',
})
export class MergeExpensesService {
  constructor(private apiService: ApiService) {}

  mergeExpenses(sourceTxnIds: string[], targetTxnId: string, targetTxnFields): Observable<string> {
    return this.apiService.post('/transactions/merge', {
      source_txn_ids: sourceTxnIds,
      target_txn_id: targetTxnId,
      target_txn_fields: targetTxnFields,
    });
  }
}
