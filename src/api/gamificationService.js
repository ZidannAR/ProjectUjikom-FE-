import api from './axios';

/**
 * GET /api/gamification/summary
 * Ringkasan poin integritas, level, rank employee.
 */
export const getGamificationSummary = () => api.get('/gamification/summary');

/**
 * GET /api/gamification/ledger?page={page}
 * Riwayat mutasi poin (paginated).
 */
export const getLedgerHistory = (page = 1) =>
  api.get('/gamification/ledger', { params: { page } });

/**
 * GET /api/gamification/marketplace
 * Daftar item yang bisa dibeli.
 */
export const getMarketplaceItems = () => api.get('/gamification/marketplace');

/**
 * POST /api/gamification/marketplace/{itemId}/purchase
 * Beli item dari marketplace.
 */
export const purchaseItem = (itemId) =>
  api.post(`/gamification/marketplace/${itemId}/purchase`);

/**
 * GET /api/gamification/tokens
 * Daftar token AVAILABLE milik employee.
 */
export const getMyTokens = () => api.get('/gamification/tokens');
