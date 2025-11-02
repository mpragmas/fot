import React from "react";

const SideNews = () => {
  return (
    <div className="bg-whitish dark:bg-dark-1 dark:text-whitish w-[23%] space-y-3 rounded-2xl p-5">
      <div className="dark:border-dark-0 border-light-2 space-y-6 border-b-1 pb-5">
        <h1 className="dark:text-whitish">News</h1>

        <div className="space-y-2">
          <p className="dark:bg-dark-3 h-[150px] w-[100%] rounded-2xl"></p>
          <div className="space-y-1">
            <p className="line-clamp-2">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore
              nulla quae excepturi soluta error sit vero, illo veniam at
              accusamus repudiandae necessitatibus voluptates provident eligendi
              maxime rem aspernatur illum id.
            </p>
            <p className="text-dark-3 dark:text-dark-4 text-xs">
              Sports · 2h ago
            </p>
          </div>
        </div>
      </div>
      <div>
        <div className="dark:border-dark-0 flex gap-2 border-b-1 py-3">
          <p className="dark:bg-dark-3 h-[80px] w-[30%] rounded-2xl"></p>
          <div className="w-[70%] space-y-1">
            <h2 className="line-clamp-3 text-sm">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
              Assumenda repudiandae minus, fuga corrupti eum reprehenderit
              ducimus dolorum impedit, aspernatur, nobis neque dolores. Harum
              eligendi molestias perspiciatis corporis labore reiciendis unde.
            </h2>
            <p className="text-dark-3 dark:text-dark-4 text-xs">
              Sports · 2h ago
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideNews;
