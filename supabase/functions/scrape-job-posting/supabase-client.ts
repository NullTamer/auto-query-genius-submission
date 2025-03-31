
/**
 * Supabase client wrapper for Deno edge functions
 * 
 * Provides a simpler API to interact with Supabase from edge functions
 * without requiring the full Supabase client library.
 */

export class SupabaseClient {
  private supabaseUrl: string;
  private serviceRoleKey: string;

  constructor(supabaseUrl: string, serviceRoleKey: string) {
    this.supabaseUrl = supabaseUrl;
    this.serviceRoleKey = serviceRoleKey;
  }

  /**
   * Select data from a table
   * 
   * @param table - Table name
   * @param columns - Columns to select
   * @param filters - Object of column:value pairs for filtering
   * @param options - Additional options (limit, single)
   */
  async select(
    table: string, 
    columns: string = '*', 
    filters?: Record<string, any>,
    options?: { limit?: number, single?: boolean }
  ) {
    let url = `${this.supabaseUrl}/rest/v1/${table}?select=${columns}`;
    
    if (filters) {
      for (const [column, value] of Object.entries(filters)) {
        url += `&${column}=eq.${value}`;
      }
    }
    
    if (options?.limit) {
      url += `&limit=${options.limit}`;
    }
    
    const response = await fetch(url, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching from ${table}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return options?.single ? (data.length ? data[0] : null) : data;
  }

  /**
   * Insert data into a table
   * 
   * @param table - Table name
   * @param values - Data to insert
   * @param options - Additional options (returnData)
   */
  async insert(
    table: string, 
    values: any | any[], 
    options?: { returnData?: boolean }
  ) {
    const response = await fetch(`${this.supabaseUrl}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Prefer': options?.returnData ? 'return=representation' : 'return=minimal'
      },
      body: JSON.stringify(values)
    });
    
    if (!response.ok) {
      throw new Error(`Error inserting into ${table}: ${response.statusText}`);
    }
    
    if (options?.returnData) {
      const data = await response.json();
      return data;
    }
    
    return true;
  }

  /**
   * Update data in a table
   * 
   * @param table - Table name
   * @param values - Data to update
   * @param filters - Object of column:value pairs for filtering
   */
  async update(
    table: string, 
    values: any, 
    filters: Record<string, any>
  ) {
    let url = `${this.supabaseUrl}/rest/v1/${table}`;
    
    // Add filters as query parameters
    const filterParams = Object.entries(filters)
      .map(([column, value]) => `${column}=eq.${value}`)
      .join('&');
    
    if (filterParams) {
      url += `?${filterParams}`;
    }
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        ...this.getHeaders(),
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(values)
    });
    
    if (!response.ok) {
      throw new Error(`Error updating ${table}: ${response.statusText}`);
    }
    
    return true;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.serviceRoleKey}`,
      'apikey': this.serviceRoleKey,
      'Content-Type': 'application/json'
    };
  }
}
