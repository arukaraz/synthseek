import { cn } from "@utils/cn";

type TableProps = React.ComponentProps<"table">;

function Table({ className, ref, ...props }: TableProps) {
  return (
    <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

type TableHeaderProps = React.ComponentProps<"thead">;

function TableHeader({ className, ref, ...props }: TableHeaderProps) {
  return <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />;
}

type TableBodyProps = React.ComponentProps<"tbody">;

function TableBody({ className, ref, ...props }: TableBodyProps) {
  return <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

type TableFooterProps = React.ComponentProps<"tfoot">;

function TableFooter({ className, ref, ...props }: TableFooterProps) {
  return (
    <tfoot ref={ref} className={cn("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className)} {...props} />
  );
}

type TableRowProps = React.ComponentProps<"tr">;

function TableRow({ className, ref, ...props }: TableRowProps) {
  return (
    <tr
      ref={ref}
      className={cn("hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors", className)}
      {...props}
    />
  );
}

type TableHeadProps = React.ComponentProps<"th">;

function TableHead({ className, ref, ...props }: TableHeadProps) {
  return (
    <th
      ref={ref}
      className={cn(
        "text-muted-foreground h-10 px-2 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

type TableCellProps = React.ComponentProps<"td">;

function TableCell({ className, ref, ...props }: TableCellProps) {
  return (
    <td
      ref={ref}
      className={cn("p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className)}
      {...props}
    />
  );
}

type TableCaptionProps = React.ComponentProps<"caption">;

function TableCaption({ className, ref, ...props }: TableCaptionProps) {
  return <caption ref={ref} className={cn("text-muted-foreground mt-4 text-sm", className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };

export type {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableFooterProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
  TableCaptionProps,
};
