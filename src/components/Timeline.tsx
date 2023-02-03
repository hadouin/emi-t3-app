import Image from "next/image";
import { api, RouterOutputs } from "../utils/api";
import { CreateTweet } from "./CreateTweet";

function Tweet({
  tweet,
}: {
  tweet: RouterOutputs["tweet"]["timeline"]["tweets"][number];
}) {
  return (
    <div className="mb-4 flex">
      {tweet.author.image && (
        <Image
          src={tweet.author.image}
          alt={`${tweet.author.name} profile pic`}
          width={48}
          height={48}
          className="rounded-full"
        />
      )}
      <div>
        <p>
          {tweet.author.name} - {new Date(tweet.createdAt).toISOString()}
        </p>
        <p>{tweet.text}</p>
      </div>
    </div>
  );
}

export function Timeline() {
  const { data } = api.tweet.timeline.useQuery({});

  return (
    <div>
      <CreateTweet />

      {JSON.stringify(data)}

      {data?.tweets.map((tweet) => {
        return <Tweet key={tweet.id} tweet={tweet} />;
      })}
    </div>
  );
}
