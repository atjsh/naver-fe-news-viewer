"use client";

import { useState, useEffect } from "react";

function getTableOfContentByH1Tags(ignoreName: string) {
  const h1Tags = document.querySelectorAll("h2");
  const toc = [];

  for (const h1Tag of h1Tags) {
    if (h1Tag.innerText === ignoreName) {
      continue;
    }
    const id =
      h1Tag.id ||
      `toc-${toc.length + 1}-${h1Tag.innerText
        .replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/g, "")
        .replace(/\s/g, "-")}`;

    h1Tag.id = id;

    toc.push({
      id: h1Tag.id,
      text: h1Tag.innerText
    });
  }
  return toc;
}

// get toc only 1 time by useEffect
export function TOC({ ignoreName }: { ignoreName: string }) {
  const [toc, setToc] = useState<
    {
      id: string;
      text: string;
    }[]
  >([]);
  const [isFolded, setIsFolded] = useState(true);

  useEffect(() => {
    // reads server-rendered <h2>s from the DOM, which only exists after mount
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToc(getTableOfContentByH1Tags(ignoreName));
  }, [ignoreName]);

  const showingToc = isFolded ? toc.slice(0, 7) : toc;

  return (
    <div
      className={`flex justify-start gap-3 p-3 rounded-lg group ${
        isFolded
          ? "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900"
          : ""
      }`}
      onClick={() => (isFolded ? setIsFolded(false) : null)}
    >
      <div className=" text-sm font-bold flex-shrink-0 ">목차</div>
      <div className=" flex gap-1 flex-col">
        <div className=" opacity-0">목차</div>
        <ul className=" flex gap-1 flex-col">
          {showingToc.map((tocItem) =>
            isFolded ? (
              <li key={tocItem.id}>
                <span className="text-sm">{tocItem.text}</span>
              </li>
            ) : (
              <li key={tocItem.id}>
                <a
                  href={`#${tocItem.id}`}
                  className="hover:underline cursor-pointer text-sm"
                >
                  {tocItem.text}
                </a>
              </li>
            )
          )}
        </ul>

        {isFolded && toc.length > 7 && (
          <>
            <div>...</div>
            <div className="  text-md mt-3 group-hover:underline">
              클릭하여 목차 펼치기
            </div>
          </>
        )}
      </div>
    </div>
  );
}
