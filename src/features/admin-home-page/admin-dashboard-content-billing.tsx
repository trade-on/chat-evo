import { ChatMessage, User } from "@prisma/client";
import { AdminDashboardRequestChart } from "./admin-dashboard-request-chart";
import { prisma } from "../common/services/sql";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const MAX_COUNT = {
  GPT35: 100,
  GPT4: 40000,
} as const;
const UNIT_PRICE = {
  GPT35: 1 / 1000,
  GPT4: 7 / 1000,
} as const;

type AdminDashboardContentBillingProps = {
  chatMessagesWithUser: (Pick<ChatMessage, "id" | "createdAt"> & {
    user: User | null;
  })[];
  threadNumber: number;
  userNumber: number;
  tenantId: string;
  userId: string;
};

export const AdminDashboardContentBilling = async ({
  chatMessagesWithUser,
  threadNumber,
  userNumber,
  tenantId,
  userId,
}: AdminDashboardContentBillingProps) => {
  const tokensByTenant = await prisma.token.findMany({
    where: {
      tenantId,
    },
  });
  const usersWithToken = await prisma.user.findMany({
    select: {
      email: true,
      Tokens: true,
    },
    where: {
      tenantId,
    },
  });
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

  const tokenEachDay = days.map((day) => {
    const month = day.getMonth() + 1;
    const date = day.getDate();
    const requests = tokensByTenant
      .filter((token) => token.createdAt.getDate() === date)
      .reduce(
        (prev, curr) => {
          if (prev.flatAmount[curr.model] <= MAX_COUNT[curr.model]) {
            const diff =
              prev.flatAmount[curr.model] + curr.count - MAX_COUNT[curr.model];
            if (diff <= 0) {
              prev.flatAmount[curr.model] += curr.count;
            } else {
              prev.flatAmount[curr.model] += curr.count - diff;
              prev.billingAmount[curr.model] += diff;
            }
          } else {
            prev.billingAmount[curr.model] += curr.count;
          }
          return prev;
        },
        {
          flatAmount: {
            GPT35: 0,
            GPT4: 0,
          },
          billingAmount: {
            GPT35: 0,
            GPT4: 0,
          },
        }
      );
    return { date: `${month}/${date}`, requests };
  });

  console.log(
    "tokenEachDay",
    tokenEachDay.find((token) => token.date === "3/19")?.requests.flatAmount
  );

  const billingEachDay = tokenEachDay.map(({ date, requests }) => ({
    date,
    requests:
      requests.billingAmount.GPT35 * UNIT_PRICE.GPT35 +
      requests.billingAmount.GPT4 * UNIT_PRICE.GPT4,
  }));

  const tokenCountByUser = usersWithToken.map((user) => {
    const totalGPT35Tokens = user.Tokens.reduce(
      (prev, curr) => (curr.model === "GPT35" ? prev + curr.count : prev),
      0
    );
    const totalGPT4Tokens = user.Tokens.reduce(
      (prev, curr) => (curr.model === "GPT4" ? prev + curr.count : prev),
      0
    );
    const billingPercentageGPT35 = (totalGPT35Tokens / MAX_COUNT.GPT35) * 100;
    const billingPercentageGPT4 = (totalGPT4Tokens / MAX_COUNT.GPT4) * 100;
    return {
      email: user.email,
      totalGPT35Tokens,
      totalGPT4Tokens,
      billingPercentageGPT35,
      billingPercentageGPT4,
    };
  });
  const tokenCountFlat = tokenCountByUser.reduce(
    (prev, curr) => {
      return {
        GPT35:
          prev.GPT35 +
          (MAX_COUNT.GPT35 < curr.totalGPT35Tokens
            ? MAX_COUNT.GPT35
            : curr.totalGPT35Tokens),
        GPT4:
          prev.GPT4 +
          (MAX_COUNT.GPT4 < curr.totalGPT4Tokens
            ? MAX_COUNT.GPT4
            : curr.totalGPT4Tokens),
      };
    },
    { GPT35: 0, GPT4: 0 }
  );
  const tokenCountBilling = tokenCountByUser.reduce(
    (prev, curr) => {
      return {
        GPT35:
          prev.GPT35 +
          (MAX_COUNT.GPT35 < curr.totalGPT35Tokens
            ? curr.totalGPT35Tokens - MAX_COUNT.GPT35
            : 0),
        GPT4:
          prev.GPT4 +
          (MAX_COUNT.GPT4 < curr.totalGPT4Tokens
            ? curr.totalGPT4Tokens - MAX_COUNT.GPT4
            : 0),
      };
    },
    { GPT35: 0, GPT4: 0 }
  );

  return (
    <div className="p-2">
      <section className="py-6 bg-secondary">
        <h2 className="pl-6 pb-3 text-lg font-bold">
          従量課金分の利用料（円）
        </h2>
        <AdminDashboardRequestChart data={billingEachDay} />
      </section>
      <dl className="flex gap-6 my-6">
        <div className="flex flex-col gap-2 bg-secondary flex-1 p-8">
          <dt className="text-base">定額枠内の利用</dt>
          <dd className="flex gap-1 items-baseline text-3xl font-bold">
            {tokenCountFlat.GPT35 + tokenCountFlat.GPT4}
            <span className="text-sm font-normal">トークン</span>
          </dd>
        </div>
        <div className="flex flex-col gap-2 bg-secondary flex-1 p-8">
          <dt className="text-base">従量課金枠の利用</dt>
          <dd className="flex gap-1 items-baseline text-3xl font-bold">
            {tokenCountBilling.GPT35 + tokenCountBilling.GPT4}
            <span className="text-sm font-normal">トークン</span>
          </dd>
        </div>
        <div className="flex flex-col gap-2 bg-secondary flex-1 p-8">
          <dt className="text-base">平均トークン利用料</dt>
          <dd className="flex gap-1 items-baseline text-3xl font-bold">
            {(tokenCountBilling.GPT35 * UNIT_PRICE.GPT35 +
              tokenCountBilling.GPT4 * UNIT_PRICE.GPT4) /
              usersWithToken.length}
            <span className="text-sm font-normal">円</span>
          </dd>
        </div>
      </dl>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>メールアドレス</TableHead>
            <TableHead>GPT3.5定額分使用率</TableHead>
            <TableHead>GPT3.5利用量</TableHead>
            <TableHead>GPT4定額分使用率</TableHead>
            <TableHead>GPT4利用量</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokenCountByUser.map((user) => (
            <UserListTableRow key={user.email} user={user} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

type UserListTableRowProps = {
  user: {
    email: string;
    totalGPT35Tokens: number;
    totalGPT4Tokens: number;
    billingPercentageGPT35: number;
    billingPercentageGPT4: number;
  };
};

export const UserListTableRow = ({ user }: UserListTableRowProps) => {
  return (
    <TableRow className="cursor-pointer">
      <TableCell className="font-medium">{user.email}</TableCell>
      <TableCell>{user.billingPercentageGPT35} %</TableCell>
      <TableCell>{user.totalGPT35Tokens} トークン</TableCell>
      <TableCell>{user.billingPercentageGPT4} %</TableCell>
      <TableCell>{user.totalGPT4Tokens} トークン</TableCell>
    </TableRow>
  );
};
