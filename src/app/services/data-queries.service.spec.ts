import { TestBed } from '@angular/core/testing';

import { DataQueriesService } from './data-queries.service';

describe('DataQueriesService', () => {
  let service: DataQueriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataQueriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
