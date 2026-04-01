type PageHeaderProps = {
  title: string;
  subtitle?: string;
  center?: boolean;
};

export function PageHeader({ title, subtitle, center = true }: PageHeaderProps) {
  return (
    <div className={`page-header ${center ? "text-center" : "text-left"}`}>
      <h1 className="page-title">{title}</h1>
      {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
    </div>
  );
}
