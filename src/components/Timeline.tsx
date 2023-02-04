import Image from "next/image";
import { api, RouterInputs, RouterOutputs } from "../utils/api";
import { CreateTweet } from "./CreateTweet";
import { FiHeart } from "react-icons/fi";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import {
  InfiniteData,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query";
import Link from "next/link";
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

const LIMIT = 5;

function updateCache({
  client,
  input,
  variables,
  data,
  action,
}: {
  client: QueryClient;
  input: RouterInputs["tweet"]["timeline"];
  variables: {
    tweetId: string;
  };
  data: {
    userId: string;
  };
  action: "like" | "unlike";
}) {
  client.setQueryData(
    [
      ["tweet", "timeline"],
      {
        input,
        type: "infinite",
      },
    ],
    (oldData) => {
      console.log(oldData);

      const newData = oldData as InfiniteData<
        RouterOutputs["tweet"]["timeline"]
      >;

      const value = action === "like" ? +1 : -1;

      const newTweets = newData.pages.map((page) => {
        return {
          tweets: page.tweets.map((tweet) => {
            if (tweet.id === variables.tweetId) {
              return {
                ...tweet,
                likes: action === "like" ? [data.userId] : [],
                _count: {
                  likes: tweet._count.likes + value,
                },
              };
            }
            return tweet;
          }),
        };
      });

      return {
        ...newData,
        pages: newTweets,
      };
    }
  );
}

function Tweet({
  tweet,
  client,
  input,
}: {
  tweet: RouterOutputs["tweet"]["timeline"]["tweets"][number];
  client: QueryClient;
  input: RouterInputs["tweet"]["timeline"];
}) {
  const likeMutation = api.tweet.like.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ client, data, variables, action: "like", input });
    },
  }).mutateAsync;
  const unLikeMuation = api.tweet.unlike.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ client, data, variables, action: "unlike", input });
    },
  }).mutateAsync;

  const hasLiked = tweet.likes.length > 0;

  return (
    <div className="mb-7 flex flex-col">
      <div className="flex">
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
            <p className="font-bold">
              <Link href={`/${tweet.author.name}`}>{tweet.author.name}</Link>
            </p>
            <p className="pl-1 text-xs text-gray-500">
              {dayjs(tweet.createdAt).fromNow()}
            </p>
          </div>
          <p>{tweet.text}</p>
          <a
            className="mt-2 flex items-center"
            onClick={() => {
              if (hasLiked) {
                unLikeMuation({
                  tweetId: tweet.id,
                });
                return;
              }

              likeMutation({
                tweetId: tweet.id,
              });
            }}
          >
            <FiHeart
              fill={hasLiked ? "red" : "none"}
              color={hasLiked ? "red" : "gray"}
            />
            <small className="ml-1">{tweet._count.likes}</small>
          </a>
        </div>
      </div>
    </div>
  );
}

export function Timeline({
  where = {},
}: {
  where: RouterInputs["tweet"]["timeline"]["where"];
}) {
  const { data, hasNextPage, fetchNextPage, isFetching } =
    api.tweet.timeline.useInfiniteQuery(
      {
        limit: LIMIT,
        where,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const client = useQueryClient();

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? [];

  return (
    <div>
      <CreateTweet />
      {tweets.map((tweet) => {
        return (
          <Tweet
            key={tweet.id}
            tweet={tweet}
            client={client}
            input={{ where, limit: LIMIT }}
          />
        );
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
