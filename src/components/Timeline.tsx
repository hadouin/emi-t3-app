import Image from "next/image";
import { api, RouterOutputs } from "../utils/api";
import { CreateTweet } from "./CreateTweet";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "1m",
    m: "1m",
    mm: "%dm",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1M",
    MM: "%dM",
    y: "1y",
    yy: "%dy",
  },
});

function Tweet({
  tweet,
}: {
  tweet: RouterOutputs["tweet"]["timeline"]["tweets"][number];
}) {
  return (
    <div className="mb-7 flex">
      <div>
        {tweet.author.image && (
          <Image
            src={tweet.author.image}
            alt={`${tweet.author.name} profile pic`}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
      </div>
      <div className="ml-2 flex flex-col">
        <div className="flex flex-row items-center">
          <p className="font-bold">{tweet.author.name}</p>
          <p className="pl-1 text-xs text-gray-500">
            {dayjs(tweet.createdAt).fromNow()}
          </p>
        </div>
        <p>{tweet.text}</p>
      </div>
    </div>
  );
}

export function Timeline() {
  const { data, hasNextPage, fetchNextPage, isFetching } =
    api.tweet.timeline.useInfiniteQuery(
      {
        limit: 50,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  console.log(data);

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  return (
    <div>
      <CreateTweet />
      {tweets.map((tweet) => {
        return <Tweet key={tweet.id} tweet={tweet} />;
      })}
      <button
        onClick={() => {
          fetchNextPage();
        }}
        disabled={!hasNextPage || isFetching}
      >
        Next Page
      </button>
    </div>
  );
}
