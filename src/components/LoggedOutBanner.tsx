import { signIn, useSession } from "next-auth/react";
import { Container } from "./Container";

export function LoggedOutBanner() {
  const { data: session } = useSession();

  if (session) {
    return null;
  }

  return (
    <div className="fixed bottom-0 w-full p-4">
      <Container classNames="flex justify-between align-center">
        <p>Don't miss out</p>
        <div>
          <button onClick={() => signIn()} className="py-2 px-4">
            Log In
          </button>
        </div>
      </Container>
    </div>
  );
}
