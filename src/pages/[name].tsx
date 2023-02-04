import { useRouter } from "next/router";
import { Timeline } from "../components/Timeline";

export default function UserPage() {
  const router = useRouter();

  const name = router.query.name as string;

  return (
    <>
      <Timeline
        where={{
          author: { name: name },
        }}
      />
    </>
  );
}
