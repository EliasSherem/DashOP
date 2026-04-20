interface Props {
  label: string;
}
export const SectionLabel = ({ label }: Props) => (
  <div className="absolute left-0 top-0 bottom-0 w-10 grid place-items-center pointer-events-none">
    <span className="vertical-tab text-foreground/85">{label}</span>
  </div>
);