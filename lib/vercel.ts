export class VercelClient {
  private apiToken: string;
  private baseUrl = 'https://api.vercel.com';

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Vercel API request failed');
    }

    return response.json();
  }

  async getProject(projectId: string) {
    return this.request(`/v9/projects/${projectId}`);
  }

  async getDomains(projectId: string) {
    const { domains } = await this.request(`/v9/projects/${projectId}/domains`);
    console.log("...............................")
    console.log(domains)
    console.log("...............................")

    return domains;
  }

  async addDomain(projectId: string, domain: string) {
    return this.request(`/v9/projects/${projectId}/domains`, {
      method: 'POST',
      body: JSON.stringify({ name: domain }),
    });
  }

  async verifyDomain(projectId: string, domain: string) {
    return this.request(`/v9/projects/${projectId}/domains/${domain}/verify`, {
      method: 'POST',
    });
  }

  async removeDomain(projectId: string, domain: string) {
    return this.request(`/v9/projects/${projectId}/domains/${domain}`, {
      method: 'DELETE',
    });
  }
}