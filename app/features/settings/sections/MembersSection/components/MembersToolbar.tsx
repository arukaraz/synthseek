import { Download, UserPlus } from "lucide-react";

import { Button } from "@components/ui/Button";

import { MEMBERS_COPY } from "../constants";
import { toolbarActions } from "../styles";
import type { MembersToolbarProps } from "../types";

export function MembersToolbar({ onCreate, onImport }: MembersToolbarProps) {
  return (
    <div className={toolbarActions()}>
      <Button size="sm" onClick={onCreate}>
        <UserPlus />
        {MEMBERS_COPY.createLocal}
      </Button>
      <Button size="sm" variant="secondary" onClick={onImport}>
        <Download />
        {MEMBERS_COPY.importPlex}
      </Button>
    </div>
  );
}
