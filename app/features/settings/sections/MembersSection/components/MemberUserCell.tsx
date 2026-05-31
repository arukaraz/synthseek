import { User as UserIcon } from "lucide-react";

import { userAvatar, userCell, userEmail, userName } from "../styles";
import type { MemberCellProps } from "../types";

export function MemberUserCell({ member }: MemberCellProps) {
  return (
    <div className={userCell()}>
      <div className={userAvatar()}>
        {member.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.avatar_url} alt={member.username} className="h-full w-full object-cover" />
        ) : (
          <UserIcon className="text-fg/60 h-4 w-4" />
        )}
      </div>
      <div className="min-w-0">
        <p className={userName()}>{member.username}</p>
        <p className={userEmail()}>{member.email}</p>
      </div>
    </div>
  );
}
