const API_BASE = "https://auction-platform-backend-uvjo.onrender.com";

export async function apiCall(
  endpoint: string,
  options: RequestInit = {},
): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "API request failed");
  }

  return response.json();
}

// Products
export const productAPI = {
  getAll: (filters?: {
    categoryId?: string;
    sellerId?: string;
    status?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.categoryId) params.append("categoryId", filters.categoryId);
    if (filters?.sellerId) params.append("sellerId", filters.sellerId);
    if (filters?.status) params.append("status", filters.status);
    const queryString = params.toString();
    return apiCall(`/products${queryString ? `?${queryString}` : ""}`);
  },
  getById: (id: string) => apiCall(`/products/${id}`),
  create: (data: any) =>
    apiCall("/products", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiCall(`/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiCall(`/products/${id}`, { method: "DELETE" }),
};

// Auctions
export const auctionAPI = {
  getAll: (status?: string) =>
    apiCall(`/auctions${status ? `?status=${status}` : ""}`),
  getById: (id: string) => apiCall(`/auctions/${id}`),
  getBySeller: (sellerId: string) => apiCall(`/auctions/seller/${sellerId}`),
  create: (data: any) =>
    apiCall("/auctions", { method: "POST", body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string) =>
    apiCall(`/auctions/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  delete: (id: string) => apiCall(`/auctions/${id}`, { method: "DELETE" }),
};

// Bids
export const bidAPI = {
  place: (data: any) =>
    apiCall("/bids", { method: "POST", body: JSON.stringify(data) }),
  getByAuction: (auctionId: string) => apiCall(`/bids/auction/${auctionId}`),
  getByUser: (userId: string) => apiCall(`/bids/user/${userId}`),
  getByEventProduct: (eventProductId: string) =>
    apiCall(`/bids/event-product/${eventProductId}`),
};

// Events (Live Auctions)
export const eventAPI = {
  getAll: (sellerId?: string) =>
    apiCall(`/events${sellerId ? `?sellerId=${sellerId}` : ""}`),
  getById: (id: string) => apiCall(`/events/${id}`),
  create: (data: any) =>
    apiCall("/events", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiCall(`/events/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  addProduct: (eventId: string, productId: string, order: number) =>
    apiCall(`/events/${eventId}/products`, {
      method: "POST",
      body: JSON.stringify({ productId, order }),
    }),
  updateStatus: (id: string, status: string) =>
    apiCall(`/events/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  getLiveStatus: (id: string) => apiCall(`/events/${id}/live-status`),
  start: (id: string) => apiCall(`/events/${id}/start`, { method: "POST" }),
  end: (id: string) => apiCall(`/events/${id}/end`, { method: "POST" }),
  activateProduct: (id: string, eventProductId: string, duration: number) =>
    apiCall(`/events/${id}/products/${eventProductId}/activate`, {
      method: "POST",
      body: JSON.stringify({ duration }),
    }),
  endProduct: (id: string, eventProductId: string) =>
    apiCall(`/events/${id}/products/${eventProductId}/end`, { method: "POST" }),
  removeProduct: (id: string, eventProductId: string) =>
    apiCall(`/events/${id}/products/${eventProductId}`, { method: "DELETE" }),
  delete: (id: string) => apiCall(`/events/${id}`, { method: "DELETE" }),
};

// Categories
export const categoryAPI = {
  getAll: () => apiCall("/categories"),
  getById: (id: string) => apiCall(`/categories/${id}`),
  create: (data: any) =>
    apiCall("/categories", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    apiCall(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: string) => apiCall(`/categories/${id}`, { method: "DELETE" }),
};

// Users
export const userAPI = {
  getProfile: () => apiCall("/users/profile"),
  getById: (id: string) => apiCall(`/users/${id}`),
  getAll: () => apiCall("/users"),
  update: (id: string, data: any) =>
    apiCall(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
};

// Analytics
export const analyticsAPI = {
  getSeller: (sellerId: string) => apiCall(`/analytics/seller/${sellerId}`),
  getPlatform: () => apiCall("/analytics/platform"),
};

// Orders
export const orderAPI = {
  create: (data: any) =>
    apiCall("/orders", { method: "POST", body: JSON.stringify(data) }),
  getMyOrders: () => apiCall("/orders/user/me"),
  getSellerOrders: () => apiCall("/orders/seller/me"),
  getUserOrders: (userId: string) => apiCall(`/orders/user/${userId}`),
  getById: (id: string) => apiCall(`/orders/${id}`),
};
