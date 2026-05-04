export function markQuestionnaireComplete(userId: string) {
  localStorage.setItem(`questionnaire_completed_${userId}`, "true");
}

export function isQuestionnaireComplete(userId: string) {
  return localStorage.getItem(`questionnaire_completed_${userId}`) === "true";
}