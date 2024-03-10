import { User } from "@prisma/client";

type UserListTabletProps = {
  users: User[];
};

export const UserListTable = ({ users }: UserListTabletProps) => {
  if (users.length === 0) return <div>ユーザーが見つかりませんでした</div>;
  return (
    <table>
      <thead>
        <tr>
          <th>表示名</th>
          <th>メールアドレス</th>
          <th>役割</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <UserListTableRow key={user.id} user={user} />
        ))}
      </tbody>
    </table>
  );
};

type UserListTableRowProps = {
  user: User;
};

export const UserListTableRow = ({ user }: UserListTableRowProps) => {
  return (
    <tr>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>{user.role}</td>
    </tr>
  );
};
