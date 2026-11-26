import axios from "axios";
export const env = "pro";
import { Capacitor, CapacitorHttp } from '@capacitor/core';
export const isNative = Capacitor.isNativePlatform();
export const APP_VERSION="1.6"
export const FRONTEND_URL = "http://career.tecnicol.co.mz"
export const API_URL = 
 env == "dev" ? isNative ? "http://192.168.18.3:5001/api" : "http://localhost:5006/api" :
  "https://career-tecnicol-api.derflash.com/api";

  //

export const DEFAULT_ANDROID_DOWNLOAD_URL = `${API_URL.replace(/\/api$/, '')}/download/android/app-debug.apk`;
export const APK_DOWNLOAD_URL = DEFAULT_ANDROID_DOWNLOAD_URL;

export const getAndroidDownloadUrl = async () => {
  try {
    const { data } = await client.get('/settings/public');
    return data?.settings?.app?.androidDownloadUrl || DEFAULT_ANDROID_DOWNLOAD_URL;
  } catch {
    return DEFAULT_ANDROID_DOWNLOAD_URL;
  }
};

const client = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

const uploadClient = axios.create({
  baseURL: API_URL,
});

export function getStoredToken() {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    null
  );
}

export function getStoredRefreshToken() {
  return localStorage.getItem("refresh_token") || null;
}

export function setStoredToken(token) {
  if (!token) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    delete client.defaults.headers.common.Authorization;
    return;
  }
  localStorage.setItem("accessToken", token);
  localStorage.setItem("token", token);
  client.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function setStoredRefreshToken(token) {
  if (!token) {
    localStorage.removeItem("refresh_token");
    return;
  }
  localStorage.setItem("refresh_token", token);
}

const bootToken = getStoredToken();
if (bootToken) {
  client.defaults.headers.common.Authorization = `Bearer ${bootToken}`;
}

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

client.interceptors.request.use((config) => {
  const t = getStoredToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

uploadClient.interceptors.request.use((config) => {
  const t = getStoredToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) {
        setStoredToken(null);
        setStoredRefreshToken(null);
        window.dispatchEvent(new Event("auth:unauthorized"));
        return Promise.reject(err);
      }
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }
      isRefreshing = true;
      try {
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        });
        const { accessToken } = response.data;
        setStoredToken(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setStoredToken(null);
        setStoredRefreshToken(null);
        window.dispatchEvent(new Event("auth:unauthorized"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    if (err.response?.status === 401) {
      setStoredToken(null);
      setStoredRefreshToken(null);
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(err);
  }
);

uploadClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      setStoredToken(null);
      setStoredRefreshToken(null);
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(err);
  }
);

async function nativeRequest(method, url, data = null, headers = {}) {
  const response = await CapacitorHttp.request({
    url, method, headers, data,
  });
  return { status: response.status, data: response.data, headers: response.headers };
}

if (isNative) {
  client.request = async function (config) {
    const token = getStoredToken();
    const headers = { ...(config.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    return nativeRequest(config.method.toUpperCase(), API_URL + config.url, config.data, headers);
  };
  uploadClient.request = async function (config) {
    const token = getStoredToken();
    const headers = { ...(config.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    return nativeRequest(config.method.toUpperCase(), API_URL + config.url, config.data, headers);
  };
}

export { uploadClient };
export default client;

// ==================== CAREER CONNECT API ====================

// AUTH
export const ccRegister = (data) => client.post('/auth/register', data);
export const ccLogin = (data) => client.post('/auth/login', data);
export const ccRequestOTP = (data) => client.post('/auth/request-otp', data);
export const ccVerifyOTP = (data) => client.post('/auth/verify-otp', data);
export const ccVerifyEmail = (data) => client.post('/auth/verify-email', data);
export const ccResendEmailOTP = (data) => client.post('/auth/resend-email-otp', data);
export const ccForgotPassword = (data) => client.post('/auth/forgot-password', data);
export const ccResetPassword = (data) => client.post('/auth/reset-password', data);
export const ccRefreshToken = (data) => client.post('/auth/refresh-token', data);
export const ccMe = () => client.get('/auth/me');

// USERS
export const ccGetProfile = () => client.get('/users/profile');
export const ccUpdateProfile = (data) => client.put('/users/profile', data);
export const ccGetAllUsers = () => client.get('/users/');
export const ccUpdateUser = (id, data) => client.put(`/users/${id}`, data);
export const ccSetUserStatus = (id, isActive) => client.put(`/users/${id}/status`, { is_active: isActive });
export const ccDeleteUser = (id) => client.delete(`/users/${id}`);
export const ccGetTestUsers = () => client.get('/auth/test-users');
export const ccGetMenteeDashboard = () => client.get('/users/mentee/dashboard');
export const ccGetMentorDashboard = () => client.get('/users/mentor/dashboard');

// EVENTS
export const ccGetEvent = () => client.get('/events/');
export const ccGetProgram = () => client.get('/events/program');
export const ccConfigureEvent = (data) => client.put('/events/configure', data);
export const ccGetAllEvents = () => client.get('/events/all');
export const ccCreateEvent = (data) => client.post('/events/', data);
export const ccUpdateEvent = (id, data) => client.put(`/events/${id}`, data);
export const ccDeleteEvent = (id) => client.delete(`/events/${id}`);

// REGISTRATIONS
export const ccRegisterForEvent = (data) => client.post('/registrations/', data);
export const ccCheckIn = (data) => client.post('/registrations/checkin', data);
export const ccWalkIn = (data) => client.post('/registrations/walkin', data);
export const ccCancelCheckIn = (data) => client.post('/registrations/cancel-checkin', data);
export const ccGetRegistrations = () => client.get('/registrations/');
export const ccDeleteRegistration = (id) => client.delete(`/registrations/${id}`);
export const ccGetRegistrationByTicket = (ticketCode) => client.get('/registrations/by-ticket', { params: { ticket_code: ticketCode } });

// SESSIONS
export const ccGetSessions = (params) => client.get('/sessions/', { params });
export const ccCreateSession = (data) => client.post('/sessions/', data);
export const ccUpdateSession = (id, data) => client.put(`/sessions/${id}`, data);
export const ccDeleteSession = (id) => client.delete(`/sessions/${id}`);

// ROUNDS
export const ccGetRounds = (params) => client.get('/rounds/', { params });
export const ccAdvanceRound = (data) => client.post('/rounds/advance', data);
export const ccPauseRound = (data) => client.post('/rounds/pause', data);
export const ccResumeRound = (data) => client.post('/rounds/resume', data);
export const ccGetCurrentRound = (params) => client.get('/rounds/current', { params });
export const ccResetRounds = (data) => client.post('/rounds/reset', data);
export const ccCreateRound = (data) => client.post('/rounds/', data);
export const ccUpdateRound = (id, data) => client.put(`/rounds/${id}`, data);
export const ccDeleteRound = (id) => client.delete(`/rounds/${id}`);

// MATCHES
export const ccGetMyMatch = (params) => client.get('/matches/my', { params });
export const ccGetMentorMatch = (params) => client.get('/matches/mentor', { params });
export const ccGetAllMatches = (params) => client.get('/matches/', { params });
export const ccGenerateMatches = () => client.post('/matches/generate');

// MENTORS / WISHES
export const ccGetMentorDirectory = (params) => client.get('/mentors/', { params });
export const ccGetMenteeDirectory = (params) => client.get('/mentors/mentees', { params });
export const ccAddWish = (data) => client.post('/mentors/wish', data);
export const ccRemoveWish = (data) => client.post('/mentors/wish/remove', data);
export const ccGetMyWishes = () => client.get('/mentors/wish/my');
export const ccGetWishCount = (params) => client.get('/mentors/wish/count', { params });
export const ccGetWishesForMentor = () => client.get('/mentors/wish/received');

// FEEDBACK
export const ccSubmitFeedback = (data) => client.post('/feedback/', data);
export const ccGetMyFeedback = () => client.get('/feedback/my');

// CONNECTIONS
export const ccGetConnections = () => client.get('/connections/');

// MENTORSHIP REQUESTS
export const ccCreateMentorshipRequest = (data) => client.post('/mentorship-requests/', data);
export const ccGetMyMentorshipRequests = () => client.get('/mentorship-requests/my');
export const ccGetMentorshipRequestsForMentor = () => client.get('/mentorship-requests/for-mentor');
export const ccRespondMentorshipRequest = (data) => client.post('/mentorship-requests/respond', data);

// MESSAGES
export const ccGetMessages = (params) => client.get('/messages/', { params });
export const ccSendMessage = (data) => client.post('/messages/', data);

// QUESTIONS
export const ccGetQuestions = (params) => client.get('/questions/', { params });
export const ccCreateQuestion = (data) => client.post('/questions/', data);
export const ccVoteQuestion = (data) => client.post('/questions/vote', data);
export const ccModerateQuestion = (data) => client.post('/questions/moderate', data);
export const ccUpdateQuestion = (id, data) => client.put(`/questions/${id}`, data);
export const ccDeleteQuestion = (id) => client.delete(`/questions/${id}`);
export const ccDeleteAllQuestions = () => client.delete('/questions/all');

// POLLS
export const ccGetPolls = (params) => client.get('/polls/', { params });
export const ccCreatePoll = (data) => client.post('/polls/', data);
export const ccVotePoll = (data) => client.post('/polls/vote', data);
export const ccGetPollResults = (params) => client.get('/polls/results', { params });

// ANNOUNCEMENTS
export const ccGetAnnouncements = (params) => client.get('/announcements/', { params });
export const ccCreateAnnouncement = (data) => client.post('/announcements/', data);

// SURVEY
export const ccSubmitSurvey = (data) => client.post('/survey/', data);
export const ccGetSurveyResults = (params) => client.get('/survey/', { params });
export const ccDeleteSurveyResponse = (id) => client.delete(`/survey/${id}`);
export const ccGetQuestionnaire = (params) => client.get('/survey/questionnaire', { params });
export const ccUpdateQuestionnaire = (data) => client.put('/survey/questionnaire', data);
export const ccGetSurveyStatus = (params) => client.get('/survey/status', { params });
export const ccNotifySurvey = (data) => client.post('/survey/notify', data);

// REGISTRATION CONFIG (editable form options)
export const ccGetRegistrationConfig = (params) => client.get('/registration-config', { params });
export const ccUpdateRegistrationConfig = (data) => client.put('/registration-config', data);

// LANDING PAGE CONFIG
export const ccGetLanding = (params) => client.get('/landing', { params });
export const ccUpdateLanding = (data) => client.put('/landing', data);

// NEXT STEPS
export const ccCreateNextStep = (data) => client.post('/next-steps/', data);
export const ccGetMyNextStep = () => client.get('/next-steps/my');

// BOOKINGS
export const ccBookSession = (data) => client.post('/bookings/', data);
export const ccGetMyBookings = () => client.get('/bookings/my');

// BADGES
export const ccGetBadges = (params) => client.get('/badges/', { params });
export const ccAwardBadge = (data) => client.post('/badges/', data);

// ORGANIZER
export const ccGetOrganizerDashboard = () => client.get('/organizer/dashboard');
export const ccGetOrganizerRegistrations = (params) => client.get('/organizer/registrations', { params });
export const ccApproveMentor = (data) => client.post('/organizer/approve-mentor', data);
export const ccGetOrganizerRounds = () => client.get('/organizer/rounds');
export const ccGetOrganizerReports = () => client.get('/organizer/reports');

// TV
export const ccGetTVData = (params) => client.get('/tv/', { params });

// WHATSAPP BOT (external microservice)
export const WHATSAPP_BOT_API = 'https://meucasamento-whatsapp-bot-api.derflash.com' //env == "dev" ? "http://localhost:3001" : "https://career-tecnicol-whatsapp.derflash.com";

const whatsappClient = axios.create({
  baseURL: WHATSAPP_BOT_API,
  headers: { "Content-Type": "application/json" },
});

export const getWhatsAppQr = () => whatsappClient.get('/qr');
export const getWhatsAppStatus = () => whatsappClient.get('/status');
export const sendWhatsAppTest = (chatId, message) => whatsappClient.post('/send', { chatId, message });
export const logoutWhatsApp = () => whatsappClient.post('/logout');
