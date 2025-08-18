
class CompanyCache {
  private cache: any = null;
  private promise: Promise<any> | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getCompany(): Promise<any> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cache;
    }

    // Return existing promise if one is in flight
    if (this.promise) {
      return this.promise;
    }

    // Import getUserCompany dynamically to avoid circular dependencies
    this.promise = import('../services/companyService').then(module => module.getUserCompany());
    
    try {
      this.cache = await this.promise;
      this.lastFetch = now;
      return this.cache;
    } catch (error) {
      this.cache = null;
      throw error;
    } finally {
      this.promise = null;
    }
  }

  invalidate() {
    this.cache = null;
    this.lastFetch = 0;
  }

  getCached() {
    return this.cache;
  }
}

export const companyCache = new CompanyCache();
