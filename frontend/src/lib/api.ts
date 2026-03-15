// Client: dùng /api (proxy qua rewrites, cùng origin, không CORS)
// Server: dùng API_SERVER_URL hoặc NEXT_PUBLIC_API_BASE_URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

function getApiBase(): string {
  if (typeof window !== "undefined") {
    return API_BASE_URL.startsWith("/") ? window.location.origin + API_BASE_URL : API_BASE_URL;
  }
  const internalUrl = process.env.API_SERVER_URL;
  if (internalUrl && internalUrl.startsWith("http")) return internalUrl;
  if (API_BASE_URL.startsWith("http")) return API_BASE_URL;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return base.replace(/\/$/, "") + (API_BASE_URL.startsWith("/") ? API_BASE_URL : "/" + API_BASE_URL);
}

const base = () => getApiBase();

export const apiEndpoints = {
  auth: {
    get login() { return base() + "/v1/auth/login"; },
    get me() { return base() + "/v1/auth/me"; },
    get logout() { return base() + "/v1/auth/logout"; }
  },
  categories: {
    get listPublic() { return base() + "/v1/categories"; },
    publicDetail: (slug: string) => base() + `/v1/categories/${slug}`,
    adminDetail: (id: string) => base() + `/v1/admin/categories/${id}`,
    get adminCreate() { return base() + "/v1/admin/categories"; },
    adminUpdate: (id: string) => base() + `/v1/admin/categories/${id}`,
    adminDelete: (id: string) => base() + `/v1/admin/categories/${id}`
  },
  products: {
    get listPublic() { return base() + "/v1/products"; },
    get segments() { return base() + "/v1/products/segments"; },
    publicDetail: (slug: string) => base() + `/v1/products/${slug}`,
    get adminList() { return base() + "/v1/admin/products"; },
    adminDetail: (id: string) => base() + `/v1/admin/products/${id}`,
    get adminCreate() { return base() + "/v1/admin/products"; },
    adminUpdate: (id: string) => base() + `/v1/admin/products/${id}`,
    adminDelete: (id: string) => base() + `/v1/admin/products/${id}`
  },
  showroom: {
    get public() { return base() + "/v1/showroom"; },
    get admin() { return base() + "/v1/admin/showroom"; }
  },
  leads: {
    get create() { return base() + "/v1/leads"; },
    get adminList() { return base() + "/v1/admin/leads"; },
    adminDetail: (id: string) => base() + `/v1/admin/leads/${id}`,
    adminUpdateStatus: (id: string) => base() + `/v1/admin/leads/${id}`
  },
  uploads: {
    get images() { return base() + "/v1/uploads/images"; }
  },
  posts: {
    get listPublic() { return base() + "/v1/posts"; },
    publicDetail: (slug: string) => base() + `/v1/posts/${slug}`,
    adminDetail: (id: string) => base() + `/v1/admin/posts/${id}`,
    get adminCreate() { return base() + "/v1/admin/posts"; },
    adminUpdate: (id: string) => base() + `/v1/admin/posts/${id}`,
    adminDelete: (id: string) => base() + `/v1/admin/posts/${id}`
  }
} as const;

