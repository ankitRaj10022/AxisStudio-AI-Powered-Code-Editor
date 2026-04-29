import SignInExperience from "@/features/auth/components/sign-in-experience";
import SignInFormClient from "@/features/auth/components/sign-in-form-client";

const SignInPage = () => {
  const authOrigin = process.env.NEXTAUTH_URL ?? null;

  return (
    <SignInExperience>
      <SignInFormClient authOrigin={authOrigin} />
    </SignInExperience>
  );
};

export default SignInPage
