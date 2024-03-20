import { User } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type UserListTabletProps = {
  users: User[];
};

export const UserListTable = ({ users }: UserListTabletProps) => {
  if (users.length === 0) return <div>ユーザーが見つかりませんでした</div>;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">表示名</TableHead>
          <TableHead className="w-[400px]">メールアドレス</TableHead>
          <TableHead className="w-[150px]">役割</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <UserListTableRow key={user.id} user={user} />
        ))}
      </TableBody>
    </Table>
  );
};

type UserListTableRowProps = {
  user: User;
};

export const UserListTableRow = ({ user }: UserListTableRowProps) => {
  return (
    <TableRow className="cursor-pointer">
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.role === "admin" ? "管理者" : "メンバー"}</TableCell>
    </TableRow>
  );
};
