type RequireLabelProps = {
  isRequired?: boolean;
};

export const RequireLabel = ({ isRequired }: RequireLabelProps) => {
  return <span>{isRequired ? "必須" : "任意"}</span>;
};
