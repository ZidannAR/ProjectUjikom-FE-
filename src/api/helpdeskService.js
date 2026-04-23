import api from './axios';

/**
 * GET /api/helpdesk/tickets?page={page}&status={status}
 * Daftar tiket milik karyawan (paginated).
 */
export const getMyTickets = (page = 1, status = '') =>
  api.get('/helpdesk/tickets', { params: { page, status: status || undefined } });

/**
 * GET /api/helpdesk/tickets/{ticketId}
 * Detail tiket beserta responses.
 */
export const getTicketDetail = (ticketId) =>
  api.get(`/helpdesk/tickets/${ticketId}`);

/**
 * POST /api/helpdesk/tickets
 * Buat tiket baru.
 */
export const createTicket = (data) =>
  api.post('/helpdesk/tickets', data);

/**
 * GET /api/helpdesk/check-duplicate?subject={subject}&description={description}
 * Cek apakah ada tiket serupa.
 */
export const checkDuplicate = (subject, description) =>
  api.get('/helpdesk/check-duplicate', { params: { subject, description } });

/**
 * POST /api/helpdesk/tickets/{ticketId}/reply
 * Balas tiket.
 */
export const replyTicket = (ticketId, message) =>
  api.post(`/helpdesk/tickets/${ticketId}/reply`, { message });

/**
 * POST /api/helpdesk/tickets/{ticketId}/rate
 * Beri rating tiket yang sudah closed.
 */
export const rateTicket = (ticketId, score, feedback = '') =>
  api.post(`/helpdesk/tickets/${ticketId}/rate`, { score, feedback });
