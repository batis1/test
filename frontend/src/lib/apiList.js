export const server = "https://web-production-345a.up.railway.app";

const apiList = {
  signup: `${server}/user/signup`,
  login: `${server}/user/login`,
  user: `${server}/user`,
  score: `${server}/score`,
  questions: `${server}/questions`,
  words: `${server}/words`,
  lessons: `${server}/lessons`,
  // upload: `${server}/upload`,
  upload: `${server}/user/uploadProfileImage`,
  tutor: `${server}/tutors`,
};

export default apiList;
