import { ChatMessage, User } from "@prisma/client";
import { AdminDashboardRequestChart } from "./admin-dashboard-request-chart";

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
      <dl className="flex gap-6 my-6">
        <div className="flex flex-col gap-2 bg-secondary flex-1 p-8">
          <dt className="text-base">リクエスト数</dt>
          <dd className="flex gap-1 items-baseline text-3xl font-bold">
            {chatMessagesWithUser.length}
            <span className="text-sm font-normal">回</span>
          </dd>
        </div>
        <div className="flex flex-col gap-2 bg-secondary flex-1 p-8">
          <dt className="text-base">スレッド数</dt>
          <dd className="flex gap-1 items-baseline text-3xl font-bold">
            {threadNumber}
            <span className="text-sm font-normal">個</span>
          </dd>
        </div>
        <div className="flex flex-col gap-2 bg-secondary flex-1 p-8">
          <dt className="text-base">ユーザー数</dt>
          <dd className="flex gap-1 items-baseline text-3xl font-bold">
            {userNumber}
            <span className="text-sm font-normal">人</span>
          </dd>
        </div>
      </dl>
      <section className="py-6 bg-secondary">
        <h2 className="pl-6 pb-3 text-lg font-bold">今月のリクエスト数</h2>
        <AdminDashboardRequestChart data={reqEachDay} />
      </section>
    </div>
  );
};
