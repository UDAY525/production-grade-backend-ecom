import type { Pool, PoolClient, QueryResult, QueryResultRow } from "pg"; // 1. Import QueryResultRow
import { db } from "../../config/db.js"; // Added .js extension if you are tracking your ESM setup

export abstract class BaseRepository {
  protected readonly client: Pool | PoolClient;

  constructor(client?: PoolClient) {
    this.client = client ?? db;
  }

  // 2. Add 'extends QueryResultRow' to the generic type placeholder constraint
  protected query<T extends QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.client.query<T>(sql, params);
  }
}
