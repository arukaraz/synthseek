import {
  widgetHeaderLead,
  widgetHeaderRow,
  widgetHeaderSkeletonIcon,
  widgetHeaderSkeletonSubtitle,
  widgetHeaderSkeletonTitle,
  widgetHeaderTitleStack,
} from "./styles";

export function WidgetHeaderSkeleton() {
  return (
    <div className={widgetHeaderRow()}>
      <div className={widgetHeaderLead()}>
        <span className={widgetHeaderSkeletonIcon()} />
        <div className={widgetHeaderTitleStack()}>
          <span className={widgetHeaderSkeletonTitle()} />
          <span className={widgetHeaderSkeletonSubtitle()} />
        </div>
      </div>
    </div>
  );
}
