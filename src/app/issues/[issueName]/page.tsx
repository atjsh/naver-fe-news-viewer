import { Metadata } from "next";
import Link from "next/link";
import { FC } from "react";
import { getIssueByIssueName, getIssues } from "../api";
import { TOC } from "./toc";

const IssuePage: FC<{
  params: Promise<{
    issueName: string;
  }>;
}> = async ({ params }) => {
  const { issueName } = await params;
  return (
    <main>
      <div className=" mb-3">
        <div className=" text-5xl">
          <Link href="/issues">📰</Link>
        </div>
        <Link
          href="/issues"
          className="text-lg hover:underline underline md:no-underline"
        >
          <span>← 뉴스레터 목록</span>
        </Link>
      </div>
      <div className="my-4">
        <b>naver/fe-news 뉴스레터 뷰어 (비공식)</b>
        <br />
        <div className=" flex align-middle justify-between">
          <div className=" align-middle italic">{issueName}</div>
          <a
            href={`https://github.com/naver/fe-news/blob/master/issues/${issueName}.md`}
            target="_blank"
            className="w-fit hover:underline"
          >
            출처{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className=" w-7 h-7 inline-block align-middle dark:hidden"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className=" w-7 h-7 align-middle hidden dark:inline-block"
            >
              <path
                fill="white"
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
          </a>
        </div>
      </div>
      <hr className="my-4" />
      <TOC ignoreName={issueName} />
      <hr className="my-4" />
      <div
        className="prose dark:prose-invert prose-headings:font-black prose-a:text-blue-600 dark:prose-pre:bg-zinc-800"
        dangerouslySetInnerHTML={{
          __html: await getIssueByIssueName(issueName)
        }}
      />
      <div className="mt-10">
        <Link
          href="/issues"
          className="text-lg hover:underline underline md:no-underline"
        >
          <span>← 뉴스레터 목록으로 돌아가기</span>
        </Link>
      </div>
    </main>
  );
};

export default IssuePage;

export async function generateStaticParams() {
  const issues = await getIssues();
  return issues.map((issue) => ({
    issueName: issue
  }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{
    issueName: string;
  }>;
}): Promise<Metadata> {
  const { issueName } = await params;
  return {
    title: `${issueName} | fe-news`
  };
}
