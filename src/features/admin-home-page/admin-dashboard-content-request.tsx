import { ChatMessage, User } from "@prisma/client";
import { AdminDashboardRequestChart } from "./admin-dashboard-request-chart";
import dynamic from "next/dynamic";

type AdminDashboardContentRequestProps = {
  chatMessagesWithUser: (Pick<ChatMessage, "id" | "createdAt"> & {
    user: User | null;
  })[];
  threadNumber: number;
  userNumber: number;
};

export const AdminDashboardContentRequest = ({
  chatMessagesWithUser,
  threadNumber,
  userNumber,
}: AdminDashboardContentRequestProps) => {
  const days = (() => {
    const today = new Date();
    const thisYear = today.getFullYear();
    const thisMonth = today.getMonth();
    // 最初の日付
    const date = new Date(thisYear, thisMonth, 1);

    const dates = [];

    // 次月になるまでループさせる
    while (date.getMonth() === thisMonth) {
      // 配列に追加していく
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    return dates;
  })();

  const reqEachDay = days.map((day) => {
    const month = day.getMonth() + 1;
    const date = day.getDate();
    const requests = chatMessagesWithUser.filter(
      (message) => message.createdAt.getDate() === date
    ).length;
    return { date: `${month}/${date}`, requests };
  });
  // const requestNumberEachDay = chatMessagesWithUser.reduce((prev, curr) => {
  //   console.log("prev", prev, "curr", curr.createdAt.getDate());
  //   const currDate = curr.createdAt.getDate();
  //   if (prev?.[currDate]) {
  //     return { ...prev, [currDate]: prev[currDate] + 1 };
  //   } else {
  //     return { ...prev, currDate: 1 };
  //   }
  // }, {} as Record<number, number>);
  // const data = Object.entries(requestNumberEachDay).reduce(
  //   (prev, [date, requests]) => {
  //     return [...prev, { date, requests }];
  //   },
  //   [] as RequestNumberEachDay
  // );
  // console.log("data", reqEachDay);

  return (
    <div>
      <dl>
        <div>
          <dt>リクエスト数(回)</dt>
          <dd>{chatMessagesWithUser.length}</dd>
        </div>
        <div>
          <dt>スレッド数(個)</dt>
          <dd>{threadNumber}</dd>
        </div>
        <div>
          <dt>ユーザー数(人)</dt>
          <dd>{userNumber}</dd>
        </div>
      </dl>
      <section>
        <h2>今月の日別リクエスト数</h2>
        <AdminDashboardRequestChart data={reqEachDay} />
      </section>
    </div>
  );
};
