const API_BASE_URL = import.meta.env.VITE_API_URL || "https://london-kollection.onrender.com";

class ApiService {
  constructor() {
    this.accessToken = null;
  }

  setAccessToken(token) {
    this.accessToken = token;
  }

  clearAccessToken() {
    this.accessToken = null;
  }

  getHeaders(includeAuth = true) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (includeAuth && this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  async request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      ...options,
      headers: {
        ...this.getHeaders(options.includeAuth !== false),
        ...(options.headers || {}),
      },
    });

    let data = null;

    try {
      data = await response.json();
    } catch (error) {
      throw new Error("Server error: Invalid response format");
    }

    if (!response.ok) {
      const error = new Error(data.message || "An error occurred");
      error.status = response.status;
      error.code = data.code;
      throw error;
    }

    return data;
  }

  async register(userData) {
    const data = await this.request("/api/auth/register", {
      method: "POST",
      includeAuth: false,
      body: JSON.stringify(userData),
    });

    if (data.data?.accessToken) {
      this.setAccessToken(data.data.accessToken);
    }

    return data;
  }

  async login(credentials) {
    const data = await this.request("/api/auth/login", {
      method: "POST",
      includeAuth: false,
      body: JSON.stringify(credentials),
    });

    if (data.data?.accessToken) {
      this.setAccessToken(data.data.accessToken);
    }

    return data;
  }

  async refreshToken(refreshToken) {
    const data = await this.request("/api/auth/refresh", {
      method: "POST",
      includeAuth: false,
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
    });

    if (data.data?.accessToken) {
      this.setAccessToken(data.data.accessToken);
    }

    return data;
  }

  async logout() {
    try {
      await this.request("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      this.clearAccessToken();
    }
  }

  async forgotPassword(email) {
    return this.request("/api/auth/forgot-password", {
      method: "POST",
      includeAuth: false,
      body: JSON.stringify({ email }),
    });
  }

  async verifyResetOtp(payload) {
    return this.request("/api/auth/verify-reset-otp", {
      method: "POST",
      includeAuth: false,
      body: JSON.stringify(payload),
    });
  }

  async resetPassword(payload) {
    return this.request("/api/auth/reset-password", {
      method: "POST",
      includeAuth: false,
      body: JSON.stringify(payload),
    });
  }

  async getProfile() {
    return this.request("/api/users/profile", {
      method: "GET",
    });
  }

  async updateProfile(profileData) {
    return this.request("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async getProducts(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.featured) params.append("featured", "true");
    if (filters.skip) params.append("skip", String(filters.skip));
    if (filters.limit) params.append("limit", String(filters.limit));

    const queryString = params.toString();
    const data = await this.request(`/api/products${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
      includeAuth: false,
    });

    return {
      success: data.success ?? true,
      data: Array.isArray(data.data) ? data.data : [],
    };
  }

  async getFeaturedProducts(limit = 5) {
    const data = await this.request(`/api/products/featured?limit=${limit}`, {
      method: "GET",
      includeAuth: false,
    });

    return {
      success: data.success ?? true,
      data: Array.isArray(data.data) ? data.data : [],
    };
  }

  async getProductDetail(idOrSlug) {
    return this.request(`/api/products/${idOrSlug}`, {
      method: "GET",
      includeAuth: false,
    });
  }

  async getCategories() {
    return this.request("/api/products/categories", {
      method: "GET",
      includeAuth: false,
    });
  }

  async createProduct(productData) {
    return this.request("/api/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId, productData) {
    return this.request(`/api/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(productId) {
    return this.request(`/api/products/${productId}`, {
      method: "DELETE",
    });
  }

  async createOrder(orderData) {
    return this.request("/api/orders/create", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async verifyPayment(paymentData) {
    return this.request("/api/orders/verify", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  async reportPaymentFailure(paymentData) {
    return this.request("/api/orders/payment-failure", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  async getOrder(orderId) {
    return this.request(`/api/orders/${orderId}`, {
      method: "GET",
    });
  }

  async getMyOrders() {
    return this.request("/api/orders/my-orders", {
      method: "GET",
    });
  }

  async getUserOrders() {
    return this.request("/api/orders", {
      method: "GET",
    });
  }
}

export default new ApiService();
