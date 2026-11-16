/**
 * ENGLISH O-NET ADVENTURE — PUBLIC DEMO CONFIGURATION
 * 
 * Strict configuration boundaries for the publicly accessible Guest Demo Mode.
 * Ensures zero leakage of private student/school records and strict isolation.
 */

export const DEMO_CONFIG = Object.freeze({
  enabled: true,
  publicRoute: '/demo',
  routeParam: 'demo',
  questMissionLimit: 3,
  vocabularyLimit: 30,
  examQuestionLimit: 10,
  starterChapterId: 'ch1',
  starterQuestId: 'about_myself',
  allowedMissionIds: Object.freeze([
    'about_profile_flip',
    'about_intro_fill',
    'about_sentence_builder'
  ]),
  allowedExamId: 'mini_mock_arena',

  // Security and Isolation boundaries
  persistentStudentProgress: false,
  teacherHubAccess: false,
  student360Access: false,
  schoolDataAccess: false,
  leaderboardAccess: false,
  paidAIEnabled: false,
  requireSchoolAuth: false,
  requireStudentPin: false
});

/**
 * Checks whether a given location or search param indicates a Demo route
 * @param {string} pathname
 * @param {string} search
 * @returns {boolean}
 */
export function isDemoPath(pathname = '', search = '') {
  if (pathname === '/demo' || pathname === '/demo/') return true;
  try {
    const params = new URLSearchParams(search);
    const route = params.get('route');
    const demo = params.get('demo');
    return route === 'demo' || demo === '1' || demo === 'true';
  } catch {
    return false;
  }
}

/**
 * Validates if a mission ID is within the allowed 3 playable demo missions
 * @param {string} missionId
 * @returns {boolean}
 */
export function isAllowedDemoMission(missionId) {
  return DEMO_CONFIG.allowedMissionIds.includes(missionId);
}

/**
 * Security guard checking whether a feature is permitted in demo mode
 * @param {string} feature
 * @returns {boolean}
 */
export function assertDemoPermission(feature) {
  switch (feature) {
    case 'teacher_hub':
    case 'teacher':
    case 'teacher_login':
      return DEMO_CONFIG.teacherHubAccess;
    case 'student_360':
      return DEMO_CONFIG.student360Access;
    case 'school_data':
    case 'school_admin':
      return DEMO_CONFIG.schoolDataAccess;
    case 'leaderboard':
    case 'ranking_sync':
      return DEMO_CONFIG.leaderboardAccess;
    case 'paid_ai':
      return DEMO_CONFIG.paidAIEnabled;
    case 'persistent_progress':
      return DEMO_CONFIG.persistentStudentProgress;
    default:
      return false;
  }
}
