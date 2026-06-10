export const authTranslations = {
  en: {
    loginTitle: "Staff Authorization",
    loginSubtitle: "Sign in to access kitchen queue & menu editor.",
    emailLabel: "Email",
    passwordLabel: "Password",
    loginBtn: "Sign In",
    loginError: "Invalid email or password.",
    logoutBtn: "Sign Out",
    welcomeStaff: "Welcome back, Admin",
  },
  am: {
    loginTitle: "የሰራተኞች መግቢያ",
    loginSubtitle: "ትዕዛዞችን ለመከታተልና ማውጫውን ለማስተካከል እባክዎ ይግቡ።",
    emailLabel: "ኢሜይል",
    passwordLabel: "የይለፍ ቃል",
    loginBtn: "ግባ",
    loginError: "ኢሜይል ወይም የይለፍ ቃል ትክክል አይደለም።",
    logoutBtn: "ውጣ",
    welcomeStaff: "እንኳን ደህና መጡ ፣ አስተዳዳሪ",
  },
} as const;

export type AuthCopy = {
  loginTitle: string;
  loginSubtitle: string;
  emailLabel: string;
  passwordLabel: string;
  loginBtn: string;
  loginError: string;
  logoutBtn: string;
  welcomeStaff: string;
};
