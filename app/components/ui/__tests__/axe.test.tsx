import { Plus } from "lucide-react";
import type { ReactElement } from "react";
import { toast } from "sonner";
import { describe, it, vi } from "vitest";

import { buildDockItems, seedDockJob } from "@hooks/api/subscriptions";
import { resetDockStore } from "@hooks/api/subscriptions/shared/progressDock";
import { expectNoAxeViolations } from "@test/a11y/axe";
import { act, renderWithProviders, screen } from "@test/test-utils";

import { ActivityDivider } from "../ActivityDivider";
import { AlphabetIndex } from "../AlphabetIndex";
import { AppLogo } from "../AppLogo";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";
import { BottomSheet, BottomSheetHeader } from "../BottomSheet";
import { BrandedLoader } from "../BrandedLoader";
import { BulkActionBar } from "../BulkActionBar";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { ConfirmationModal } from "../ConfirmationModal";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../Dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../DropdownMenu";
import { EmptyState } from "../EmptyState";
import { FilterSortDropdown } from "../FilterSortDropdown";
import { IconButton } from "../IconButton";
import { ImageGlow } from "../ImageGlow";
import { ImagePlaceholder } from "../ImagePlaceholder";
import { InfoTooltip } from "../InfoTooltip";
import { InlineError } from "../InlineError";
import { Input } from "../Input";
import { LoadingDots } from "../LoadingDots";
import { LoadingRing } from "../LoadingRing";
import { LockedAction } from "../LockedAction";
import { LogoIcon } from "../LogoIcon";
import { ModalActionBar, ModalChoice } from "../ModalActionBar";
import { NameTip } from "../NameTip";
import { Notice } from "../Notice";
import { NotificationBadge } from "../NotificationBadge";
import { NowPlayingBars } from "../NowPlayingBars";
import { Pagination } from "../Pagination";
import { PasswordField } from "../PasswordField";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover";
import { PreviewButton } from "../PreviewButton";
import { ProgressDock } from "../ProgressDock";
import { ProgressBar } from "../ProgressBar";
import { QueueAddButton } from "../QueueAddButton";
import { RangeSlider } from "../RangeSlider";
import { RoleChip } from "../RoleChip";
import { SearchCombobox } from "../SearchCombobox";
import { SearchSelect } from "../SearchSelect";
import { SectionLoading } from "../SectionLoading";
import { SegmentedControl } from "../SegmentedControl";
import { SegmentTabs } from "../SegmentTabs";
import { SelectMenu } from "../SelectMenu";
import { SocialIcon } from "../SocialIcon";
import { Spinner } from "../Spinner";
import { Switch } from "../Switch";
import { DataTable } from "../Table";
import { TipBadge } from "../TipBadge";
import { Toaster } from "../Toaster";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../Tooltip";

const noop = (): void => undefined;
const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

interface TableRow {
  id: string;
  name: string;
}

const CLOSED: ReadonlyArray<readonly [string, ReactElement]> = [
  ["ActivityDivider", <ActivityDivider key="a" state="in-progress" value={3} max={10} />],
  [
    "AlphabetIndex",
    <AlphabetIndex
      key="a"
      entries={[{ letter: "A", offset: 0 }]}
      letters={["A", "B"]}
      label="Jump to a letter"
      letterLabel={(letter) => `Jump to ${letter}`}
      onSelect={noop}
    />,
  ],
  ["AppLogo", <AppLogo key="a" />],
  ["Avatar", <Avatar key="a" username="ada" />],
  ["Badge", <Badge key="a">New</Badge>],
  ["BottomSheet closed", <BottomSheet key="a" open={false} onOpenChange={noop} />],
  ["BrandedLoader", <BrandedLoader key="a" label="Loading" />],
  [
    "BulkActionBar compact",
    <BulkActionBar
      key="a"
      count={2}
      countLabel="2 selected"
      clearLabel="Clear selection"
      onClear={noop}
      actions={[{ icon: Plus, label: "Add", onClick: noop }]}
    />,
  ],
  [
    "BulkActionBar prominent",
    <BulkActionBar
      key="a"
      appearance="prominent"
      count={2}
      countLabel="2 selected"
      clearLabel="Clear selection"
      onClear={noop}
      actions={[{ icon: Plus, label: "Add", onClick: noop }]}
    />,
  ],
  ["Button", <Button key="a">Save</Button>],
  ["Checkbox", <Checkbox key="a" aria-label="Agree" />],
  [
    "ConfirmationModal closed",
    <ConfirmationModal key="a" isOpen={false} onClose={noop} onConfirm={noop} title="Delete" message="Sure?" />,
  ],
  ["Dialog closed", <Dialog key="a" open={false} onOpenChange={noop} />],
  [
    "DropdownMenu closed",
    <DropdownMenu key="a">
      <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
    </DropdownMenu>,
  ],
  ["EmptyState", <EmptyState key="a" icon={Plus} title="Nothing here" description="Add something." />],
  [
    "FilterSortDropdown closed",
    <FilterSortDropdown
      key="a"
      filter={{ value: "a", onChange: noop, options: [{ value: "a", label: "Alpha" }] }}
      sort={{ value: "a", onChange: noop, options: [{ value: "a", label: "Alpha" }] }}
    />,
  ],
  ["IconButton", <IconButton key="a" icon={Plus} aria-label="Add" />],
  ["ImageGlow", <ImageGlow key="a" />],
  ["ImagePlaceholder", <ImagePlaceholder key="a" />],
  ["InfoTooltip closed", <InfoTooltip key="a" description="What this does" />],
  ["InlineError", <InlineError key="a" error={new Error("It failed")} />],
  ["Input", <Input key="a" aria-label="Name" />],
  ["LoadingDots", <LoadingDots key="a" label="Loading" />],
  ["LoadingRing", <LoadingRing key="a" />],
  [
    "LockedAction",
    <TooltipProvider key="a">
      <LockedAction label="Delete" hint="Ask an admin">
        <Button disabled>Delete</Button>
      </LockedAction>
    </TooltipProvider>,
  ],
  ["LogoIcon", <LogoIcon key="a" />],
  [
    "ModalActionBar",
    <ModalActionBar
      key="a"
      choice={<ModalChoice label="Remember" checked onChange={noop} />}
      cancel={{ label: "Cancel", onClick: noop }}
      save={{ label: "Save", onClick: noop }}
    />,
  ],
  [
    "NameTip",
    <NameTip key="a" label="Add">
      <IconButton icon={Plus} aria-label="Add" />
    </NameTip>,
  ],
  [
    "Notice",
    <Notice key="a" title="Heads up" collapsible>
      Details
    </Notice>,
  ],
  ["NotificationBadge", <NotificationBadge key="a" visible label="3 new" />],
  ["NowPlayingBars", <NowPlayingBars key="a" playing label="Playing" />],
  [
    "Pagination",
    <Pagination
      key="a"
      page={2}
      pageCount={5}
      pageSize={10}
      totalItems={50}
      pageSizeOptions={[10, 25]}
      onPageChange={noop}
      onPageSizeChange={noop}
    />,
  ],
  ["PasswordField", <PasswordField key="a" id="pw" value="" label="Password" onChange={noop} />],
  [
    "Popover closed",
    <Popover key="a">
      <PopoverTrigger>Open</PopoverTrigger>
    </Popover>,
  ],
  ["PreviewButton", <PreviewButton key="a" title="Aerodynamic" status="idle" clock={null} available onToggle={noop} />],
  ["ProgressBar", <ProgressBar key="a" progress={40} label="Importing" />],
  [
    "QueueAddButton",
    <QueueAddButton key="a" title="Aerodynamic" presence="absent" onAdd={async () => true} onRemove={noop} />,
  ],
  [
    "RangeSlider",
    <RangeSlider key="a" min={0} max={10} low={2} high={8} onChange={noop} lowLabel="Lowest" highLabel="Highest" />,
  ],
  ["RoleChip", <RoleChip key="a" tone="admin" label="Admin" />],
  [
    "SearchCombobox closed",
    <SearchCombobox
      key="a"
      label="Artist"
      placeholder="Search"
      options={OPTIONS}
      query=""
      onQueryChange={noop}
      onPick={noop}
    />,
  ],
  [
    "SearchSelect closed",
    <SearchSelect
      key="a"
      value="a"
      options={OPTIONS}
      onChange={noop}
      ariaLabel="Pick one"
      searchPlaceholder="Search"
      emptyText="Nothing"
    />,
  ],
  ["SectionLoading", <SectionLoading key="a" message="Loading" />],
  ["SegmentedControl", <SegmentedControl key="a" value="a" options={OPTIONS} onChange={noop} ariaLabel="View" />],
  [
    "SegmentTabs",
    <SegmentTabs
      key="a"
      items={[
        { value: "a", label: "Alpha", count: 2 },
        { value: "b", label: "Beta" },
      ]}
      value="a"
      onValueChange={noop}
      layoutId="axe-tabs"
      ariaLabel="Sections"
    />,
  ],
  ["SelectMenu closed", <SelectMenu key="a" value="a" options={OPTIONS} onChange={noop} ariaLabel="Pick one" />],
  ["SocialIcon", <SocialIcon key="a" brand="spotify" aria-hidden />],
  ["Spinner", <Spinner key="a" label="Loading" />],
  ["Switch", <Switch key="a" aria-label="Enabled" />],
  [
    "DataTable",
    <DataTable<TableRow>
      key="a"
      data={[{ id: "1", name: "Alpha" }]}
      columns={[{ key: "name", header: "Name", cell: (row) => row.name }]}
      getRowId={(row) => row.id}
    />,
  ],
  [
    "TipBadge closed",
    <TipBadge key="a" tipId="axe-tip" body="A tip." action={{ label: "Learn more", href: "/settings" }} />,
  ],
  ["Toaster idle", <Toaster key="a" />],
  [
    "Tooltip closed",
    <TooltipProvider key="a">
      <Tooltip>
        <TooltipTrigger>Hover</TooltipTrigger>
      </Tooltip>
    </TooltipProvider>,
  ],
];

describe("every primitive of components/ui, closed", () => {
  it.each(CLOSED)("%s has no axe violation", async (_name, element) => {
    renderWithProviders(element);
    await expectNoAxeViolations();
  });
});

describe("the primitives that open, open", () => {
  it("Dialog", async () => {
    renderWithProviders(
      <Dialog open onOpenChange={noop}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
            <DialogDescription>Give it a new name.</DialogDescription>
          </DialogHeader>
          <Input aria-label="Name" />
          <DialogFooter>
            <Button>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    await screen.findByRole("dialog");
    await expectNoAxeViolations();
  });

  it("BottomSheet", async () => {
    renderWithProviders(
      <BottomSheet open onOpenChange={noop}>
        <BottomSheetHeader title="Queue" subtitle="3 tracks" />
        <p>Up next</p>
      </BottomSheet>
    );
    await screen.findByRole("dialog");
    await expectNoAxeViolations();
  });

  it("ConfirmationModal", async () => {
    renderWithProviders(
      <ConfirmationModal isOpen onClose={noop} onConfirm={noop} title="Delete" message="Delete this playlist?" />
    );
    await screen.findByRole("dialog");
    await expectNoAxeViolations();
  });

  it("DropdownMenu", async () => {
    renderWithProviders(
      <DropdownMenu open>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked>Pinned</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="a">
            <DropdownMenuRadioItem value="a">Alpha</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="b">Beta</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await screen.findByRole("menu");
    await expectNoAxeViolations();
  });

  it("Popover", async () => {
    renderWithProviders(
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent aria-label="Panel">
          <p>Panel body</p>
        </PopoverContent>
      </Popover>
    );
    await screen.findByText("Panel body");
    await expectNoAxeViolations();
  });

  it("Tooltip", async () => {
    renderWithProviders(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent>The hint</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    await screen.findAllByText("The hint");
    await expectNoAxeViolations();
  });

  it("InfoTooltip", async () => {
    const { user } = renderWithProviders(<InfoTooltip description="What this does" trigger="click" />);
    await user.click(screen.getByRole("button"));
    await screen.findAllByText("What this does");
    await expectNoAxeViolations();
  });

  it("SelectMenu", async () => {
    const { user } = renderWithProviders(
      <SelectMenu value="a" options={OPTIONS} onChange={vi.fn()} ariaLabel="Pick one" />
    );
    await user.click(screen.getByRole("button", { name: /Pick one/ }));
    await screen.findByRole("menu");
    await expectNoAxeViolations();
  });

  it("SearchSelect", async () => {
    const { user } = renderWithProviders(
      <SearchSelect
        value="a"
        options={OPTIONS}
        onChange={vi.fn()}
        ariaLabel="Pick one"
        searchPlaceholder="Search"
        emptyText="Nothing"
      />
    );
    await user.click(screen.getByRole("button", { name: /Pick one/ }));
    await screen.findByRole("dialog");
    await expectNoAxeViolations();
  });

  it("SearchCombobox", async () => {
    const { user } = renderWithProviders(
      <SearchCombobox
        label="Artist"
        placeholder="Search"
        options={OPTIONS}
        query=""
        onQueryChange={noop}
        onPick={noop}
      />
    );
    await user.click(screen.getByRole("combobox", { name: "Artist" }));
    await screen.findAllByRole("option");
    await expectNoAxeViolations();
  });

  it("FilterSortDropdown", async () => {
    const { user } = renderWithProviders(
      <FilterSortDropdown
        filter={{ value: "a", onChange: noop, options: [{ value: "a", label: "Alpha" }] }}
        sort={{ value: "a", onChange: noop, options: [{ value: "a", label: "Alpha" }] }}
      />
    );
    await user.click(screen.getAllByRole("button")[0]);
    await expectNoAxeViolations();
  });

  it("Toaster", async () => {
    renderWithProviders(<Toaster />);
    toast.success("Saved", { description: "The playlist was renamed." });
    toast.error("Could not save", { action: { label: "Retry", onClick: noop } });
    await screen.findByText("Saved");
    await expectNoAxeViolations();
    toast.dismiss();
  });

  it("ProgressDock", async () => {
    act(() => resetDockStore());
    renderWithProviders(<ProgressDock />);
    act(() =>
      seedDockJob({
        id: "axe-dock",
        kind: "library-import",
        provider: "spotify",
        items: buildDockItems([
          { key: "a", name: "Alpha" },
          { key: "b", name: "Beta" },
        ]),
        status: "running",
      })
    );
    await screen.findAllByText("Importing from Spotify");
    await expectNoAxeViolations();
    resetDockStore();
  });

  it("TipBadge", async () => {
    const { user } = renderWithProviders(
      <TipBadge tipId="axe-open-tip" body="A tip." action={{ label: "Learn more", href: "/settings" }} />
    );
    await user.click(screen.getByRole("button", { name: "Tip" }));
    await screen.findByText("A tip.");
    await expectNoAxeViolations();
  });
});
