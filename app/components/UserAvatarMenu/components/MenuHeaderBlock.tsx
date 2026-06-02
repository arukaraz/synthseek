import { Avatar } from "@components/ui/Avatar";
import { RoleChip } from "@components/ui/RoleChip";

import { headerBlock, headerEmail, headerIdentity, headerNameRow, headerUsername } from "../styles";
import type { MenuHeaderBlockProps } from "../types";

export function MenuHeaderBlock({ username, email, avatarUrl, roleTone, roleLabel }: MenuHeaderBlockProps) {
  return (
    <div className={headerBlock()}>
      <Avatar size="lg" imageUrl={avatarUrl} username={username} className="shrink-0" />

      <div className={headerIdentity()}>
        <div className={headerNameRow()}>
          <span className={headerUsername()}>{username}</span>
          <RoleChip tone={roleTone} label={roleLabel} />
        </div>
        <span className={headerEmail()}>{email}</span>
      </div>
    </div>
  );
}
