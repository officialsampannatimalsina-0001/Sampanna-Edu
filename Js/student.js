const PROFILE_KEY = "sampanna_edu_student";
const ATTEMPTS_KEY = "sampanna_edu_attempts";

export function getStudentProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStudentProfile(name, studentClass) {
  const profile = {
    name: name.trim(),
    className: studentClass,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function clearStudentProfile() {
  localStorage.removeItem(PROFILE_KEY);
}

export function getAttempts() {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAttempt(attempt) {
  const attempts = getAttempts();
  attempts.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: new Date().toISOString(),
    ...attempt
  });
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts.slice(0, 100)));
}

export function clearAttempts() {
  localStorage.removeItem(ATTEMPTS_KEY);
}
